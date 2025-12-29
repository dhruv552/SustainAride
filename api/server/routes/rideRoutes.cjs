const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride.cjs');
const User = require('../models/User.cjs');

// Get all rides
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('user', '-password')
      .populate('couponApplied');
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ride by ID
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user', '-password')
      .populate('couponApplied');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Book a new ride
router.post('/', async (req, res) => {
  try {
    const ride = new Ride(req.body);
    const newRide = await ride.save();

    // Update user's rides array
    await User.findByIdAndUpdate(
      req.body.user,
      { $push: { rides: newRide._id } }
    );

    // Populate user data before sending response
    const populatedRide = await Ride.findById(newRide._id)
      .populate('user', '-password')
      .populate('couponApplied');

    res.status(201).json(populatedRide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ride details
router.put('/:id', async (req, res) => {
  try {
    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', '-password')
      .populate('couponApplied');

    if (!updatedRide) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(updatedRide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel a ride
router.put('/:id/cancel', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Only allow cancellation if ride is not yet completed
    if (ride.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed ride' });
    }

    ride.status = 'Cancelled';
    await ride.save();

    res.json({ message: 'Ride cancelled successfully', ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete a ride
router.put('/:id/complete', async (req, res) => {
  try {
    const { rating, feedback, actualEndTime } = req.body;

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Only allow completion if ride is ongoing
    if (ride.status !== 'Ongoing') {
      return res.status(400).json({ message: 'Only ongoing rides can be completed' });
    }

    ride.status = 'Completed';
    ride.actualEndTime = actualEndTime || new Date();

    if (rating) ride.rating = rating;
    if (feedback) ride.feedback = feedback;

    // Calculate and assign sustainPoints if using sustainable options
    if (ride.rideType === 'Electric' || ride.rideType === 'Carpool') {
      const pointsEarned = Math.ceil(ride.distance * 2); // 2 points per km
      ride.sustainPointsEarned = pointsEarned;

      // Add sustainPoints to user
      await User.findByIdAndUpdate(
        ride.user,
        { $inc: { sustainPoints: pointsEarned } }
      );
    }

    await ride.save();

    res.json({ message: 'Ride completed successfully', ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete ride
router.delete('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Remove ride reference from user
    await User.findByIdAndUpdate(
      ride.user,
      { $pull: { rides: ride._id } }
    );

    await Ride.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rides by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.params.userId })
      .populate('couponApplied')
      .sort({ scheduledTime: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;