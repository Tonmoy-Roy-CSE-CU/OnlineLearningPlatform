// 1. Update authMiddleware.js to check user status
const jwt = require('jsonwebtoken');
const db = require('../db');

// Enhanced authentication middleware with status checking
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get fresh user data from database (including status)
        const userResult = await db.query(
            'SELECT id, name, email, role, status FROM users WHERE id = $1',
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        const user = userResult.rows[0];

        // Check user status
        switch (user.status) {
            case 'banned':
                return res.status(403).json({ 
                    error: 'Account banned. Contact administrator for assistance.',
                    code: 'ACCOUNT_BANNED'
                });
            
            case 'pending':
                return res.status(403).json({ 
                    error: 'Account pending approval. Please wait for admin approval.',
                    code: 'ACCOUNT_PENDING'
                });
            
            case 'approved':
                // Allow access
                break;
            
            default:
                return res.status(403).json({ 
                    error: 'Invalid account status. Contact administrator.',
                    code: 'INVALID_STATUS'
                });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

// Role authorization middleware (unchanged)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};

