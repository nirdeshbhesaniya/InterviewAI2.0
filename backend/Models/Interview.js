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
      answerParts: [AnswerPartSchema]
    }
  ],
  creatorEmail: { type: String, required: true }, // 👈 Add this
  deleteOTP: { type: String }, // 👈 Temporary OTP for deletion
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);
