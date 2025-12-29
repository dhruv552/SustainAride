const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('rides')
      .populate('coupons')
      .populate('rewards');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const user = new User(req.body);

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user rides
router.get('/:id/rides', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('rides');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user coupons
router.get('/:id/coupons', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('coupons');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user rewards
router.get('/:id/rewards', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('rewards');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;