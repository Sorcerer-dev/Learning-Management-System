const express = require('express');
const { verifyToken, authorizeTag } = require('../middleware/authMiddleware');
const { getMyDepartmentStudents } = require('../controllers/staffController');

const router = express.Router();

// GET /api/staff/my-department-students
// Only staff tags (HOD, Mentor, Advisor) should access this
router.get(
    '/my-department-students',
    verifyToken,
    authorizeTag(['HOD', 'Mentor', 'Advisor', 'Principal']),
    getMyDepartmentStudents
);

module.exports = router;
