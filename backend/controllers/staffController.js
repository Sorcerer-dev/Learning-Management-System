const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/staff/my-department-students
// Fetches all students belonging to the authenticated staff member's department
const getMyDepartmentStudents = async (req, res) => {
    try {
        const staffDeptId = req.user.deptId;

        if (!staffDeptId) {
            return res.status(400).json({ error: 'Department ID not found for this user.' });
        }

        // We find all StudentProfiles where the attached User has the same deptId
        const students = await prisma.studentProfile.findMany({
            where: {
                user: {
                    deptId: staffDeptId
                }
            },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true
                    }
                }
            },
            orderBy: {
                regNo: 'asc'
            }
        });

        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching department students:', error);
        res.status(500).json({ error: 'Failed to fetch department students' });
    }
};

module.exports = {
    getMyDepartmentStudents
};
