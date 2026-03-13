const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// PUT /api/student/complete-profile
// Called by a student on first login to fill their personal details and lock the profile
const completeProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Set by verifyToken middleware
        const { dob, gender, bloodGroup, parentContact, address, phone } = req.body;

        // Validate required fields
        if (!dob || !gender || !bloodGroup || !parentContact || !address) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Find the student profile linked to this user
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId }
        });

        if (!studentProfile) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        if (studentProfile.profileLocked) {
            return res.status(403).json({ error: 'Profile is already locked. Contact HR to make changes.' });
        }

        // Update profile and LOCK it
        const updatedProfile = await prisma.studentProfile.update({
            where: { userId },
            data: {
                dob: new Date(dob),
                gender,
                bloodGroup,
                parentContact,
                address,
                phone: phone || null,
                profileLocked: true  // 🔒 THE CRUCIAL BIT
            }
        });

        return res.status(200).json({
            message: 'Profile completed and locked successfully!',
            profile: {
                regNo: updatedProfile.regNo,
                name: updatedProfile.name,
                profileLocked: updatedProfile.profileLocked
            }
        });

    } catch (error) {
        console.error('Complete profile error:', error);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
};

module.exports = { completeProfile };
