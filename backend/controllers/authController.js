const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ums-super-secret-key-change-in-production';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: {
                staffProfile: true,
                studentProfile: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (user.status !== 'Active') {
            return res.status(403).json({ error: 'Account is deactivated. Contact HR.' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT containing tagAccess and profileLocked status
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                userType: user.userType,
                tagAccess: user.tagAccess,
                deptId: user.deptId,
                profileLocked: user.studentProfile?.profileLocked ?? null,
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                staffProfile: true,
                studentProfile: true,
            },
        });

        if (!user || user.status !== 'Active') {
            return res.status(401).json({ error: 'User not found or inactive.' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.staffProfile?.name || user.studentProfile?.name || user.email,
                userType: user.userType,
                tagAccess: user.tagAccess,
                deptId: user.deptId,
                profileLocked: user.studentProfile?.profileLocked ?? null,
                studentProfile: user.studentProfile || null,
                staffProfile: user.staffProfile || null,
            },
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }
        console.error('Auth check error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // Assuming req.user is populated by auth middleware

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid current password.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    login,
    getMe,
    changePassword
};
