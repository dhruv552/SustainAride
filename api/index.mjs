import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✓ Using existing MongoDB connection');
    return true;
  }

  try {
    const uri = process.env.ATLAS_URI;

    if (!uri) {
      console.error('❌ ATLAS_URI not defined');
      throw new Error('ATLAS_URI environment variable is not defined');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log('✓ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    return false;
  }
};

// Routes
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to SustainAride API',
    version: '1.0.0',
    status: 'operational'
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    res.json({
      message: 'Register endpoint working - MongoDB connection required for full functionality',
      dbConnected: mongoose.connection.readyState === 1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Connect to database
    await connectDB();

    // Pass to Express app
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error.message);
    return res.status(503).json({
      message: 'Service temporarily unavailable',
      error: error.message
    });
  }
}
