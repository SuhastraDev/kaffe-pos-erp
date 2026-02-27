// File: server/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const { getStocks, getStockLogs, addStock } = require('../controllers/stockController');

router.get('/', getStocks);            // Ambil data stok saat ini
router.get('/logs', getStockLogs);     // Ambil riwayat/log stok
router.post('/add', addStock);         // Tambah stok baru

module.exports = router;