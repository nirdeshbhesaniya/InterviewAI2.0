const mongoose = require('mongoose');

// ─── DSA Result per question ───
const dsaResultSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    language: { type: String, default: 'python' },
    code: { type: String, default: '' },
    publicTestsPassed: { type: Number, default: 0 },
    publicTestsTotal: { type: Number, default: 0 },
    hiddenTestsPassed: { type: Number, default: 0 },
    hiddenTestsTotal: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 },  // ms
    status: {
        type: String,
        enum: ['pending', 'public_passed', 'evaluated', 'failed'],
        default: 'pending'
    }
}, { _id: true });

// ─── Per-module result ───
const moduleResultSchema = new mongoose.Schema({
    moduleIndex: { type: Number, default: 0 },
    moduleType: {
        type: String,
        enum: ['mcq', 'dsa'],
        default: 'mcq'
    },
    score: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }  // seconds
}, { _id: false });

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

    // ─── DSA Results ───
    dsaResults: {
        type: [dsaResultSchema],
        default: []
    },

    // ─── Per-Module Results ───
    moduleResults: {
        type: [moduleResultSchema],
        default: []
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
