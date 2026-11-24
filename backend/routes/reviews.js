const express = require('express');
const Review = require('../models/Review');
const Mentorship = require('../models/Mentorship');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// POST /api/reviews  { reviewee, rating, comment }
// Only allowed after a completed session between the two users.
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { reviewee, rating, comment } = req.body;

    if (!reviewee || !rating) {
      return res.status(400).json({ success: false, message: 'Reviewee and rating are required' });
    }
    if (String(reviewee) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself' });
    }

    const session = await Mentorship.findOne({
      status: 'completed',
      $or: [
        { requester: req.user._id, recipient: reviewee },
        { requester: reviewee, recipient: req.user._id },
      ],
    });
    if (!session) {
      return res.status(403).json({ success: false, message: 'You can only review someone after a completed session together' });
    }

    const review = await Review.findOneAndUpdate(
      { reviewer: req.user._id, reviewee },
      { rating, comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await Review.recalculate(reviewee);

    res.status(201).json({ success: true, review });
  })
);

// GET /api/reviews/user/:id
router.get(
  '/user/:id',
  protect,
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ reviewee: req.params.id })
      .sort({ createdAt: -1 })
      .populate('reviewer', 'name university');
    res.json({ success: true, reviews });
  })
);

module.exports = router;
