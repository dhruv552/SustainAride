const jwt = require('jsonwebtoken');

// JWT Secret - should match the one in authController
const JWT_SECRET = 'sustainaride_secret_key';

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user ID to request
        req.userId = decoded.userId;

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

module.exports = authMiddleware;