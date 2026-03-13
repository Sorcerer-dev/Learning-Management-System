const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

const bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 1. Read the uploaded Excel file from buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 2. Convert to JSON with empty rows stripped
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) {
            return res.status(400).json({ error: 'The uploaded file is empty' });
        }

        const report = {
            total: rows.length,
            success: 0,
            skipped: 0,
            errors: []
        };

        // 3. Process each row sequentially to handle Prisma Transactions properly
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // +1 for 0-index, +1 for header row

            // Extract fields (matching the provided template headers)
            const name = String(row['Name'] || '').trim();
            const email = String(row['Email'] || '').toLowerCase().trim();
            const regNo = String(row['RegNo'] || '').trim();
            const batchId = String(row['Batch'] || '').trim();
            const deptId = String(row['Department'] || '').trim();
            const admissionType = String(row['AdmissionType'] || 'Counseling').trim();

            if (!name || !email || !regNo || !batchId || !deptId) {
                report.skipped++;
                report.errors.push(`Row ${rowNum}: Missing required fields`);
                continue;
            }

            // 4. Validate against existing records (Email or RegNo)
            const existingUser = await prisma.user.findUnique({ where: { email } });
            const existingStudent = await prisma.studentProfile.findUnique({ where: { regNo } });

            if (existingUser || existingStudent) {
                report.skipped++;
                report.errors.push(`Row ${rowNum}: Student already exists (RegNo: ${regNo} or Email: ${email})`);
                continue;
            }

            // 5. Create User & Profile in a Transaction
            try {
                const hashedPassword = await bcrypt.hash('Welcome@123', 10);

                await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        userType: 'Student',
                        tagAccess: 'Student',
                        deptId,
                        status: 'Active',
                        studentProfile: {
                            create: {
                                regNo,
                                name,
                                batchId,
                                admissionType,
                                profileLocked: false
                            }
                        }
                    }
                });

                report.success++;
            } catch (err) {
                console.error(`Error processing row ${rowNum}:`, err);
                report.skipped++;
                report.errors.push(`Row ${rowNum}: Internal database error`);
            }
        }

        return res.status(200).json({
            message: `Processed ${report.total} students`,
            data: report
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return res.status(500).json({ error: 'An error occurred while processing the file' });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const { batch, dept } = req.query;
        let whereClause = {};

        if (batch) whereClause.batchId = batch;
        if (dept) {
            whereClause.user = { is: { deptId: dept } };
        }

        const students = await prisma.studentProfile.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                        deptId: true
                    }
                }
            }
        });

        const formattedStudents = students.map(s => ({
            id: s.regNo,
            name: s.name,
            email: s.user?.email,
            department: s.user?.deptId,
            batch: s.batchId,
            status: s.user?.status,
            admissionType: s.admissionType
        }));

        return res.status(200).json(formattedStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ error: 'Failed to fetch students' });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await prisma.studentProfile.findUnique({
            where: { regNo: id },
            include: { user: true }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await prisma.user.update({
            where: { id: student.userId },
            data: { status: 'Inactive' }
        });

        return res.status(200).json({ message: 'Student successfully deactivated' });

    } catch (error) {
        console.error('Error deactivating student:', error);
        return res.status(500).json({ error: 'Failed to deactivate student' });
    }
};

const getHRStats = async (req, res) => {
    try {
        const [totalStudents, activeStaff, inactiveUsers] = await Promise.all([
            prisma.user.count({ where: { userType: 'Student' } }),
            prisma.user.count({ where: { userType: 'Staff', status: 'Active' } }),
            prisma.user.count({ where: { status: 'Inactive' } }),
        ]);

        return res.status(200).json({
            totalStudents,
            activeStaff,
            inactiveUsers
        });
    } catch (error) {
        console.error('Error fetching HR stats:', error);
        return res.status(500).json({ error: 'Failed to fetch HR stats' });
    }
};

const getAllStaff = async (req, res) => {
    try {
        const { dept, designation } = req.query;
        let whereClause = {};

        if (dept) whereClause.deptId = dept;
        if (designation) {
            whereClause.user = { is: { tagAccess: designation } };
        }

        const staff = await prisma.staffProfile.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                        tagAccess: true
                    }
                }
            }
        });

        // Determine if requester is HR or Dean
        const canViewSalary = ['HR', 'Dean', 'Admin'].includes(req.user.tagAccess);

        const formattedStaff = staff.map(s => ({
            id: s.staffId,
            name: s.name,
            email: s.user?.email,
            department: s.deptId,
            designation: s.user?.tagAccess,
            status: s.user?.status,
            salary: canViewSalary ? s.salary : undefined,
            doj: s.doj,
            phone: s.phone
        }));

        return res.status(200).json(formattedStaff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return res.status(500).json({ error: 'Failed to fetch staff' });
    }
};

const addStaff = async (req, res) => {
    try {
        const { name, email, staffId, deptId, designation, salary } = req.body;

        if (!name || !email || !staffId || !deptId || !designation) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        const existingStaff = await prisma.staffProfile.findUnique({ where: { staffId } });

        if (existingUser || existingStaff) {
            return res.status(400).json({ error: 'Staff with this email or ID already exists' });
        }

        const hashedPassword = await bcrypt.hash('Welcome@123', 10);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    userType: 'Staff',
                    tagAccess: designation, // HOD, Advisor, Mentor, etc.
                    deptId,
                    status: 'Active'
                }
            });

            await tx.staffProfile.create({
                data: {
                    staffId,
                    userId: user.id,
                    name,
                    deptId,
                    salary: salary ? parseFloat(salary) : null
                }
            });
        });

        return res.status(201).json({ message: 'Staff created successfully' });
    } catch (error) {
        console.error('Error adding staff:', error);
        return res.status(500).json({ error: 'Failed to add staff' });
    }
};

const addStudentManual = async (req, res) => {
    try {
        const { name, email, regNo, batchId, deptId, admissionType } = req.body;

        if (!name || !email || !regNo || !batchId || !deptId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        const existingStudent = await prisma.studentProfile.findUnique({ where: { regNo } });

        if (existingUser || existingStudent) {
            return res.status(400).json({ error: 'Student with this email or RegNo already exists' });
        }

        const hashedPassword = await bcrypt.hash('Welcome@123', 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                userType: 'Student',
                tagAccess: 'Student',
                deptId,
                status: 'Active',
                studentProfile: {
                    create: {
                        regNo,
                        name,
                        batchId,
                        admissionType: admissionType || 'Counseling',
                        profileLocked: false
                    }
                }
            }
        });

        return res.status(201).json({ message: 'Student created successfully' });
    } catch (error) {
        console.error('Error adding student:', error);
        return res.status(500).json({ error: 'Failed to add student' });
    }
};

const addAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                userType: 'Staff',
                tagAccess: 'Admin',
                status: 'Active'
            }
        });

        return res.status(201).json({ message: 'Admin added successfully' });
    } catch (error) {
        console.error('Error adding admin:', error);
        return res.status(500).json({ error: 'Failed to add admin' });
    }
};

const getAnalytics = async (req, res) => {
    try {
        // studentsByDept
        const studentUsers = await prisma.user.groupBy({
            by: ['deptId'],
            where: { userType: 'Student', deptId: { not: null } },
            _count: { id: true }
        });

        const studentsByDept = studentUsers.map(u => ({
            name: u.deptId,
            value: u._count.id
        }));

        // batchTrends
        const studentProfiles = await prisma.studentProfile.groupBy({
            by: ['batchId'],
            _count: { regNo: true },
            orderBy: { batchId: 'asc' }
        });

        const batchTrends = studentProfiles.map(b => ({
            name: b.batchId,
            students: b._count.regNo
        }));

        // staffByDeptRole
        const staffProfiles = await prisma.staffProfile.findMany({
            include: { user: { select: { tagAccess: true } } }
        });

        const staffMap = {};
        staffProfiles.forEach(s => {
            const dept = s.deptId;
            const role = s.user?.tagAccess || 'Unknown';
            if (!staffMap[dept]) staffMap[dept] = { dept };
            staffMap[dept][role] = (staffMap[dept][role] || 0) + 1;
        });
        const staffByDeptRole = Object.values(staffMap);

        return res.status(200).json({
            studentsByDept,
            batchTrends,
            staffByDeptRole
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

module.exports = {
    bulkUploadStudents,
    getAllStudents,
    deleteStudent,
    getHRStats,
    getAllStaff,
    addStaff,
    addStudentManual,
    addAdmin,
    getAnalytics
};
