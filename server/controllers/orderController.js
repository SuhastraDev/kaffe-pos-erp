const pool = require('../db/pool');

// Kita TIDAK lagi menggunakan require('xendit-node')
// Kita akan menggunakan 'fetch' bawaan Node.js v22 agar 100% stabil & tahan banting

const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { user_id, subtotal, discount, total, payment_method, amount_paid, change_amount, notes, items } = req.body;

        const date = new Date();
        const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
        const randomString = Math.floor(1000 + Math.random() * 9000);
        const order_number = `ORD-${dateString}-${randomString}`;

        const status = payment_method === 'cash' ? 'completed' : 'pending';

        // 1. REQUEST QRIS KE XENDIT TERLEBIH DAHULU (Praktik Paling Aman!)
        let qrStringData = '';
        if (payment_method === 'non-cash') {
            const secretKey = process.env.XENDIT_SECRET_KEY + ':';
            const base64Key = Buffer.from(secretKey).toString('base64'); // Format keamanan wajib Xendit

            // Menembak langsung ke server Xendit menggunakan fetch bawaan Node.js
            const xenditResponse = await fetch('https://api.xendit.co/qr_codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-version': '2022-07-31',
                    'Authorization': `Basic ${base64Key}`
                },
                body: JSON.stringify({
                    reference_id: order_number,
                    type: 'DYNAMIC',
                    currency: 'IDR',
                    amount: Number(total)
                })
            });

            const qrData = await xenditResponse.json();

            // Jika API Key salah atau error dari Xendit
            if (!xenditResponse.ok) {
                // Melempar error agar ditangkap blok CATCH di bawah
                throw new Error(qrData.message || 'Gagal generate QRIS dari Xendit');
            }
            
            // Simpan sandi QRIS asli dari Xendit
            qrStringData = qrData.qr_string;
        }

        // 2. JIKA XENDIT SUKSES (ATAU PEMBAYARAN TUNAI), BARU SIMPAN KE DATABASE
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, order_number`,
            [user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, notes, status]
        );
        const order = orderResult.rows[0];

        for (let item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [order.id, item.product_id, item.name || item.product_name, item.price, item.qty || item.quantity, item.price * (item.qty || item.quantity)]
            );
            // Kurangi stok produk
            await client.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [item.qty || item.quantity, item.product_id]);
        }
        await client.query('COMMIT');

        // 3. KEMBALIKAN RESPON KE HALAMAN POS (REACT)
        if (payment_method === 'non-cash') {
            return res.status(201).json({
                message: 'Menunggu Pembayaran',
                order_id: order.id,
                order_number: order.order_number,
                qr_string: qrStringData
            });
        }

        res.status(201).json({
            message: 'Transaksi berhasil',
            order_id: order.id,
            order_number: order.order_number
        });

    } catch (error) {
        // Jika terjadi error di Xendit atau Database, batalkan semua perubahan!
        await client.query('ROLLBACK');
        console.error("Order Error: ", error.message);
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
};

// --- FUNGSI-FUNGSI LAINNYA TETAP SAMA ---

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orderQuery = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderQuery.rows.length === 0) return res.status(404).json({ message: 'Order tidak ditemukan' });

        const itemsQuery = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
        
        res.json({
            ...orderQuery.rows[0],
            items: itemsQuery.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderHistory = async (req, res) => {
    const { user_id } = req.params;
    try {
        const query = `
            SELECT o.*, 
            COALESCE(
                (SELECT json_agg(json_build_object('name', oi.product_name, 'qty', oi.quantity)) 
                 FROM order_items oi WHERE oi.order_id = o.id), 
                '[]'
            ) as items
            FROM orders o 
            WHERE o.user_id = $1 
            ORDER BY o.created_at DESC
        `;
        const result = await pool.query(query, [user_id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const query = `
            SELECT o.*, u.name as cashier_name,
            COALESCE(
                (SELECT json_agg(json_build_object('name', oi.product_name, 'qty', oi.quantity)) 
                 FROM order_items oi WHERE oi.order_id = o.id), 
                '[]'
            ) as items
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- UBAH FUNGSI INI ---
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Hapus updated_at = NOW(), cukup update statusnya saja
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        res.json({ message: 'Status transaksi diperbarui' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT status FROM orders WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Order tidak ditemukan' });
        
        res.json({ status: result.rows[0].status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const xenditWebhook = async (req, res) => {
    try {
        const { data, event } = req.body;
        if (event === 'qr.payment' && data.status === 'COMPLETED') {
            const order_number = data.reference_id;
            // Hapus updated_at = NOW(), cukup update statusnya saja
            await pool.query(
                'UPDATE orders SET status = $1 WHERE order_number = $2', 
                ['completed', order_number]
            );
        }
        res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { createOrder, getOrderById, getOrderHistory, getAllOrders, updateOrderStatus, checkOrderStatus, xenditWebhook };