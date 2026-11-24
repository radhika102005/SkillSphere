const express = require('express');
const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/users?search=&skill=&role=
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { search, skill, role } = req.query;
    const filter = { _id: { $ne: req.user._id } };

    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { bio: rx }, { university: rx }, { 'skillsOffered.name': rx }];
    }
    if (skill) filter['skillsOffered.name'] = new RegExp(escapeRegex(skill), 'i');
    if (role) filter.role = { $in: [role, 'both'] };

    const users = await User.find(filter).sort({ rating: -1, points: -1 }).limit(60);
    res.json({ success: true, count: users.length, users });
  })
);

// GET /api/users/me/stats
router.get(
  '/me/stats',
  protect,
  asyncHandler(async (req, res) => {
    const id = req.user._id;
    const [pending, active, completed, unread] = await Promise.all([
      Mentorship.countDocuments({ recipient: id, status: 'pending' }),
      Mentorship.countDocuments({ $or: [{ requester: id }, { recipient: id }], status: 'accepted' }),
      Mentorship.countDocuments({ $or: [{ requester: id }, { recipient: id }], status: 'completed' }),
      Message.countDocuments({ receiver: id, read: false }),
    ]);
    res.json({
      success: true,
      stats: {
        pending,
        active,
        completed,
        unread,
        points: req.user.points,
        rating: req.user.rating,
        reviewCount: req.user.reviewCount,
      },
    });
  })
);

// PUT /api/users/me
router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'bio', 'university', 'major', 'year', 'role', 'skillsOffered', 'skillsWanted'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) req.user[key] = req.body[key];
    });
    await req.user.save();
    res.json({ success: true, user: req.user });
  })
);

// GET /api/users/:id
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  })
);

module.exports = router;
