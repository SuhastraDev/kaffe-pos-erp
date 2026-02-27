// File: server/controllers/stockController.js
const pool = require('../db/pool');

// GET Semua Produk beserta informasi stoknya
const getStocks = async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.name, p.stock, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.stock ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET Riwayat Perubahan Stok (Logs)
const getStockLogs = async (req, res) => {
    try {
        const query = `
            SELECT sl.*, p.name as product_name, u.name as user_name
            FROM stock_logs sl
            JOIN products p ON sl.product_id = p.id
            LEFT JOIN users u ON sl.user_id = u.id
            ORDER BY sl.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST Tambah Stok Barang (Restock)
const addStock = async (req, res) => {
    const { product_id, user_id, quantity, note } = req.body;
    
    // Gunakan transaksi agar update produk dan insert log sukses bersamaan
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Tambah stok di tabel products
        await client.query(
            'UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2',
            [quantity, product_id]
        );

        // 2. Catat ke tabel stock_logs
        await client.query(
            'INSERT INTO stock_logs (product_id, user_id, type, quantity, note) VALUES ($1, $2, $3, $4, $5)',
            [product_id, user_id, 'in', quantity, note || 'Restock Manual']
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Stok berhasil ditambahkan' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Gagal menambah stok: ' + error.message });
    } finally {
        client.release();
    }
};

module.exports = { getStocks, getStockLogs, addStock };