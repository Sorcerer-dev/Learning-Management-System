const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/statsController');

const router = express.Router();

// GET /api/stats/dashboard
// Any authenticated user can fetch dashboard stats
router.get('/dashboard', verifyToken, getDashboardStats);

module.exports = router;
