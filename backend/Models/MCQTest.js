const mongoose = require('mongoose');

const MCQTestSchema = new mongoose.Schema({
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
    topic: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner'
    },
    specialization: {
        type: String,
        trim: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    timeSpent: {
        type: Number,
        required: true,
        comment: 'Time spent in seconds'
    },
    userAnswers: {
        type: Map,
        of: Number,
        default: {}
    },
    questionsWithAnswers: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
    }],
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
        enum: ['completed', 'auto-submitted', 'timeout'],
        default: 'completed'
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
MCQTestSchema.index({ userId: 1, createdAt: -1 });
MCQTestSchema.index({ userEmail: 1, createdAt: -1 });

// Virtual for formatted date
MCQTestSchema.virtual('formattedDate').get(function () {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Method to get performance level
MCQTestSchema.methods.getPerformanceLevel = function () {
    if (this.score >= 90) return 'Excellent';
    if (this.score >= 75) return 'Good';
    if (this.score >= 60) return 'Average';
    return 'Needs Improvement';
};

const MCQTest = mongoose.model('MCQTest', MCQTestSchema);

module.exports = MCQTest;
