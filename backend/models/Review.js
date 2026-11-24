const mongoose = require('mongoose');
const User = require('./User');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

// One review per reviewer/reviewee pair
reviewSchema.index({ reviewer: 1, reviewee: 1 }, { unique: true });

// Recompute the reviewee's average rating
reviewSchema.statics.recalculate = async function (userId) {
  const stats = await this.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$reviewee', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await User.findByIdAndUpdate(userId, {
    rating: stats.length ? Math.round(stats[0].avg * 10) / 10 : 0,
    reviewCount: stats.length ? stats[0].count : 0,
  });
};

module.exports = mongoose.model('Review', reviewSchema);
