const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/stats/dashboard
// Returns live counts for all dashboard KPI cards
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalStudents,
            activeStudents,
            inactiveStudents,
            totalStaff,
            activeStaff,
            totalArrears,
        ] = await Promise.all([
            prisma.user.count({ where: { userType: 'Student' } }),
            prisma.user.count({ where: { userType: 'Student', status: 'Active' } }),
            prisma.user.count({ where: { userType: 'Student', status: 'Inactive' } }),
            prisma.user.count({ where: { userType: 'Staff' } }),
            prisma.user.count({ where: { userType: 'Staff', status: 'Active' } }),
            prisma.arrearTransit.count({ where: { isCleared: false } }),
        ]);

        return res.status(200).json({
            totalStudents,
            activeStudents,
            inactiveStudents,
            totalStaff,
            activeStaff,
            totalArrears,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

module.exports = { getDashboardStats };
