const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Reward schema definition
const rewardSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  rewardType: {
    type: String,
    enum: ['Discount', 'FreeRide', 'Merchandise', 'PartnerOffer'],
    required: true
  },
  rewardValue: {
    type: Number
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  redemptionLimit: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  redemptionCount: {
    type: Number,
    default: 0
  },
  redeemedBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Redeemed', 'Expired'],
      default: 'Pending'
    }
  }],
  termsAndConditions: {
    type: String
  },
  partnerInfo: {
    name: String,
    logo: String,
    website: String
  }
}, { timestamps: true });

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;