const prisma = require('../lib/prisma');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');

const bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // 1. Read Excel file from buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const defaultPassword = await bcrypt.hash('Welcome@123', 10);
        let successCount = 0;
        let errors = [];

        // 2. Process each row
        for (const row of data) {
            const regNo = (row.regNo || row.RegNo || '').toString().trim();
            const email = (row.email || row.Email || '').toLowerCase().trim();

            if (!regNo || !email) {
                errors.push({ regNo: regNo || 'N/A', error: 'Missing required RegNo or Email' });
                continue;
            }

            try {
                await prisma.user.create({
                    data: {
                        email,
                        password: defaultPassword,
                        userType: 'Student',
                        tagAccess: 'Student',
                        deptId: (row.deptId || row.Department || '').trim(),
                        studentProfile: {
                            create: {
                                regNo,
                                name: (row.name || row.Name || '').trim(),
                                batchId: (row.batchId || row.Batch || '').toString().trim(),
                                admissionType: (row.admissionType || row.AdmissionType || 'Counseling').trim(),
                                parentName: (row.parentName || row.ParentName || '').trim() || null,
                                parentContact: (row.parentContact || row.ParentContact || '').trim() || null,
                                profileLocked: false
                            }
                        }
                    }
                });
                successCount++;
            } catch (err) {
                errors.push({ regNo, error: "Duplicate Email or RegNo" });
            }
        }

        res.json({ message: `Uploaded ${successCount} students`, errors });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { bulkUploadStudents };
