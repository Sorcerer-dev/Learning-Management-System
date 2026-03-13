const express = require('express');
const multer = require('multer');
const { verifyToken, authorizeTag } = require('../middleware/authMiddleware');
const { bulkUploadStudents } = require('../controllers/bulkUploadController');
const {
    getAllStudents,
    deleteStudent,
    getHRStats,
    getAllStaff,
    addStaff,
    addStudentManual,
    addAdmin,
    getAnalytics
} = require('../controllers/hrController');

const router = express.Router();

// GET /api/hr/analytics
router.get(
    '/analytics',
    verifyToken,
    authorizeTag(['HR', 'Admin', 'Dean']),
    getAnalytics
);

// POST /api/hr/admin
router.post(
    '/admin',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    addAdmin
);

// Configure multer to store files in memory (perfect for quick parsing without disk writing)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

// POST /api/hr/bulk-upload
// Protected route: Only HR (and alternatively Dean if desired) can hit this endpoint
router.post(
    '/bulk-upload',
    verifyToken,
    authorizeTag(['HR']),
    upload.single('file'),
    bulkUploadStudents
);

// GET /api/hr/students
// Fetch all students
router.get(
    '/students',
    verifyToken,
    authorizeTag(['HR']),
    getAllStudents
);

// PUT /api/hr/students/:id/status
// Soft delete a student
router.put(
    '/students/:id/status',
    verifyToken,
    authorizeTag(['HR']),
    deleteStudent
);

// GET /api/hr/stats
router.get(
    '/stats',
    verifyToken,
    authorizeTag(['HR', 'Admin', 'Dean']),
    getHRStats
);

// GET /api/hr/staff
router.get(
    '/staff',
    verifyToken,
    authorizeTag(['HR', 'Admin', 'Dean']),
    getAllStaff
);

// POST /api/hr/staff
router.post(
    '/staff',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    addStaff
);

// POST /api/hr/students/manual
router.post(
    '/students/manual',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    addStudentManual
);

module.exports = router;
