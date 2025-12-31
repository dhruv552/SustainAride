import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://sustain-aride-avfp.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        console.log('✓ MongoDB connected');
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        return false;
    }
};

// Health check route
app.get('/api/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// Welcome route
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to SustainAride API',
        version: '1.0.0',
        status: 'operational'
    });
});

// Test signup route
app.post('/api/auth/register', async (req, res) => {
    res.json({
        message: 'Register endpoint is working',
        note: 'Full functionality requires database connection'
    });
});

// Vercel serverless handler
export default async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Connect to MongoDB
        await connectDB();

        // Pass to Express app
        return app(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}