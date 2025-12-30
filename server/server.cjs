const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db.cjs');
const { initScheduler } = require('./utils/scheduler.cjs');

// Import routes
const authRoutes = require('./routes/authRoutes.cjs');
const userRoutes = require('./routes/userRoutes.cjs');
const rideRoutes = require('./routes/rideRoutes.cjs');
const couponRoutes = require('./routes/couponRoutes.cjs');
const rewardRoutes = require('./routes/rewardRoutes.cjs');
const aqiRoutes = require('./routes/aqiRoutes.cjs');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize scheduler for cron jobs
initScheduler();

// Middleware - CORS configuration for credentials
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/aqi', aqiRoutes);

// Basic route for testing
app.get('/', (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;