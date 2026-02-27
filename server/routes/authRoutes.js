// File: server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Endpoint: POST /api/auth/register
router.post('/register', register);

// Endpoint: POST /api/auth/login 
router.post('/login', login);

module.exports = router;