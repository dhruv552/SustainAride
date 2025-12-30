import mongoose from 'mongoose';

// Coupon Schema
const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minRideValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectDB();

    // Get user ID from URL path
    const userId = req.query.id || req.url.match(/\/user\/([^\/]+)\/active/)?.[1];

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find active coupons for the user
    const now = new Date();
    const coupons = await Coupon.find({
      userId: userId,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons: coupons
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    return res.status(500).json({
      message: 'Error fetching coupons',
      error: error.message
    });
  }
}