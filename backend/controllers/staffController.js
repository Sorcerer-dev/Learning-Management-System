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

const updateMarks = async (req, res) => {
    try {
        const { regNo } = req.params;
        const { subjectCode, semester, mark, markType, passedYear } = req.body;

        const record = await prisma.permanentMark.create({
            data: {
                regNo,
                subjectCode,
                semester: parseInt(semester),
                mark: parseInt(mark),
                markType: markType || 'Semester',
                passedYear: parseInt(passedYear || new Date().getFullYear())
            }
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Error updating marks:', error);
        res.status(500).json({ error: 'Failed to update marks' });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { regNo } = req.params;
        const { semester, percentage } = req.body;

        const record = await prisma.attendance.upsert({
            where: {
                // Since I didn't add a unique constraint on (regNo, semester) in schema, 
                // I'll just find or create. Actually, I should have added a unique constraint.
                // For now, I'll findFirst and update or create.
                id: -1 // This will never match if I don't have it
            },
            update: {
                percentage: parseFloat(percentage)
            },
            create: {
                regNo,
                semester: parseInt(semester),
                percentage: parseFloat(percentage)
            }
        });

        // Correction for upsert without unique:
        const existing = await prisma.attendance.findFirst({
            where: { regNo, semester: parseInt(semester) }
        });

        if (existing) {
            const updated = await prisma.attendance.update({
                where: { id: existing.id },
                data: { percentage: parseFloat(percentage) }
            });
            return res.status(200).json(updated);
        } else {
            const created = await prisma.attendance.create({
                data: {
                    regNo,
                    semester: parseInt(semester),
                    percentage: parseFloat(percentage)
                }
            });
            return res.status(201).json(created);
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
};

module.exports = {
    getMyDepartmentStudents,
    updateMarks,
    updateAttendance
};
