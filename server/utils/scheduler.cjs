const cron = require('node-cron');
const axios = require('axios');
const NodeCache = require('node-cache');
const EcoRewardLog = require('../models/EcoRewardLog.cjs');

// Cache for AQI data (shared across the application)
const aqiCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes

// API key (should be in env variables in production)
const API_KEY = process.env.IQAIR_API_KEY || 'your_default_key';

/**
 * Fetch AQI data from external API
 */
const fetchAQIData = async () => {
  try {
    console.log('Scheduled AQI check: Fetching AQI data for Delhi...');
    
    // Fetch from AirVisual API
    const response = await axios.get(
      `https://api.airvisual.com/v2/city?city=Delhi&state=Delhi&country=India&key=${API_KEY}`
    );
    
    if (response.data.status !== 'success') {
      throw new Error('Failed to fetch AQI data from external API');
    }
    
    const aqi = response.data.data.current.pollution.aqius;
    
    // Prepare response
    const aqiData = {
      aqi,
      location: 'Delhi, India',
      timestamp: new Date().toISOString(),
      status: aqi > 200 ? 'alert' : 'normal'
    };
    
    // Cache the data
    aqiCache.set('delhi-aqi', aqiData);
    
    console.log(`AQI Update: Delhi AQI is ${aqi} (${aqiData.status})`);
    
    // If it's a pollution alert, log to database for monitoring
    if (aqi > 200) {
      await logPollutionAlert(aqi);
    }
    
    return aqiData;
  } catch (error) {
    console.error('AQI fetch error in scheduler:', error.message);
    
    // Use fallback data if API fails (for development or continuity)
    const fallbackData = {
      aqi: 225, // Value that will trigger alert for testing
      location: 'Delhi, India',
      timestamp: new Date().toISOString(),
      status: 'alert',
      isFallback: true
    };
    
    aqiCache.set('delhi-aqi', fallbackData);
    return fallbackData;
  }
};

/**
 * Log pollution alert to database for monitoring
 */
const logPollutionAlert = async (aqi) => {
  try {
    // Create a system log entry
    const alertLog = new EcoRewardLog({
      userId: '000000000000000000000000', // System ID placeholder
      bonusType: 'pollution_alert_opt_in',
      pointsEarned: 0, // Just a log, no points
      aqi,
      notes: `System: Pollution Alert Detected - AQI ${aqi}`
    });
    
    await alertLog.save();
    console.log('Pollution alert logged to database');
  } catch (err) {
    console.error('Error logging pollution alert:', err);
  }
};

/**
 * Initialize all scheduled tasks
 */
const initScheduler = () => {
  // Run AQI check every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    fetchAQIData()
      .then(() => console.log('Scheduled AQI check completed'))
      .catch(err => console.error('Scheduled AQI check failed:', err));
  });
  
  // Run initial check at startup
  fetchAQIData()
    .then(() => console.log('Initial AQI check completed'))
    .catch(err => console.error('Initial AQI check failed:', err));
  
  console.log('Scheduler initialized: AQI checks scheduled every 30 minutes');
};

module.exports = {
  initScheduler,
  aqiCache,
  fetchAQIData
};