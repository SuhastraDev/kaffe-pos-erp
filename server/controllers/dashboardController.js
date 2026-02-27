const pool = require('../db/pool');

const getAdminDashboard = async (req, res) => {
    try {
        // 1. Pendapatan & Pesanan Hari Ini
        const todayStats = await pool.query(`
            SELECT COALESCE(SUM(total), 0) as total_revenue, COUNT(id) as total_orders
            FROM orders WHERE DATE(created_at) = CURRENT_DATE
        `);

        // 2. Kehadiran Karyawan (DIPERBAIKI UNTUK SHIFT LINTAS HARI)
        const staffTotal = await pool.query(`SELECT COUNT(*) FROM users WHERE shift_id IS NOT NULL`);
        const staffPresent = await pool.query(`
            SELECT COUNT(DISTINCT user_id) FROM attendances 
            WHERE (date = CURRENT_DATE OR (date = CURRENT_DATE - INTERVAL '1 day' AND clock_out IS NULL))
            AND status IN ('ontime', 'late')
        `);

        // 3. Peringatan Stok
        const lowStock = await pool.query(`SELECT COUNT(*) FROM products WHERE stock <= 10 AND is_available = true`);

        // 4. Grafik Penjualan 7 Hari Terakhir
        const salesData = await pool.query(`
            SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date, COALESCE(SUM(total), 0) as daily_revenue
            FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC
        `);

        // 5. 5 Produk Terlaris
        const topProducts = await pool.query(`
            SELECT p.name as product_name, SUM(oi.quantity) as total_sold
            FROM order_items oi JOIN products p ON oi.product_id = p.id
            GROUP BY p.id ORDER BY total_sold DESC LIMIT 5
        `);

        // 6. Monitor Staf Live (DIPERBAIKI: Menarik data hari ini + data kemarin yang belum pulang)
       const liveStaff = await pool.query(`
            SELECT u.name, s.name as shift_name, a.clock_in, a.clock_out, a.status, a.notes, a.late_seconds
            FROM attendances a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN shifts s ON u.shift_id = s.id
            WHERE DATE(a.clock_in) = CURRENT_DATE 
               OR a.clock_out IS NULL 
            ORDER BY a.clock_in DESC
            LIMIT 10
        `);

        res.json({
            stats: {
                total_revenue: todayStats.rows[0].total_revenue,
                total_orders: todayStats.rows[0].total_orders,
                staff_total: staffTotal.rows[0].count,
                staff_present: staffPresent.rows[0].count,
                low_stock_count: lowStock.rows[0].count
            },
            sales_data: salesData.rows,
            top_products: topProducts.rows,
            live_staff: liveStaff.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminDashboard };