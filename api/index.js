const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('../server/routes/authRoutes.cjs');
const userRoutes = require('../server/routes/userRoutes.cjs');
const rideRoutes = require('../server/routes/rideRoutes.cjs');
const couponRoutes = require('../server/routes/couponRoutes.cjs');
const rewardRoutes = require('../server/routes/rewardRoutes.cjs');
const aqiRoutes = require('../server/routes/aqiRoutes.cjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const uri = process.env.ATLAS_URI;
    
    if (!uri) {
      throw new Error('ATLAS_URI environment variable is not defined');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/aqi', aqiRoutes);

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to SustainAride API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
