// File: server/controllers/authController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fungsi Register (Untuk membuat akun pertama)
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // 1. Hash (acak) password sebelum disimpan
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Simpan ke database
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role || 'kasir']
        );

        res.status(201).json({ message: 'User berhasil dibuat', user: newUser.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fungsi Login 
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Cari user berdasarkan email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Email tidak ditemukan' });
        }
        const user = userResult.rows[0];

        // 2. Cocokkan password yang diketik dengan password di database
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // 3. Buat JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token berlaku 1 hari
        );

        // 4. Kirim token ke frontend
        res.json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login };