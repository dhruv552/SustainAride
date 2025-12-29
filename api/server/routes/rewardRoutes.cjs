const express = require('express');
const rewardController = require('../controllers/rewardController.cjs');
const authMiddleware = require('../middlewares/auth.cjs');
const router = express.Router();
const Reward = require('../models/Reward.cjs');
const User = require('../models/User.cjs');

// Get all rewards
router.get('/', async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reward by ID
router.get('/:id', async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new reward
router.post('/', async (req, res) => {
  try {
    const reward = new Reward(req.body);
    const newReward = await reward.save();
    res.status(201).json(newReward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update reward
router.put('/:id', async (req, res) => {
  try {
    const updatedReward = await Reward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedReward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    res.json(updatedReward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete reward
router.delete('/:id', async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    // Remove reward references from users
    await User.updateMany(
      { rewards: reward._id },
      { $pull: { rewards: reward._id } }
    );

    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available rewards for a user based on their points
router.get('/available/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userPoints = user.sustainPoints || 0;

    // Get all active rewards
    const now = new Date();
    const availableRewards = await Reward.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      pointsRequired: { $lte: userPoints }
    });

    res.json(availableRewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Redeem a reward
router.post('/redeem', async (req, res) => {
  try {
    const { rewardId, userId } = req.body;

    // Find reward and user
    const reward = await Reward.findById(rewardId);
    const user = await User.findById(userId);

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if reward is active and valid
    const now = new Date();
    if (!reward.isActive || now < reward.validFrom || now > reward.validUntil) {
      return res.status(400).json({ message: 'This reward is not available for redemption' });
    }

    // Check if reward is already redeemed by user
    const userRedemption = reward.redeemedBy.find(r => r.user.toString() === userId.toString());
    if (userRedemption) {
      return res.status(400).json({ message: 'You have already redeemed this reward' });
    }

    // Check if user has enough points
    if (user.sustainPoints < reward.pointsRequired) {
      return res.status(400).json({
        message: `Insufficient points. Required: ${reward.pointsRequired}, Available: ${user.sustainPoints}`
      });
    }

    // Check if reward has reached redemption limit
    if (reward.redemptionLimit > 0 && reward.redemptionCount >= reward.redemptionLimit) {
      return res.status(400).json({ message: 'This reward has reached its redemption limit' });
    }

    // Deduct points from user
    user.sustainPoints -= reward.pointsRequired;

    // Add reward to user
    if (!user.rewards.includes(rewardId)) {
      user.rewards.push(rewardId);
    }

    await user.save();

    // Update reward redemption
    reward.redemptionCount += 1;
    reward.redeemedBy.push({
      user: userId,
      redeemedAt: now,
      status: 'Pending'
    });

    await reward.save();

    res.json({
      message: 'Reward redeemed successfully',
      reward,
      remainingPoints: user.sustainPoints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update redemption status
router.put('/redeem/:rewardId/user/:userId', async (req, res) => {
  try {
    const { rewardId, userId } = req.params;
    const { status } = req.body;

    // Valid status values
    const validStatus = ['Pending', 'Redeemed', 'Expired'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatus.join(', ')}`
      });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    // Find and update user redemption
    const userRedemptionIndex = reward.redeemedBy.findIndex(
      r => r.user.toString() === userId
    );

    if (userRedemptionIndex === -1) {
      return res.status(404).json({ message: 'Redemption record not found' });
    }

    reward.redeemedBy[userRedemptionIndex].status = status;
    await reward.save();

    res.json({
      message: 'Redemption status updated successfully',
      redemption: reward.redeemedBy[userRedemptionIndex]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rewards redeemed by a user
router.get('/user/:userId/redeemed', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('rewards');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/rewards/claim-eco-bonus
 * @desc    Claim eco bonus during pollution alert
 * @access  Private
 */
router.post('/claim-eco-bonus', authMiddleware, rewardController.claimEcoBonus);

/**
 * @route   POST /api/rewards/process-ride-eco-rewards
 * @desc    Process eco rewards for completed rides during pollution alert
 * @access  Private
 */
router.post('/process-ride-eco-rewards', authMiddleware, rewardController.processRideEcoRewards);

/**
 * @route   GET /api/rewards/eco-rewards/:userId
 * @desc    Get pollution alert eco rewards for a user
 * @access  Private
 */
router.get('/eco-rewards/:userId', authMiddleware, rewardController.getUserEcoRewards);

module.exports = router;