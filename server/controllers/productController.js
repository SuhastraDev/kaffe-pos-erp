// File: server/controllers/productController.js
const pool = require('../db/pool');

// GET semua produk (digabung dengan nama kategorinya)
const getProducts = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST tambah produk baru
const createProduct = async (req, res) => {
    // Ambil data teks dari form
    const { category_id, name, description, price, stock, is_available } = req.body;
    
    // Ambil path file foto jika ada yang diupload (diatur oleh multer)
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const result = await pool.query(
            'INSERT INTO products (category_id, name, description, price, stock, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [
                category_id, 
                name, 
                description, 
                price, 
                stock || 0, 
                image_url, 
                is_available !== undefined ? is_available : true
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT update produk
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { category_id, name, description, price, stock, is_available } = req.body;
    
    try {
        // Cek produk lama untuk melihat apakah ada foto lama
        const oldProduct = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
        if (oldProduct.rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        let image_url = oldProduct.rows[0].image_url;
        
        // Jika ada foto baru yang diupload, ganti URL-nya
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const result = await pool.query(
            'UPDATE products SET category_id = $1, name = $2, description = $3, price = $4, stock = $5, image_url = $6, is_available = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
            [category_id, name, description, price, stock, image_url, is_available, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE hapus produk
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };