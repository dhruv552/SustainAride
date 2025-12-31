const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger.cjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config.env') });

let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('Using existing MongoDB connection');
    return;
  }

  try {
    const uri = process.env.ATLAS_URI;
    
    if (!uri) {
      throw new Error('ATLAS_URI environment variable is not defined');
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
      ssl: true
    };

    await mongoose.connect(uri, options);

    isConnected = true;
    reconnectAttempts = 0;
    
    logger.info('✓ MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', { error: err.message });
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
      
      // Attempt reconnection
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        logger.info(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        
        setTimeout(() => {
          connectDB();
        }, delay);
      } else {
        logger.error('Max reconnection attempts reached. Manual intervention required.');
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
      reconnectAttempts = 0;
    });

  } catch (error) {
    isConnected = false;
    logger.error('Failed to connect to MongoDB', {
      error: error.message,
      stack: error.stack
    });
    
    // Exit process if initial connection fails
    if (reconnectAttempts === 0) {
      logger.error('Initial MongoDB connection failed. Exiting...');
      process.exit(1);
    }
  }
};

// Graceful disconnection
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection closed');
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;