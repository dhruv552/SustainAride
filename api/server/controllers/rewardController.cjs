const EcoRewardLog = require('../models/EcoRewardLog.cjs');
const User = require('../models/User.cjs');
const Ride = require('../models/Ride.cjs');
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for AQI data
const aqiCache = new NodeCache({ stdTTL: 1800 });

// Bonus points for different ride types during pollution alert
const POLLUTION_BONUS_POINTS = {
  EV: 30,
  CNG: 20,
  Shared: 15,
  OPT_IN: 5 // Small bonus just for opting in
};

const rewardController = {
  /**
   * Claim eco bonus during pollution alert
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  claimEcoBonus: async (req, res) => {
    try {
      const { userId, timestamp, actionType } = req.body;
      
      // Validate request
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get current AQI data
      let aqiData = aqiCache.get('delhi-aqi');
      
      // If no cached data, set default for development/testing
      if (!aqiData) {
        aqiData = {
          aqi: 225, // Default to triggering value for testing
          location: 'Delhi, India',
          timestamp: new Date().toISOString()
        };
      }
      
      // Only allow claims if AQI > 200
      if (aqiData.aqi <= 200) {
        return res.status(400).json({ 
          message: 'Eco bonus is only available during high pollution alerts (AQI > 200)',
          currentAqi: aqiData.aqi 
        });
      }
      
      // Create eco reward log entry
      const ecoRewardLog = new EcoRewardLog({
        userId,
        bonusType: 'pollution_alert_opt_in',
        pointsEarned: POLLUTION_BONUS_POINTS.OPT_IN,
        aqi: aqiData.aqi,
        timestamp: timestamp || new Date(),
        notes: 'User opted in for eco-friendly ride during pollution alert'
      });
      
      await ecoRewardLog.save();
      
      // Return success
      return res.status(201).json({
        message: 'Eco bonus claim registered successfully',
        bonusPoints: POLLUTION_BONUS_POINTS.OPT_IN,
        eligibleForRideBonus: true,
        rewardLog: ecoRewardLog
      });
    } catch (error) {
      console.error('Eco bonus claim error:', error);
      return res.status(500).json({ message: 'Server error processing eco bonus claim' });
    }
  },
  
  /**
   * Process eco rewards for completed rides during pollution alert
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  processRideEcoRewards: async (req, res) => {
    try {
      const { rideId } = req.body;
      
      // Validate request
      if (!rideId) {
        return res.status(400).json({ message: 'Ride ID is required' });
      }
      
      // Get ride details
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
      }
      
      // Get current AQI data
      let aqiData = aqiCache.get('delhi-aqi');
      
      // If no cached data, set default for development/testing
      if (!aqiData) {
        aqiData = {
          aqi: 225,
          location: 'Delhi, India'
        };
      }
      
      // Only process if AQI > 200
      if (aqiData.aqi <= 200) {
        return res.status(200).json({ 
          message: 'No eco bonus applied - not during high pollution alert',
          bonusApplied: false 
        });
      }
      
      // Determine ride type and bonus points
      let bonusPoints = 0;
      let bonusType = null;
      
      if (ride.vehicleType === 'EV') {
        bonusPoints = POLLUTION_BONUS_POINTS.EV;
        bonusType = 'pollution_alert_ev';
      } else if (ride.vehicleType === 'CNG') {
        bonusPoints = POLLUTION_BONUS_POINTS.CNG;
        bonusType = 'pollution_alert_cng';
      } else if (ride.isShared) {
        bonusPoints = POLLUTION_BONUS_POINTS.Shared;
        bonusType = 'pollution_alert_shared';
      }
      
      // If ride type doesn't qualify for bonus
      if (!bonusPoints) {
        return res.status(200).json({ 
          message: 'No eco bonus - ride type not eligible during pollution alert',
          bonusApplied: false 
        });
      }
      
      // Create eco reward log
      const ecoRewardLog = new EcoRewardLog({
        userId: ride.userId,
        rideId,
        rideType: ride.vehicleType,
        bonusType,
        pointsEarned: bonusPoints,
        aqi: aqiData.aqi,
        notes: `Eco bonus for ${ride.vehicleType} ride during pollution alert`
      });
      
      await ecoRewardLog.save();
      
      // Update user's rewards points
      const user = await User.findById(ride.userId);
      if (user) {
        user.sustainPoints = (user.sustainPoints || 0) + bonusPoints;
        await user.save();
      }
      
      // Return success
      return res.status(200).json({
        message: `Eco bonus of ${bonusPoints} points applied successfully`,
        bonusApplied: true,
        bonusPoints,
        rewardLog: ecoRewardLog
      });
    } catch (error) {
      console.error('Process ride eco rewards error:', error);
      return res.status(500).json({ message: 'Server error processing ride eco rewards' });
    }
  },
  
  /**
   * Get pollution alert eco rewards for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserEcoRewards: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate request
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Get all eco rewards for this user
      const ecoRewards = await EcoRewardLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(20);
      
      // Calculate total points
      const totalPoints = ecoRewards.reduce((sum, reward) => sum + reward.pointsEarned, 0);
      
      return res.status(200).json({
        ecoRewards,
        totalPoints
      });
    } catch (error) {
      console.error('Get user eco rewards error:', error);
      return res.status(500).json({ message: 'Server error getting user eco rewards' });
    }
  }
};

module.exports = rewardController;