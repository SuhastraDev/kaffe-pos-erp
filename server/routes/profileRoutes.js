const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, requestOTP, verifyAndChangePassword } = require('../controllers/profileController');

router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.post('/request-otp', requestOTP);
router.post('/reset-password', verifyAndChangePassword);

module.exports = router;