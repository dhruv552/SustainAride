const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'config.env') });

// MongoDB connection URI
const uri = process.env.ATLAS_URI;

if (!uri) {
    console.error('Error: ATLAS_URI is not defined in environment variables');
    process.exit(1);
}

// Connection options
const options = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
};

// Create MongoDB connection
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(uri, options);
        console.log('✓ MongoDB connected successfully');

        // Log database name and host for confirmation
        const { host, name } = mongoose.connection;
        console.log(`✓ Connected to database: ${name} at ${host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;