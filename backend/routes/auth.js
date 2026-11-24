const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg });
    return false;
  }
  return true;
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  asyncHandler(async (req, res) => {
    if (!validate(req, res)) return;
    const { name, email, password, university, major, role } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists' });
    }

    const user = await User.create({ name, email, password, university, major, role });
    const safe = await User.findById(user._id);
    res.status(201).json({ success: true, token: signToken(user._id), user: safe });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    if (!validate(req, res)) return;
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const safe = await User.findById(user._id);
    res.json({ success: true, token: signToken(user._id), user: safe });
  })
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
