const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User schema definition
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  sustainPoints: {
    type: Number,
    default: 0
  },
  wallet: {
    type: Number,
    default: 0
  },
  rides: [{
    type: Schema.Types.ObjectId,
    ref: 'Ride'
  }],
  rideHistory: [{
    rideId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride'
    },
    type: {
      type: String,
      enum: ['Standard', 'Premium', 'Carpool', 'Electric', 'CNG', 'Shared']
    },
    distance: Number,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  coupons: [{
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  }],
  couponsUsed: [String],
  rewards: [{
    type: Schema.Types.ObjectId,
    ref: 'Reward'
  }],
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;