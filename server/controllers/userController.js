// File: server/controllers/userController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');

// GET Semua User (Kecuali password agar aman)
const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id DESC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST Tambah User Baru
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Enkripsi password sebelum disimpan
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_active',
            [name, email, hashedPassword, role || 'kasir']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        // Tangkap error jika email sudah terdaftar
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email sudah digunakan!' });
        }
        res.status(500).json({ message: error.message });
    }
};

// PUT Update User (Edit nama, role, atau status aktif)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, role, is_active } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, role = $2, is_active = $3, updated_at = NOW() WHERE id = $4 RETURNING id, name, email, role, is_active',
            [name, role, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE Hapus User (Opsional, disarankan cukup ubah is_active menjadi false)
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { id } = req.params;
    const { name, password } = req.body;
    try {
        let result;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            result = await pool.query(
                'UPDATE users SET name = $1, password = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role',
                [name, hashedPassword, id]
            );
        } else {
            result = await pool.query(
                'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
                [name, id]
            );
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Pastikan module.exports diubah menjadi:
module.exports = { getUsers, createUser, updateUser, deleteUser, updateProfile };

