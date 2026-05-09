const mongoose = require('mongoose');

const practiceTestResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true,
        index: true
    },
    practiceTestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PracticeTest',
        required: true,
        index: true
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    timeSpent: {
        type: Number,
        default: 0,
        comment: 'Time spent in seconds'
    },
    userAnswers: {
        type: Map,
        of: Number,
        default: {}
    },
    securityWarnings: {
        fullscreenExits: {
            type: Number,
            default: 0
        },
        tabSwitches: {
            type: Number,
            default: 0
        }
    },
    testStatus: {
        type: String,
        enum: ['in-progress', 'completed', 'auto-submitted', 'timeout', 'abandoned'],
        default: 'in-progress'
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for analytics
practiceTestResultSchema.index({ practiceTestId: 1, testStatus: 1 });

const PracticeTestResult = mongoose.model('PracticeTestResult', practiceTestResultSchema);

module.exports = PracticeTestResult;
