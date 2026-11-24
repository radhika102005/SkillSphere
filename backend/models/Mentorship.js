const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: [true, 'Skill is required'], trim: true },
    message: { type: String, default: '', maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
    },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mentorship', mentorshipSchema);
