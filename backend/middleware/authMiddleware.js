const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided. Access denied." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ums-super-secret-key-change-in-production');

        // Live status check — if user was deactivated since token was issued, reject immediately
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, status: true }
        });

        if (!user || user.status !== 'Active') {
            return res.status(403).json({ message: "Account is deactivated. Contact HR." });
        }

        req.user = decoded; // Contains id, email, and tagAccess
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }
};

// The "Tag-Based" Gatekeeper
const authorizeTag = (allowedTags) => {
    return (req, res, next) => {
        if (!allowedTags.includes(req.user.tagAccess)) {
            return res.status(403).json({
                message: `Forbidden: This area is restricted to ${allowedTags.join(' or ')} only.`
            });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeTag };
