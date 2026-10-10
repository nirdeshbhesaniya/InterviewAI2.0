const mongoose = require('mongoose');

// ─── MCQ Question Schema (unchanged) ───
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} must have exactly 4 options']
    },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // Index 0-3
    explanation: { type: String, default: '' },
    codeSnippet: { type: String, default: '' }, // Added codeSnippet field
    moduleIndex: { type: Number, default: 0 } // Link to modules array
});

function arrayLimit(val) {
    return val.length === 4;
}

// ─── DSA Public Test Case Schema ───
const publicTestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    explanation: { type: String, default: '' }
}, { _id: true });

// ─── DSA Hidden Test Case Schema ───
const hiddenTestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true }
}, { _id: true });

// ─── DSA Question Schema ───
const dsaQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },          // Problem statement (markdown)
    constraints: { type: String, default: '' },              // Constraints text
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    allowedLanguages: {
        type: [String],
        default: ['cpp', 'java', 'python', 'javascript'],
        validate: {
            validator: function (val) { return val.length > 0; },
            message: 'At least one language must be allowed'
        }
    },
    maxScore: { type: Number, default: 100 },                // Points for this question
    timeLimit: { type: Number, default: 2 },                 // Execution time limit in seconds per test case
    memoryLimit: { type: Number, default: 256 },             // Memory limit in MB
    starterCode: {
        type: Map,
        of: String,
        default: {}                                           // language → starter template code
    },
    driverCode: {
        type: Map,
        of: String,
        default: {}                                           // language → driver wrapper code
    },
    publicTestCases: {
        type: [publicTestCaseSchema],
        validate: {
            validator: function (val) { return val.length >= 2; },
            message: 'At least 2 public test cases are required'
        }
    },
    hiddenTestCases: {
        type: [hiddenTestCaseSchema],
        validate: {
            validator: function (val) { return val.length >= 1; },
            message: 'At least 1 hidden test case is required'
        }
    },
    moduleIndex: { type: Number, default: 0 }               // Which module this belongs to
}, { _id: true });

// ─── Module Config Schema (for per-module timing) ───
const moduleSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        enum: ['mcq', 'dsa'],
        required: true
    },
    title: { type: String, default: '' },
    timeLimit: { type: Number, default: 30 },                // Per-module time in minutes
    order: { type: Number, default: 0 },
    passingScore: { type: Number, default: 40 }
}, { _id: true });

// ─── Main Practice Test Schema ───
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

    // ─── Module Type ───
    moduleType: {
        type: String,
        enum: ['mcq', 'dsa', 'mixed'],
        default: 'mcq'
    },

    // ─── Module Configs (for mixed/multi-module tests) ───
    modules: {
        type: [moduleSchema],
        default: []
    },

    // ─── MCQ Questions (used when moduleType is 'mcq' or 'mixed') ───
    questions: {
        type: [questionSchema],
        default: [],
        validate: {
            validator: function (val) {
                // MCQ questions are required only for 'mcq' type
                if (this.moduleType === 'mcq') return val.length > 0;
                return true; // DSA or mixed can have 0 MCQ questions
            },
            message: 'MCQ test must have at least 1 question'
        }
    },

    // ─── DSA Questions (used when moduleType is 'dsa' or 'mixed') ───
    dsaQuestions: {
        type: [dsaQuestionSchema],
        default: [],
        validate: {
            validator: function (val) {
                // DSA questions are required only for 'dsa' type
                if (this.moduleType === 'dsa') return val.length > 0;
                return true;
            },
            message: 'DSA test must have at least 1 DSA question'
        }
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
    attempts: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 1 },               // Default 1 attempt
    timeLimit: { type: Number, default: 30 },                // Default 30 minutes (overall fallback)
    guidelines: { type: String, default: '' },               // Markdown or text instructions
    passingScore: { type: Number, default: 40 },             // Default passing percentage
    isTimeRestricted: { type: Boolean, default: false },
    securityEnabled: { type: Boolean, default: false },      // Flag for strict proctoring
    startTime: { type: Date },
    endTime: { type: Date }
}, {
    timestamps: true
});

const PracticeTest = mongoose.model('PracticeTest', practiceTestSchema);

module.exports = PracticeTest;
