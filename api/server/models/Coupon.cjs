const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Coupon schema definition
const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'Fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  maxDiscount: {
    type: Number
  },
  minRideValue: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableRideTypes: {
    type: [String],
    enum: ['Standard', 'Premium', 'Carpool', 'Electric', 'All'],
    default: ['All']
  },
  userRestriction: {
    type: String,
    enum: ['New', 'Existing', 'All'],
    default: 'All'
  },
  users: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timesUsed: {
      type: Number,
      default: 0
    }
  }]
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;