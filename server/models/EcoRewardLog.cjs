const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema for logging eco rewards earned during high pollution alerts
 */
const ecoRewardLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rideId: {
    type: Schema.Types.ObjectId,
    ref: 'Ride',
    required: false // May be null if just claiming intent before booking
  },
  rideType: {
    type: String,
    enum: ['EV', 'CNG', 'Shared', 'Petrol', 'Diesel'],
    required: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  bonusType: {
    type: String,
    enum: ['pollution_alert_ev', 'pollution_alert_cng', 'pollution_alert_shared', 'pollution_alert_opt_in'],
    required: true
  },
  aqi: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Whether points have been credited to user account
  credited: {
    type: Boolean,
    default: false
  },
  // Optional notes
  notes: {
    type: String
  }
}, { timestamps: true });

const EcoRewardLog = mongoose.model('EcoRewardLog', ecoRewardLogSchema);

module.exports = EcoRewardLog;