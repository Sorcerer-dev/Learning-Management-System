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
            const email = (row.email || row.Email || '').toString().toLowerCase().trim();

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
                        deptId: (row.deptId || row.Department || '').toString().trim(),
                        studentProfile: {
                            create: {
                                regNo,
                                name: (row.name || row.Name || '').toString().trim(),
                                batchId: (row.batchId || row.Batch || '').toString().trim(),
                                admissionType: (row.admissionType || row.AdmissionType || 'Counseling').toString().trim(),
                                parentName: (row.parentName || row.ParentName || '').toString().trim() || null,
                                parentContact: (row.parentContact || row.ParentContact || '').toString().trim() || null,
                                phone: (row.phone || row.Phone || row.StudentPhone || '').toString().trim() || null,
                                address: (row.address || row.Address || '').toString().trim() || null,
                                dob: row.dob || row.DOB || row.DateOfBirth ? new Date(row.dob || row.DOB || row.DateOfBirth) : null,
                                gender: (row.gender || row.Gender || '').toString().trim() || null,
                                bloodGroup: (row.bloodGroup || row.BloodGroup || '').toString().trim() || null,
                                religion: (row.religion || row.Religion || '').toString().trim() || null,
                                city: (row.city || row.City || '').toString().trim() || null,
                                boardingStatus: (row.boardingStatus || row.BoardingStatus || '').toString().trim() || null,
                                profilePic: (row.profilePic || row.ProfilePic || '').toString().trim() || null,
                                doj: row.doj || row.DOJ || row.DateOfJoining ? new Date(row.doj || row.DOJ || row.DateOfJoining) : new Date(),
                                profileLocked: false
                            }
                        }
                    }
                });
                successCount++;
            } catch (err) {
                console.error(`Error uploading student ${regNo}:`, err);
                let errorMessage = "Duplicate Email or RegNo";
                if (err.code === 'P2002') {
                    const field = err.meta?.target || 'RegNo/Email';
                    errorMessage = `Conflict in ${field}`;
                } else {
                    errorMessage = err.message || "Unknown validation error";
                }
                errors.push({ regNo, error: errorMessage });
            }
        }

        res.json({ message: `Uploaded ${successCount} students`, errors });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { bulkUploadStudents };
