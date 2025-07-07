const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon.cjs');
const User = require('../models/User.cjs');
const Ride = require('../models/Ride.cjs');
const couponEngine = require('../utils/couponEngine.cjs');

// Get all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get coupon by ID
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new coupon
router.post('/', async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    const newCoupon = await coupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update coupon
router.put('/:id', async (req, res) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete coupon
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Remove coupon references from users
    await User.updateMany(
      { coupons: coupon._id },
      { $pull: { coupons: coupon._id } }
    );

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate a coupon code
router.post('/validate', async (req, res) => {
  try {
    const { code, userId, rideType, rideValue } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    // Special handling for our predefined coupons
    const predefinedCoupons = ["GreenStart10", "EcoRide20", "ElectricSaver30", "SharedBonus50", "ReferralRide100"];
    if (predefinedCoupons.includes(code)) {
      // If user ID is provided, check eligibility
      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Check eligibility using our engine
        const isEligible = couponEngine.checkCouponEligibility(user, code);
        if (!isEligible) {
          return res.status(400).json({ message: 'You are not eligible for this coupon' });
        }

        // For ride-specific coupons, check ride eligibility
        if ((code === "GreenStart10" || code === "ElectricSaver30") && rideType && rideValue) {
          const mockRide = {
            type: rideType,
            fare: rideValue,
            distance: rideType === "Electric" ? 11 : 5 // Assume 11km for electric rides for ElectricSaver30 eligibility
          };

          const rideEligibility = couponEngine.checkRideEligibility(mockRide, code);
          if (!rideEligibility.eligible) {
            return res.status(400).json({ message: rideEligibility.message });
          }

          return res.json({
            valid: true,
            code,
            discountAmount: rideEligibility.discount,
            message: rideEligibility.message
          });
        }

        // For user-specific coupons that don't need ride details
        return res.json({
          valid: true,
          code,
          message: 'Coupon is valid for your account'
        });
      }

      // If no user ID, give information about the coupon
      let couponInfo = {};
      switch (code) {
        case "GreenStart10":
          couponInfo = {
            description: "₹10 off on the first CNG or Electric ride booked via SustainAride",
            discountType: "Fixed",
            discountValue: 10,
            minRideValue: 50
          };
          break;
        case "EcoRide20":
          couponInfo = {
            description: "₹20 cashback when you complete 3 shared rides within the same calendar week",
            discountType: "Cashback",
            discountValue: 20,
            minRideValue: 30
          };
          break;
        case "ElectricSaver30":
          couponInfo = {
            description: "₹30 discount for electric rides above 10 km",
            discountType: "Fixed",
            discountValue: 30,
            minRideValue: 0
          };
          break;
        case "SharedBonus50":
          couponInfo = {
            description: "₹50 cashback when you complete 5 shared rides within 30 days",
            discountType: "Cashback",
            discountValue: 50,
            minRideValue: 0
          };
          break;
        case "ReferralRide100":
          couponInfo = {
            description: "100 Eco Points when a new user you referred completes their first ride",
            discountType: "Points",
            discountValue: 100,
            minRideValue: 0
          };
          break;
      }

      return res.json({
        valid: true,
        couponInfo,
        message: 'Please provide user details to check eligibility'
      });
    }

    // Fall back to standard coupon validation for non-predefined coupons
    // Find coupon by code (case insensitive)
    const coupon = await Coupon.findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    // Check validity period
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ message: 'This coupon has expired or is not yet valid' });
    }

    // Check usage limit
    if (coupon.usageCount >= coupon.usageLimit && coupon.usageLimit > 0) {
      return res.status(400).json({ message: 'This coupon has reached its maximum usage limit' });
    }

    // Check ride type restriction if provided
    if (rideType &&
      coupon.applicableRideTypes.indexOf('All') === -1 &&
      coupon.applicableRideTypes.indexOf(rideType) === -1) {
      return res.status(400).json({
        message: `This coupon is not applicable for ${rideType} rides`
      });
    }

    // Check minimum ride value if provided
    if (rideValue && rideValue < coupon.minRideValue) {
      return res.status(400).json({
        message: `This coupon requires a minimum ride value of ${coupon.minRideValue}`
      });
    }

    // Check user-specific restrictions if userId is provided
    if (userId) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check user restriction
      if (coupon.userRestriction === 'New') {
        // Check if user has any rides
        if (user.rides && user.rides.length > 0) {
          return res.status(400).json({
            message: 'This coupon is only valid for new users'
          });
        }
      }

      // Check if user has already used this coupon
      const userCouponUsage = coupon.users.find(u =>
        u.user.toString() === userId.toString()
      );

      if (userCouponUsage && userCouponUsage.timesUsed >= coupon.usageLimit) {
        return res.status(400).json({
          message: 'You have already used this coupon the maximum number of times'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'Percentage') {
      discountAmount = rideValue ? (rideValue * coupon.discountValue / 100) : coupon.discountValue;

      // Apply max discount if specified
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountValue;
    }

    res.json({
      valid: true,
      coupon,
      discountAmount,
      message: 'Coupon is valid'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply a coupon to a user
router.post('/apply', async (req, res) => {
  try {
    const { couponId, userId, code } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle predefined coupons
    if (code && ["GreenStart10", "EcoRide20", "ElectricSaver30", "SharedBonus50", "ReferralRide100"].includes(code)) {
      // For predefined coupons, we apply the reward directly
      const rewardResult = await couponEngine.applyRewards(user, code);

      if (!rewardResult.success) {
        return res.status(400).json({ message: rewardResult.message });
      }

      return res.json({
        success: true,
        message: rewardResult.message,
        amount: rewardResult.amount || 0
      });
    }

    // For database coupons
    if (!couponId) {
      return res.status(400).json({ message: 'Coupon ID is required for non-predefined coupons' });
    }

    // Find coupon in database
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if coupon is already applied to this user
    if (user.coupons.includes(couponId)) {
      return res.status(400).json({ message: 'Coupon already applied to user' });
    }

    // Add coupon to user
    user.coupons.push(couponId);
    await user.save();

    // Update coupon usage for user
    const userIndex = coupon.users.findIndex(u =>
      u.user.toString() === userId.toString()
    );

    if (userIndex === -1) {
      coupon.users.push({ user: userId, timesUsed: 1 });
    } else {
      coupon.users[userIndex].timesUsed += 1;
    }

    coupon.usageCount += 1;
    await coupon.save();

    res.json({
      message: 'Coupon applied successfully',
      user: user._id,
      coupon: coupon._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active coupons for a user
router.get('/user/:userId/active', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('coupons');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get predefined coupons that this user is eligible for
    const eligiblePredefined = couponEngine.getValidCouponsForUser(user);

    // Format predefined coupons for consistent response
    const predefinedCouponsData = eligiblePredefined.map(code => {
      let couponData = {
        code,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      };

      switch (code) {
        case "GreenStart10":
          couponData = {
            ...couponData,
            description: "₹10 off on your first CNG or Electric ride",
            discountType: "Fixed",
            discountValue: 10,
            minRideValue: 50
          };
          break;
        case "EcoRide20":
          couponData = {
            ...couponData,
            description: "₹20 cashback after 3 shared rides this week",
            discountType: "Cashback",
            discountValue: 20,
            minRideValue: 30
          };
          break;
        case "ElectricSaver30":
          couponData = {
            ...couponData,
            description: "₹30 off electric rides above 10 km",
            discountType: "Fixed",
            discountValue: 30,
            minRideValue: 0
          };
          break;
        case "SharedBonus50":
          couponData = {
            ...couponData,
            description: "₹50 cashback for 5 shared rides in 30 days",
            discountType: "Cashback",
            discountValue: 50,
            minRideValue: 0
          };
          break;
        case "ReferralRide100":
          couponData = {
            ...couponData,
            description: "Earn 100 Eco Points when friends join and ride",
            discountType: "Points",
            discountValue: 100,
            minRideValue: 0
          };
          break;
      }

      return couponData;
    });

    // Filter only active and valid database coupons
    const now = new Date();
    const activeDatabaseCoupons = user.coupons?.filter(coupon =>
      coupon.isActive &&
      now >= coupon.validFrom &&
      now <= coupon.validUntil
    ) || [];

    // Combine predefined and database coupons
    const allCoupons = [
      ...predefinedCouponsData,
      ...activeDatabaseCoupons
    ];

    res.json(allCoupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add ride to user's ride history (called after a ride is completed)
router.post('/addRideToHistory', async (req, res) => {
  try {
    const { userId, rideId } = req.body;

    if (!userId || !rideId) {
      return res.status(400).json({ message: 'User ID and Ride ID are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Map standard ride types to our coupon system ride types
    let rideType = ride.rideType;
    if (ride.rideType === 'Carpool') {
      rideType = 'Shared';
    }

    // Add ride to history
    user.rideHistory.push({
      rideId: ride._id,
      type: rideType,
      distance: ride.distance,
      amount: ride.fare,
      date: ride.actualEndTime || ride.updatedAt
    });

    await user.save();

    // Check for any coupons the user is now eligible for
    const eligibleCoupons = couponEngine.getValidCouponsForUser(user);

    // Auto-apply coupons that provide immediate rewards
    const autoApplyCoupons = ["EcoRide20", "SharedBonus50"];
    const appliedRewards = [];

    for (const couponCode of eligibleCoupons) {
      if (autoApplyCoupons.includes(couponCode) && !user.couponsUsed.includes(couponCode)) {
        const rewardResult = await couponEngine.applyRewards(user, couponCode);
        if (rewardResult.success) {
          appliedRewards.push({
            code: couponCode,
            message: rewardResult.message,
            amount: rewardResult.amount
          });
        }
      }
    }

    res.json({
      message: 'Ride added to history',
      appliedRewards,
      eligibleCoupons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply coupon to ride
router.post('/applyToRide', async (req, res) => {
  try {
    const { rideId, couponCode, userId } = req.body;

    if (!rideId || !couponCode || !userId) {
      return res.status(400).json({ message: 'Ride ID, Coupon Code, and User ID are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // For predefined coupons that apply at booking time
    if (["GreenStart10", "ElectricSaver30"].includes(couponCode)) {
      // Map standard ride types to our coupon system ride types
      let rideType = ride.rideType;
      if (ride.rideType === 'Carpool') {
        rideType = 'Shared';
      }

      // Check eligibility
      const isEligible = couponEngine.checkCouponEligibility(user, couponCode);
      if (!isEligible) {
        return res.status(400).json({ message: 'You are not eligible for this coupon' });
      }

      // Check ride eligibility
      const rideEligibility = couponEngine.checkRideEligibility({
        type: rideType,
        fare: ride.fare,
        distance: ride.distance
      }, couponCode);

      if (!rideEligibility.eligible) {
        return res.status(400).json({ message: rideEligibility.message });
      }

      // Apply discount to ride
      const discountAmount = rideEligibility.discount;
      ride.fare = Math.max(0, ride.fare - discountAmount);

      // Mark coupon as used
      user.couponsUsed.push(couponCode);

      await ride.save();
      await user.save();

      return res.json({
        message: rideEligibility.message,
        discountAmount,
        newFare: ride.fare
      });
    }

    // For standard coupons from database
    const coupon = await Coupon.findOne({
      code: { $regex: new RegExp(`^${couponCode}$`, 'i') }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Apply standard coupon logic
    // Add coupon reference to ride
    ride.couponApplied = coupon._id;

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'Percentage') {
      discountAmount = ride.fare * coupon.discountValue / 100;

      // Apply max discount if specified
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountValue;
    }

    // Apply discount to ride
    ride.fare = Math.max(0, ride.fare - discountAmount);

    // Update coupon usage
    coupon.usageCount += 1;
    const userIndex = coupon.users.findIndex(u => u.user.toString() === userId.toString());
    if (userIndex === -1) {
      coupon.users.push({ user: userId, timesUsed: 1 });
    } else {
      coupon.users[userIndex].timesUsed += 1;
    }

    await ride.save();
    await coupon.save();

    res.json({
      message: 'Coupon applied successfully',
      discountAmount,
      newFare: ride.fare
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process referral
router.post('/processReferral', async (req, res) => {
  try {
    const { referrerUserId, newUserId } = req.body;

    if (!referrerUserId || !newUserId) {
      return res.status(400).json({ message: 'Referrer User ID and New User ID are required' });
    }

    const referrer = await User.findById(referrerUserId);
    if (!referrer) {
      return res.status(404).json({ message: 'Referrer not found' });
    }

    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return res.status(404).json({ message: 'New user not found' });
    }

    // Apply ReferralRide100 reward to referrer
    const rewardResult = await couponEngine.applyRewards(referrer, "ReferralRide100");

    if (!rewardResult.success) {
      return res.status(400).json({ message: rewardResult.message });
    }

    // Save referral relationship
    newUser.referredBy = referrer._id;
    await newUser.save();

    res.json({
      success: true,
      message: `Referral processed successfully. ${rewardResult.message}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;