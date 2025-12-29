const express = require('express');
const router = express.Router();
const aqiController = require('../controllers/aqiController.cjs');

// GET current Delhi AQI data
router.get('/delhi', aqiController.getDelhiAQI);

// GET current alert status
router.get('/alert-status', aqiController.checkAlertStatus);

module.exports = router;