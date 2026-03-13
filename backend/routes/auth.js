const express = require('express');
const { login, getMe, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', getMe);

// PUT /api/auth/change-password
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
