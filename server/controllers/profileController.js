const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// KONFIGURASI EMAIL (GANTI DENGAN EMAIL & APP PASSWORD KAMU)
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER, 
      pass: process.env.MAIL_PASS  
    }
});

// 1. Dapatkan Data Profil
const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Update Nama & Email (Khusus Admin)
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, id]);
        res.json({ message: 'Profil berhasil diperbarui!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Request OTP untuk Ganti Password
const requestOTP = async (req, res) => {
    try {
        const { id } = req.body;
        const userQuery = await pool.query('SELECT email, name FROM users WHERE id = $1', [id]);
        const user = userQuery.rows[0];

        if (!user || !user.email) {
            return res.status(400).json({ message: 'Email belum didaftarkan di akun ini! Hubungi Admin.' });
        }

        // Generate 6 digit angka random
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        // OTP kedaluwarsa dalam 10 menit
        const otpExpiry = new Date(Date.now() + 10 * 60000);

        await pool.query('UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3', [otpCode, otpExpiry, id]);

        // Kirim Email
        const mailOptions = {
            from: '"Kaffe POS Security" <no-reply@kaffepos.com>',
            to: user.email,
            subject: 'Kode Verifikasi Ubah Password',
            html: `<h3>Halo, ${user.name}</h3>
                   <p>Seseorang meminta perubahan password untuk akun Anda.</p>
                   <p>Berikut adalah kode OTP Anda: <strong style="font-size: 24px; color: #2563eb; letter-spacing: 2px;">${otpCode}</strong></p>
                   <p>Kode ini hanya berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Kode OTP telah dikirim ke email Anda!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengirim email. Periksa konfigurasi Nodemailer.' });
    }
};

// 4. Verifikasi OTP & Ubah Password
const verifyAndChangePassword = async (req, res) => {
    try {
        const { id, otp, newPassword } = req.body;
        
        const userQuery = await pool.query('SELECT otp_code, otp_expiry FROM users WHERE id = $1', [id]);
        const user = userQuery.rows[0];

        if (!user || user.otp_code !== otp) {
            return res.status(400).json({ message: 'Kode OTP salah!' });
        }
        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ message: 'Kode OTP sudah kedaluwarsa! Silakan request ulang.' });
        }

        // Enkripsi Password Baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password & hapus OTP
        await pool.query('UPDATE users SET password = $1, otp_code = NULL, otp_expiry = NULL WHERE id = $2', [hashedPassword, id]);
        
        res.json({ message: 'Password berhasil diubah! Silakan login kembali.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, updateProfile, requestOTP, verifyAndChangePassword };