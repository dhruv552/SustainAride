import mongoose from 'mongoose';

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return { success: true, error: null };
    }

    try {
        const uri = process.env.ATLAS_URI;
        if (!uri) {
            throw new Error('ATLAS_URI environment variable is not defined');
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority'
        });

        isConnected = true;
        console.log('✓ MongoDB connected successfully');
        return { success: true, error: null };
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        isConnected = false;
        return { success: false, error: error.message };
    }
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Try to connect to MongoDB
        const connectionResult = await connectDB();

        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        return res.status(200).json({
            status: 'ok',
            database: dbStatus,
            connectionAttempt: connectionResult.success ? 'successful' : 'failed',
            error: connectionResult.error || null,
            hasAtlasUri: !!process.env.ATLAS_URI,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production'
        });
    } catch (error) {
        console.error('Health check error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            database: 'error',
            hasAtlasUri: !!process.env.ATLAS_URI
        });
    }
}