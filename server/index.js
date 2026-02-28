// File: server/index.js
let app;
try {
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db/pool');

app = express();

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
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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

// Test Endpoint Dasar
app.get('/', (req, res) => {
    res.send('Server POS API Berjalan!');
});

// Debug endpoint
app.get('/api/debug', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        res.json({
            db_connected: true,
            server_time: result.rows[0].now,
            tables: tables.rows.map(r => r.table_name),
            env: {
                NODE_ENV: process.env.NODE_ENV || 'not set',
                DB_HOST: process.env.DB_HOST ? 'set' : 'missing',
                DB_USER: process.env.DB_USER ? 'set' : 'missing',
                DB_NAME: process.env.DB_NAME ? 'set' : 'missing',
                DB_PASSWORD: process.env.DB_PASSWORD ? 'set' : 'missing',
                DB_PORT: process.env.DB_PORT ? 'set' : 'missing',
                JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'missing',
            }
        });
    } catch (error) {
        res.status(500).json({
            db_connected: false,
            error: error.message,
            env: {
                NODE_ENV: process.env.NODE_ENV || 'not set',
                DB_HOST: process.env.DB_HOST ? 'set' : 'missing',
                DB_USER: process.env.DB_USER ? 'set' : 'missing',
                DB_NAME: process.env.DB_NAME ? 'set' : 'missing',
                DB_PASSWORD: process.env.DB_PASSWORD ? 'set' : 'missing',
                DB_PORT: process.env.DB_PORT ? 'set' : 'missing',
                JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'missing',
            }
        });
    }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

} catch (startupError) {
  // Jika ada error saat startup, buat app minimal yang menampilkan error
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      crash: true,
      error: startupError.message,
      stack: startupError.stack,
    });
  });
}

module.exports = app;