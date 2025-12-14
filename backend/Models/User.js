const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  token: String,
  device: String,
  browser: String,
  os: String,
  ip: String,
  location: String,
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  photo: String, // image filename or URL
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    testReminders: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  sessions: [sessionSchema],
  lastPasswordChange: Date,
  accountDeletionRequested: { type: Boolean, default: false },
  deletionRequestDate: Date,
  deletionConfirmationToken: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: String,
  otpExpires: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
