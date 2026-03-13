const express = require('express');
const { verifyToken, authorizeTag } = require('../middleware/authMiddleware');
const { completeProfile } = require('../controllers/studentController');

const router = express.Router();

// PUT /api/student/complete-profile
// Only students can complete their own profile
router.put(
    '/complete-profile',
    verifyToken,
    authorizeTag(['Student', 'CR']),
    completeProfile
);

module.exports = router;
