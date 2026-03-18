const express = require('express');
const { verifyToken, authorizeTag } = require('../middleware/authMiddleware');
const { getMyDepartmentStudents, updateMarks, updateAttendance } = require('../controllers/staffController');

const router = express.Router();

// GET /api/staff/my-department-students
// Only staff tags (HOD, Mentor, Advisor) should access this
router.get(
    '/my-department-students',
    verifyToken,
    authorizeTag(['HOD', 'Mentor', 'Advisor', 'Principal']),
    getMyDepartmentStudents
);

// POST /api/staff/students/:regNo/marks
router.post(
    '/students/:regNo/marks',
    verifyToken,
    authorizeTag(['HOD', 'Mentor', 'Advisor', 'Staff']),
    updateMarks
);

// POST /api/staff/students/:regNo/attendance
router.post(
    '/students/:regNo/attendance',
    verifyToken,
    authorizeTag(['HOD', 'Mentor', 'Advisor', 'Staff']),
    updateAttendance
);

module.exports = router;
