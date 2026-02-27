// File: server/controllers/reportController.js
const pool = require('../db/pool');

// 1. Ambil Statistik Dashboard (Total Penjualan Hari Ini)
const getDashboardStats = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(id) as total_orders,
                COALESCE(SUM(total), 0) as total_revenue
            FROM orders 
            WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Ambil 5 Produk Terlaris
const getTopProducts = async (req, res) => {
    try {
        const query = `
            SELECT product_name, SUM(quantity) as total_sold
            FROM order_items
            JOIN orders ON order_items.order_id = orders.id
            WHERE orders.status = 'completed'
            GROUP BY product_name
            ORDER BY total_sold DESC
            LIMIT 5
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Ambil Laporan Penjualan (Bisa difilter berdasarkan tanggal)
const getSalesReport = async (req, res) => {
    // Ambil parameter tanggal dari URL (query string)
    const { start_date, end_date } = req.query;
    
    try {
        let query = `
            SELECT 
                DATE(created_at) as date, 
                COUNT(id) as total_orders, 
                SUM(total) as daily_revenue
            FROM orders 
            WHERE status = 'completed'
        `;
        const values = [];

        // Jika Admin memilih filter tanggal
        if (start_date && end_date) {
            query += ` AND DATE(created_at) >= $1 AND DATE(created_at) <= $2`;
            values.push(start_date, end_date);
        }

        query += ` GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`;

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getTopProducts, getSalesReport };