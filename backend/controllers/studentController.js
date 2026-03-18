const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// PUT /api/student/complete-profile
// Called by a student on first login to fill their personal details and lock the profile
const completeProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Set by verifyToken middleware
        const { 
            dob, gender, bloodGroup, religion, city, boardingStatus,
            parentName, parentContact, address, phone, profilePic 
        } = req.body;

        // Find the student profile linked to this user
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId }
        });

        if (!studentProfile) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        if (studentProfile.profileLocked) {
            return res.status(403).json({ error: 'Profile is locked. Contact HR to make changes.' });
        }

        // Update profile
        const updatedProfile = await prisma.studentProfile.update({
            where: { userId },
            data: {
                ...(dob ? { dob: new Date(dob) } : {}),
                ...(gender ? { gender } : {}),
                ...(bloodGroup ? { bloodGroup } : {}),
                ...(religion ? { religion } : {}),
                ...(city ? { city } : {}),
                ...(boardingStatus ? { boardingStatus } : {}),
                ...(parentName ? { parentName } : {}),
                ...(parentContact ? { parentContact } : {}),
                ...(address ? { address } : {}),
                ...(phone ? { phone } : {}),
                ...(profilePic ? { profilePic } : {}),
                // Note: We don't force lock here if it was already unlocked by HR
            }
        });

        return res.status(200).json({
            message: 'Profile updated successfully!',
            profile: updatedProfile
        });
    } catch (error) {
        console.error('Complete profile error:', error);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
};

module.exports = { completeProfile };
