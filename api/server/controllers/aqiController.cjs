const axios = require('axios');

/**
 * Controller for Air Quality Index (AQI) data
 */
const aqiController = {
  /**
   * Get current AQI for Delhi
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getDelhiAQI: async (req, res) => {
    try {
      // For demo purposes, returning mock data since we might not have API key
      // In production, use actual API like IQAir or OpenWeatherMap
      const mockAQIData = {
        aqi: 180, // Normal level - below alert threshold
        location: 'Delhi, India',
        timestamp: new Date().toISOString(),
        status: 'normal'
      };
      
      return res.status(200).json(mockAQIData);
    } catch (error) {
      console.error('Error fetching AQI data:', error);
      return res.status(500).json({ message: 'Failed to fetch AQI data' });
    }
  },

  /**
   * Check if there's a pollution alert (AQI > 200)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  checkAlertStatus: async (req, res) => {
    try {
      // For demo purposes, using mock data
      const mockAQI = 180; // Normal level - below alert threshold
      
      return res.status(200).json({
        isAlert: mockAQI > 200,
        aqi: mockAQI
      });
    } catch (error) {
      console.error('Error checking pollution alert:', error);
      return res.status(500).json({ message: 'Failed to check pollution alert status' });
    }
  }
};

module.exports = aqiController;