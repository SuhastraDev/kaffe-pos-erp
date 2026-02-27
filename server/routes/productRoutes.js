// File: server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware'); // Import multer

router.get('/', getProducts);

// Kita tambahkan upload.single('image') sebelum masuk ke controller
// 'image' adalah nama field di form saat upload file nantinya
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);

router.delete('/:id', deleteProduct);

module.exports = router;