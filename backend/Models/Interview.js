const mongoose = require('mongoose');

const AnswerPartSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'code'], required: true },
  content: { type: String, required: true }
});

const InterviewSchema = new mongoose.Schema({
  sessionId: String,
  title: String,
  tag: String,
  initials: String,
  experience: String,
  desc: String,
  color: String,
  qna: [
    {
      question: String,
      category: String, // 👈 Added category
      answerParts: [AnswerPartSchema],
      status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
      requestedBy: { type: String }, // User ID
      createdAt: { type: Date, default: Date.now }
    }
  ],
  creatorEmail: { type: String, required: true }, // 👈 Add this
  deleteOTP: { type: String }, // 👈 Temporary OTP for deletion
  creatorDetails: {
    fullName: String,
    email: String,
    photo: String,
    bio: String,
    location: String,
    website: String,
    linkedin: String,
    github: String
  },
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);
