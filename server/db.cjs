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
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
};

// Create MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(uri, options);
        console.log('MongoDB connected successfully');

        // Log database name and host for confirmation
        const { host, port, name } = mongoose.connection;
        console.log(`Connected to database: ${name} at ${host}:${port || 'default'}`);

        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;