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
            try {
                await prisma.user.create({
                    data: {
                        email: row.email || row.Email,
                        password: defaultPassword,
                        userType: 'Student',
                        tagAccess: 'Student',
                        deptId: row.deptId || row.Department,
                        studentProfile: {
                            create: {
                                regNo: (row.regNo || row.RegNo).toString(),
                                name: row.name || row.Name,
                                batchId: (row.batchId || row.Batch).toString(),
                                admissionType: row.admissionType || row.AdmissionType,
                                profileLocked: false // Trigger for Emerald Green setup form
                            }
                        }
                    }
                });
                successCount++;
            } catch (err) {
                errors.push({ regNo: row.regNo || row.RegNo, error: "Duplicate Email or RegNo" });
            }
        }

        res.json({ message: `Uploaded ${successCount} students`, errors });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { bulkUploadStudents };
