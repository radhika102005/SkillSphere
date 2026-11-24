const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// GET /api/messages/conversations — latest message per partner
router.get(
  '/conversations',
  protect,
  asyncHandler(async (req, res) => {
    const me = new mongoose.Types.ObjectId(req.user._id);

    const rows = await Message.aggregate([
      { $match: { $or: [{ sender: me }, { receiver: me }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$sender', me] }, '$receiver', '$sender'] },
          lastMessage: { $first: '$text' },
          lastAt: { $first: '$createdAt' },
          unread: {
            $sum: { $cond: [{ $and: [{ $eq: ['$receiver', me] }, { $eq: ['$read', false] }] }, 1, 0] },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    const users = await User.find({ _id: { $in: rows.map((r) => r._id) } }).select('name university');
    const byId = Object.fromEntries(users.map((u) => [String(u._id), u]));

    const conversations = rows
      .filter((r) => byId[String(r._id)])
      .map((r) => ({
        user: byId[String(r._id)],
        lastMessage: r.lastMessage,
        lastAt: r.lastAt,
        unread: r.unread,
      }));

    res.json({ success: true, conversations });
  })
);

// GET /api/messages/:userId — thread with one user (marks incoming as read)
router.get(
  '/:userId',
  protect,
  asyncHandler(async (req, res) => {
    const other = req.params.userId;
    await Message.updateMany({ sender: other, receiver: req.user._id, read: false }, { read: true });

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: other },
        { sender: other, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  })
);

// POST /api/messages  { receiver, text }
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { receiver, text } = req.body;
    if (!receiver || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required' });
    }
    if (String(receiver) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself' });
    }
    const exists = await User.exists({ _id: receiver });
    if (!exists) return res.status(404).json({ success: false, message: 'User not found' });

    const message = await Message.create({ sender: req.user._id, receiver, text });
    res.status(201).json({ success: true, message });
  })
);

module.exports = router;
