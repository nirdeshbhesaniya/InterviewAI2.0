const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} must have exactly 4 options']
    },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // Index 0-3
    explanation: { type: String, default: '' },
    codeSnippet: { type: String, default: '' } // Added codeSnippet field
});

function arrayLimit(val) {
    return val.length === 4;
}

const practiceTestSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    topic: { type: String, required: true, trim: true },
    branch: { type: String, default: 'computer' },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: [questionsLimit, 'Test must have at least 1 question']
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
    attempts: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 1 }, // Default 1 attempt
    timeLimit: { type: Number, default: 30 }, // Default 30 minutes
    guidelines: { type: String, default: '' }, // Markdown or text instructions
    passingScore: { type: Number, default: 40 }, // Default passing percentage
    isTimeRestricted: { type: Boolean, default: false }, // If true, test is only available between startTime and endTime
    startTime: { type: Date },
    endTime: { type: Date }
}, {
    timestamps: true
});

function questionsLimit(val) {
    return val.length > 0;
}

const PracticeTest = mongoose.model('PracticeTest', practiceTestSchema);

module.exports = PracticeTest;
