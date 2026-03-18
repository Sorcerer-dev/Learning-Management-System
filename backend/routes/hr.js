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
    editStaff,
    deactivateStaff,
    addStudentManual,
    addAdmin,
    getAnalytics,
    editStudent,
    getStudentById,
    getStaffById,
    getAllAdmins,
    getBatches,
    addBatch,
    getDepartments,
    addDepartment,
    updateFees,
    toggleProfileLock
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

// GET /api/hr/admins
router.get(
    '/admins',
    verifyToken,
    authorizeTag(['HR', 'Admin', 'Dean']),
    getAllAdmins
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

// GET /api/hr/students/:id
router.get(
    '/students/:id',
    verifyToken,
    authorizeTag(['HR', 'Dean', 'Admin']),
    getStudentById
);

// PATCH /api/hr/students/:id/status — Soft-deactivate a student
router.patch(
    '/students/:id/status',
    verifyToken,
    authorizeTag(['HR']),
    deleteStudent
);

// PUT /api/hr/students/:id — Edit student details
router.put(
    '/students/:id',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    editStudent
);

// PUT /api/hr/students/:id/fees — Update student fees
router.put(
    '/students/:id/fees',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    updateFees
);

// PATCH /api/hr/students/:id/lock-profile — Toggle profile lock
router.patch(
    '/students/:id/lock-profile',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    toggleProfileLock
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

// GET /api/hr/staff/:id
router.get(
    '/staff/:id',
    verifyToken,
    authorizeTag(['HR', 'Admin', 'Dean']),
    getStaffById
);

// POST /api/hr/staff — Create new staff member
router.post(
    '/staff',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    addStaff
);

// PUT /api/hr/staff/:id — Edit staff details (name, email, dept, designation, salary, phone)
router.put(
    '/staff/:id',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    editStaff
);

// PUT /api/hr/staff/:id/status — Deactivate a staff member
router.put(
    '/staff/:id/status',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    deactivateStaff
);

// POST /api/hr/students/manual
router.post(
    '/students/manual',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    addStudentManual
);

// Batch Routes
router.get(
    '/batches',
    verifyToken,
    authorizeTag(['HR', 'Admin', 'Dean', 'Staff', 'Student']),
    getBatches
);

router.post(
    '/batches',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    addBatch
);

// Department Routes
router.get(
    '/departments',
    verifyToken,
    authorizeTag(['HR', 'Admin', 'Dean', 'Staff', 'Student']),
    getDepartments
);

router.post(
    '/departments',
    verifyToken,
    authorizeTag(['HR', 'Admin']),
    addDepartment
);

module.exports = router;
