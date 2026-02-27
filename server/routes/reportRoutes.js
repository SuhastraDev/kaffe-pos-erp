// File: server/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getTopProducts, getSalesReport } = require('../controllers/reportController');

router.get('/dashboard', getDashboardStats);
router.get('/top-products', getTopProducts);
router.get('/sales', getSalesReport);

module.exports = router;