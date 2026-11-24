const express = require('express');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

const populate = [
  { path: 'requester', select: 'name university major rating' },
  { path: 'recipient', select: 'name university major rating' },
];

// POST /api/mentorship  — send a request
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { recipient, skill, message, scheduledAt } = req.body;

    if (!recipient || !skill) {
      return res.status(400).json({ success: false, message: 'Recipient and skill are required' });
    }
    if (String(recipient) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot send a request to yourself' });
    }
    const target = await User.findById(recipient);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const dup = await Mentorship.findOne({
      requester: req.user._id,
      recipient,
      skill,
      status: { $in: ['pending', 'accepted'] },
    });
    if (dup) {
      return res.status(400).json({ success: false, message: 'You already have an open request for this skill' });
    }

    const doc = await Mentorship.create({
      requester: req.user._id,
      recipient,
      skill,
      message,
      scheduledAt,
    });
    const full = await doc.populate(populate);
    res.status(201).json({ success: true, mentorship: full });
  })
);

// GET /api/mentorship  — everything involving me
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const id = req.user._id;
    const all = await Mentorship.find({ $or: [{ requester: id }, { recipient: id }] })
      .sort({ createdAt: -1 })
      .populate(populate);

    const received = all.filter((m) => String(m.recipient._id) === String(id));
    const sent = all.filter((m) => String(m.requester._id) === String(id));
    res.json({ success: true, received, sent });
  })
);

// PUT /api/mentorship/:id  { status }
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['accepted', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const m = await Mentorship.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Request not found' });

    const isRecipient = String(m.recipient) === String(req.user._id);
    const isRequester = String(m.requester) === String(req.user._id);
    if (!isRecipient && !isRequester) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    if ((status === 'accepted' || status === 'declined') && !(isRecipient && m.status === 'pending')) {
      return res.status(400).json({ success: false, message: 'Only the recipient can respond to a pending request' });
    }
    if (status === 'completed' && m.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted sessions can be completed' });
    }

    m.status = status;
    await m.save();

    if (status === 'completed') {
      // Teacher (recipient) earns more points than the learner
      await User.findByIdAndUpdate(m.recipient, { $inc: { points: 20 } });
      await User.findByIdAndUpdate(m.requester, { $inc: { points: 10 } });
    }

    const full = await m.populate(populate);
    res.json({ success: true, mentorship: full });
  })
);

module.exports = router;
