const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Ride schema definition
const rideSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  dropLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  distance: {
    type: Number, // in km
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  rideType: {
    type: String,
    enum: ['Standard', 'Premium', 'Carpool', 'Electric'],
    required: true
  },
  fare: {
    type: Number,
    required: true
  },
  sustainPointsEarned: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Wallet', 'UPI'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  driverId: {
    type: String
  },
  driverName: {
    type: String
  },
  vehicleDetails: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  },
  couponApplied: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  }
}, { timestamps: true });

// Create index for location-based queries
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'dropLocation.coordinates': '2dsphere' });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;