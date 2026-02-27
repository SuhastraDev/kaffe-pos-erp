// File: server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, updateProfile } = require('../controllers/userController');

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/profile/:id', updateProfile);

module.exports = router;