const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger.cjs');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { errors: errors.array(), path: req.path });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Ride booking validation
const validateRideBooking = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  body('type')
    .notEmpty().withMessage('Ride type is required')
    .isIn(['Electric', 'CNG', 'Shared']).withMessage('Invalid ride type'),
  body('pickupLocation.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Invalid pickup coordinates')
    .custom((value) => {
      const [lng, lat] = value;
      return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    }).withMessage('Coordinates out of range'),
  body('dropoffLocation.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Invalid dropoff coordinates'),
  body('distance')
    .isFloat({ min: 0.1, max: 500 }).withMessage('Distance must be between 0.1-500 km'),
  body('estimatedPrice')
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  handleValidationErrors
];

// Coupon validation
const validateCoupon = [
  body('code')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ min: 3, max: 50 }).withMessage('Invalid coupon code length'),
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  body('rideType')
    .optional()
    .isIn(['Electric', 'CNG', 'Shared']).withMessage('Invalid ride type'),
  body('rideValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('Ride value must be positive'),
  handleValidationErrors
];

// User ID param validation
const validateUserId = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateRideBooking,
  validateCoupon,
  validateUserId,
  validateProfileUpdate,
  handleValidationErrors
};
