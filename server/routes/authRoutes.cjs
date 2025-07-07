const express = require('express');
const router = express.Router();
const { register, login, verifyToken } = require('../controllers/authController.cjs');
const authMiddleware = require('../middlewares/auth.cjs');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route - requires valid JWT token
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;