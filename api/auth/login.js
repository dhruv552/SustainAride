import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['rider', 'driver'], default: 'rider' },
    ecoPoints: { type: Number, default: 0 },
    sustainPoints: { type: Number, default: 0 },
    totalRides: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return true;
    }

    try {
        const uri = process.env.ATLAS_URI;
        if (!uri) {
            throw new Error('ATLAS_URI not defined');
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });

        isConnected = true;
        return true;
    } catch (error) {
        console.error('MongoDB error:', error.message);
        return false;
    }
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Connect to database
        await connectDB();

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign(
            { id: user._id, email: user.email },
            jwtSecret,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                ecoPoints: user.ecoPoints,
                sustainPoints: user.sustainPoints || 0,
                totalRides: user.totalRides
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Error logging in',
            error: error.message
        });
    }
}