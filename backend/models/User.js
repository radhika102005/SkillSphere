const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    bio: { type: String, default: '', maxlength: 500 },
    university: { type: String, default: '', trim: true },
    major: { type: String, default: '', trim: true },
    year: { type: String, default: '' },
    skillsOffered: [skillSchema],
    skillsWanted: [{ type: String, trim: true }],
    role: { type: String, enum: ['student', 'mentor', 'both'], default: 'student' },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.index({ name: 'text', bio: 'text', 'skillsOffered.name': 'text' });

module.exports = mongoose.model('User', userSchema);
