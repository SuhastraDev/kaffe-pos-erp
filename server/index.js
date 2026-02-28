// File: server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db/pool');

const app = express();

// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json()); // Agar bisa membaca body request format JSON
app.use('/uploads', express.static('uploads')); // Jadikan folder uploads bisa diakses publik secara statis

// Import Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const stockRoutes = require('./routes/stockRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const hrRoutes = require('./routes/hrRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Gunakan Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);

// Test Koneksi Database
pool.connect()
  .then(() => console.log('✅ Terhubung ke database PostgreSQL'))
  .catch((err) => console.error('❌ Gagal terhubung ke database:', err.message));

// Test Endpoint Dasar
app.get('/', (req, res) => {
    res.send('Server POS API Berjalan!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;