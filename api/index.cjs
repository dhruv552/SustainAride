const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Import routes
const authRoutes = require('../server/routes/authRoutes.cjs');
const userRoutes = require('../server/routes/userRoutes.cjs');
const rideRoutes = require('../server/routes/rideRoutes.cjs');
const couponRoutes = require('../server/routes/couponRoutes.cjs');
const rewardRoutes = require('../server/routes/rewardRoutes.cjs');
const aqiRoutes = require('../server/routes/aqiRoutes.cjs');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - only allow your frontend domain
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://sustainaride.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin?.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit login/signup attempts
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// MongoDB connection with encryption
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✓ Using existing MongoDB connection');
    return true;
  }

  if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
    console.error('❌ Max connection attempts reached');
    throw new Error('Database connection failed after maximum retries');
  }

  try {
    connectionAttempts++;
    const uri = process.env.ATLAS_URI;
    
    if (!uri) {
      throw new Error('ATLAS_URI environment variable is not defined');
    }

    // Enhanced connection options with SSL/TLS encryption
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      ssl: true, // Enable SSL/TLS encryption
      tls: true,
      tlsAllowInvalidCertificates: false,
    });

    isConnected = true;
    connectionAttempts = 0; // Reset on success
    
    // Set up connection event handlers
    mongoose.connection.on('disconnected', () => {
      console.log('⚠ MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
      isConnected = false;
    });

    console.log('✓ MongoDB connected successfully with SSL/TLS encryption');
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`, error.message);
    isConnected = false;
    
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB();
    }
    
    throw error;
  }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/aqi', aqiRoutes);

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to SustainAride API',
    version: '1.0.0',
    status: 'operational'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path 
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(isDevelopment && { error: err.message, stack: err.stack })
  });
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Set CORS headers for preflight requests
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Ensure database connection before handling request
    await connectDB();
    
    // Pass request to Express app
    return app(req, res);
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    return res.status(503).json({
      message: 'Service temporarily unavailable',
      error: 'Database connection failed'
    });
  }
};

// Export app for testing
module.exports.app = app;
