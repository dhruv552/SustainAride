const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');

// JWT Secret - in a real app, this should be in an environment variable
const JWT_SECRET = 'sustainaride_secret_key';
const JWT_EXPIRE = '7d'; // Token expires in 7 days

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone
        });

        // Save the user
        const savedUser = await newUser.save();

        // Create and sign JWT token
        const token = jwt.sign(
            { userId: savedUser._id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        // Remove password from response
        const userWithoutPassword = savedUser.toObject();
        delete userWithoutPassword.password;

        res.status(201).json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Login an existing user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({ message: 'Your account is deactivated' });
        }

        // Create and sign JWT token
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        // Remove password from response
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Verify JWT token
 */
const verifyToken = (req, res) => {
    // The auth middleware already verified the token
    res.json({ valid: true });
};

module.exports = {
    register,
    login,
    verifyToken
};