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

            // 5. Create Batch if it doesn't exist
            try {
                await prisma.batch.upsert({
                    where: { id: batchId },
                    update: {},
                    create: { id: batchId, name: batchId }
                });
            } catch (err) {
                console.error(`Error ensuring batch ${batchId} exists:`, err);
            }

            // 6. Create User & Profile in a Transaction
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
            orderBy: {
                user: {
                    createdAt: 'desc'
                }
            },
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
            admissionType: s.admissionType,
            parentName: s.parentName || null,
            parentContact: s.parentContact || null
        }));

        return res.status(200).json(formattedStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ error: 'Failed to fetch students' });
    }
};

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma.studentProfile.findUnique({
            where: { regNo: id },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                        createdAt: true
                    }
                },
                marks: true,
                arrears: true,
                mentor: true,
                advisor: true
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        return res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student by ID:', error);
        return res.status(500).json({ error: 'Failed to fetch student details' });
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

        const newStatus = student.user.status === 'Active' ? 'Inactive' : 'Active';
        await prisma.user.update({
            where: { id: student.userId },
            data: { status: newStatus }
        });

        return res.status(200).json({ message: `Student successfully ${newStatus === 'Active' ? 'activated' : 'deactivated'}` });

    } catch (error) {
        console.error('Error toggling student status:', error);
        return res.status(500).json({ error: 'Failed to toggle student status' });
    }
};

const editStudent = async (req, res) => {
    try {
        const { id } = req.params; // regNo
        const { name, email, department, batch, admissionType, parentContact } = req.body;

        const student = await prisma.studentProfile.findUnique({
            where: { regNo: id },
            include: { user: true }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: student.userId },
                data: {
                    ...(email && email !== student.user.email ? { email } : {}),
                    ...(department ? { deptId: department } : {}),
                }
            });

            await tx.studentProfile.update({
                where: { regNo: id },
                data: {
                    ...(name ? { name } : {}),
                    ...(batch ? { batchId: batch } : {}),
                    ...(admissionType ? { admissionType } : {}),
                    ...(parentContact !== undefined ? { parentContact: parentContact || null } : {}),
                }
            });
        });

        return res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error editing student:', error);
        return res.status(500).json({ error: 'Failed to update student' });
    }
};

const getHRStats = async (req, res) => {
    try {
        const [totalStudents, activeStaff, inactiveUsers, totalAdmins] = await Promise.all([
            prisma.user.count({ where: { userType: 'Student' } }),
            prisma.user.count({ where: { userType: 'Staff', status: 'Active' } }),
            prisma.user.count({ where: { status: 'Inactive' } }),
            prisma.user.count({ 
                where: { 
                    OR: [
                        { tagAccess: { contains: 'Admin' } },
                        { tagAccess: { contains: 'HR' } },
                        { tagAccess: { contains: 'Dean' } },
                        { tagAccess: { contains: 'Principal' } }
                    ],
                    status: 'Active' 
                } 
            }),
        ]);

        return res.status(200).json({
            totalStudents,
            activeStaff,
            inactiveUsers,
            totalAdmins
        });
    } catch (error) {
        console.error('Error fetching HR stats:', error);
        return res.status(500).json({ error: 'Failed to fetch HR stats' });
    }
};

const getAllStaff = async (req, res) => {
    try {
        const { dept, designation } = req.query;
        let whereClause = {
            user: {
                AND: [
                    { tagAccess: { not: { contains: 'Admin' } } },
                    { tagAccess: { not: { contains: 'HR' } } },
                    { tagAccess: { not: { contains: 'Dean' } } },
                    { tagAccess: { not: { contains: 'Principal' } } }
                ]
            }
        };

        if (dept) whereClause.deptId = dept;
        if (designation) whereClause.user = { ...whereClause.user, tagAccess: { contains: designation } };

        const staffMembers = await prisma.staffProfile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { email: true, status: true, tagAccess: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Map to flat structure for the frontend table
        const formattedStaff = staffMembers.map(staff => {
            let category = 'Staff';
            if (staff.user?.tagAccess?.includes('Admin')) category = 'Admin';
            else if (staff.user?.tagAccess?.includes('HR')) category = 'HR';

            return {
                id: staff.staffId,
                name: staff.name,
                email: staff.user?.email,
                department: staff.deptId,
                designation: staff.designation || staff.user?.tagAccess,
                category: category,
                functionalTags: staff.designation ? staff.designation.split(',').map(s => s.trim()) : [],
                salary: staff.salary,
                status: staff.user?.status,
                phone: staff.phone
            };
        });

        return res.status(200).json(formattedStaff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return res.status(500).json({ error: 'Failed to fetch staff list' });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                OR: [
                    { tagAccess: { contains: 'Admin' } },
                    { tagAccess: { contains: 'HR' } },
                    { tagAccess: { contains: 'Dean' } },
                    { tagAccess: { contains: 'Principal' } }
                ]
            },
            include: {
                staffProfile: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedAdmins = admins.map(admin => ({
            id: admin.staffProfile?.staffId || admin.id,
            userId: admin.id,
            email: admin.email,
            tagAccess: admin.tagAccess,
            role: admin.tagAccess,
            designation: admin.staffProfile?.designation || admin.tagAccess,
            status: admin.status,
            name: admin.staffProfile?.name || 'Admin User',
            department: admin.staffProfile?.deptId || 'Admin Office',
            phone: admin.staffProfile?.phone || '-'
        }));

        return res.status(200).json(formattedAdmins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        return res.status(500).json({ error: 'Failed to fetch admins list' });
    }
};

const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await prisma.staffProfile.findUnique({
            where: { staffId: id },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                        createdAt: true,
                        tagAccess: true
                    }
                },
                mentees: true,
                advisedBatch: true
            }
        });

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        return res.status(200).json(staff);
    } catch (error) {
        console.error('Error fetching staff by ID:', error);
        return res.status(500).json({ error: 'Failed to fetch staff details' });
    }
};

const addStaff = async (req, res) => {
    try {
        const { name, email, staffId, deptId, designation, category, adminRoleName, functionalTags, salary } = req.body;

        if (!name || !email || !staffId || !deptId || !category) {
            const missing = [];
            if(!name) missing.push('name');
            if(!email) missing.push('email');
            if(!staffId) missing.push('staffId');
            if(!deptId) missing.push('deptId');
            if(!category) missing.push('category');
            return res.status(400).json({ error: 'Missing required fields: ' + missing.join(', ') });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        const existingStaff = await prisma.staffProfile.findUnique({ where: { staffId } });

        if (existingUser || existingStaff) {
            return res.status(400).json({ error: 'Staff with this email or ID already exists' });
        }

        const hashedPassword = await bcrypt.hash('Welcome@123', 10);

        // Calculate tagAccess based on category
        let calculatedTagAccess = 'Staff'; // Default for 'Staff' category 
        let calculatedDesignation = null;

        if (req.body.category === 'Admin') {
            calculatedTagAccess = 'Admin';
            calculatedDesignation = req.body.adminRoleName; // e.g. Principal, Dean
        } else if (req.body.category === 'HR') {
            calculatedTagAccess = 'HR';
            calculatedDesignation = 'HR';
        } else if (req.body.category === 'Staff') {
            const tags = Array.isArray(req.body.functionalTags) ? req.body.functionalTags : [];
            calculatedTagAccess = tags.length > 0 ? `Staff,${tags.join(',')}` : 'Staff';
            calculatedDesignation = tags.length > 0 ? tags.join(', ') : null;
        }

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    userType: 'Staff',
                    tagAccess: calculatedTagAccess,
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
                    designation: calculatedDesignation,
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
        const { name, email, regNo, batchId, deptId, admissionType, parentName, parentContact } = req.body;

        if (!name || !email || !regNo || !batchId || !deptId) {
            const missing = [];
            if(!name) missing.push('name');
            if(!email) missing.push('email');
            if(!regNo) missing.push('regNo');
            if(!batchId) missing.push('batchId');
            if(!deptId) missing.push('deptId');
            return res.status(400).json({ error: 'Missing required fields: ' + missing.join(', ') });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        const existingStudent = await prisma.studentProfile.findUnique({ where: { regNo } });

        if (existingUser || existingStudent) {
            return res.status(400).json({ error: 'Student with this email or RegNo already exists' });
        }

        const batch = await prisma.batch.findUnique({ where: { id: batchId } });
        if (!batch) {
            return res.status(400).json({ error: 'Selected batch does not exist. Please create it first.' });
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
                        parentName: parentName || null,
                        parentContact: parentContact || null,
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

// PUT /api/hr/staff/:id — Edit staff profile and designation
const editStaff = async (req, res) => {
    try {
        const { id } = req.params; // staffId
        const { name, email, deptId, designation, category, functionalTags, adminRoleName, salary, phone } = req.body;

        const staff = await prisma.staffProfile.findUnique({
            where: { staffId: id },
            include: { user: true }
        });

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Calculate tagAccess based on category
        let newTagAccess = undefined;
        let newDesignation = undefined;

        if (category === 'Admin') {
            newTagAccess = 'Admin';
            newDesignation = adminRoleName;
        } else if (category === 'HR') {
            newTagAccess = 'HR';
            newDesignation = 'HR';
        } else if (category === 'Staff') {
            const tags = Array.isArray(functionalTags) ? functionalTags : [];
            newTagAccess = tags.length > 0 ? `Staff,${tags.join(',')}` : 'Staff';
            newDesignation = tags.length > 0 ? tags.join(', ') : null;
        }

        // Update in a transaction: both the User and StaffProfile tables
        await prisma.$transaction(async (tx) => {
            // Update User fields (email, tagAccess/designation, deptId)
            await tx.user.update({
                where: { id: staff.userId },
                data: {
                    ...(email && email !== staff.user.email ? { email } : {}),
                    ...(newTagAccess ? { tagAccess: newTagAccess } : {}),
                    ...(deptId ? { deptId } : {}),
                }
            });

            // Update StaffProfile fields
            await tx.staffProfile.update({
                where: { staffId: id },
                data: {
                    ...(name ? { name } : {}),
                    ...(deptId ? { deptId } : {}),
                    ...(newDesignation ? { designation: newDesignation } : {}),
                    ...(salary !== undefined ? { salary: salary ? parseFloat(salary) : null } : {}),
                    ...(phone !== undefined ? { phone: phone || null } : {}),
                }
            });
        });

        return res.status(200).json({ message: 'Staff updated successfully' });
    } catch (error) {
        console.error('Error editing staff:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already in use by another user' });
        }
        return res.status(500).json({ error: 'Failed to update staff' });
    }
};

// PUT /api/hr/staff/:id/status — Deactivate a staff member
const deactivateStaff = async (req, res) => {
    try {
        const { id } = req.params; // staffId

        const staff = await prisma.staffProfile.findUnique({
            where: { staffId: id },
            include: { user: true }
        });

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        const newStatus = staff.user.status === 'Active' ? 'Inactive' : 'Active';
        await prisma.user.update({
            where: { id: staff.userId },
            data: { status: newStatus }
        });

        return res.status(200).json({ message: `Staff member ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error('Error toggling staff status:', error);
        return res.status(500).json({ error: 'Failed to toggle staff status' });
    }
};

const addAdmin = async (req, res) => {
    try {
        const { name, email, password, role, designation } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);
        const tagAccess = role === 'HR' ? 'HR' : 'Admin';
        const defaultStaffId = `ADM-${Date.now()}`;

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    userType: 'Staff',
                    tagAccess: tagAccess,
                    status: 'Active'
                }
            });

            await tx.staffProfile.create({
                data: {
                    staffId: defaultStaffId,
                    userId: user.id,
                    name: name,
                    deptId: 'ADMIN',
                    designation: designation || (tagAccess === 'HR' ? 'HR' : 'Administrator')
                }
            });
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
            let role = 'Staff';
            if (s.user?.tagAccess?.includes('Admin')) role = 'Admin';
            else if (s.user?.tagAccess?.includes('HR')) role = 'HR';
            
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

const getBatches = async (req, res) => {
    try {
        const batches = await prisma.batch.findMany({
            orderBy: { id: 'desc' }
        });
        return res.status(200).json(batches);
    } catch (error) {
        console.error('Error fetching batches:', error);
        return res.status(500).json({ error: 'Failed to fetch batches' });
    }
};

const addBatch = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existing = await prisma.batch.findUnique({ where: { id } });
        if (existing) {
            return res.status(400).json({ error: 'Batch already exists' });
        }

        const batch = await prisma.batch.create({
            data: { id, name }
        });

        return res.status(201).json(batch);
    } catch (error) {
        console.error('Error adding batch:', error);
        return res.status(500).json({ error: 'Failed to add batch' });
    }
};

module.exports = {
    bulkUploadStudents,
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
    addBatch
};
