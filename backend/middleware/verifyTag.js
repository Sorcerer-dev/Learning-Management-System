const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ums-super-secret-key-change-in-production';

/**
 * Middleware: verifyTag
 * Usage: router.get('/admin-only', verifyTag(['Dean', 'HR']), handler)
 * 
 * Verifies JWT, extracts user info, and checks if user's tagAccess
 * is in the list of allowed tags.
 */
function verifyTag(allowedTags = []) {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authentication required. No token provided.' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach user data to the request for downstream use
            req.user = decoded;

            // If specific tags are required, check access
            if (allowedTags.length > 0 && !allowedTags.includes(decoded.tagAccess)) {
                return res.status(403).json({
                    error: 'Access denied. Insufficient permissions.',
                    required: allowedTags,
                    current: decoded.tagAccess,
                });
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired. Please login again.' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Invalid token.' });
            }
            console.error('Auth middleware error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    };
}

module.exports = verifyTag;
