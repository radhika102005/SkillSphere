const express = require('express');
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/learning?search=&category=&type=
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { search, category, type } = req.query;
    const filter = {};
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    if (type) filter.type = type;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { category: rx }];
    }
    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('author', 'name');
    res.json({ success: true, resources });
  })
);

// POST /api/learning
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { title, description, url, category, type } = req.body;
    const resource = await Resource.create({
      title,
      description,
      url,
      category,
      type,
      author: req.user._id,
    });
    const full = await resource.populate('author', 'name');
    res.status(201).json({ success: true, resource: full });
  })
);

// PUT /api/learning/:id/like — toggle
router.put(
  '/:id/like',
  protect,
  asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const idx = resource.likes.findIndex((u) => String(u) === String(req.user._id));
    if (idx >= 0) resource.likes.splice(idx, 1);
    else resource.likes.push(req.user._id);
    await resource.save();

    res.json({ success: true, likes: resource.likes });
  })
);

// DELETE /api/learning/:id — author only
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (String(resource.author) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the author can delete this' });
    }
    await resource.deleteOne();
    res.json({ success: true });
  })
);

module.exports = router;
