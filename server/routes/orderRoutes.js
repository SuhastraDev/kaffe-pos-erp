const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getOrderById, 
    getOrderHistory, 
    getAllOrders, 
    updateOrderStatus, 
    checkOrderStatus, 
    xenditWebhook 
} = require('../controllers/orderController');

// 1. Webhook Xendit (Pintu masuk otomatis dari server Xendit)
router.post('/webhook/xendit', xenditWebhook);

// 2. Ambil semua order (Untuk Laporan Admin)
router.get('/', getAllOrders);

// 3. Buat order baru (Checkout POS)
router.post('/', createOrder);

// 4. Ambil riwayat order kasir tertentu
router.get('/user/:user_id', getOrderHistory);

// 5. Rute untuk mengecek status (Auto-Polling React yang tadi error 404)
router.get('/:id/status', checkOrderStatus);

// 6. Rute untuk mengubah status manual (Tombol Bypass Simulasi)
router.put('/:id/status', updateOrderStatus);

// 7. Ambil detail order berdasarkan ID (PENTING: Harus ditaruh paling bawah agar tidak memblokir rute lain)
router.get('/:id', getOrderById);

module.exports = router;