const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 600 },
    url: { type: String, default: '', trim: true },
    category: { type: String, default: 'General', trim: true },
    type: { type: String, enum: ['article', 'video', 'course', 'tool', 'other'], default: 'article' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
