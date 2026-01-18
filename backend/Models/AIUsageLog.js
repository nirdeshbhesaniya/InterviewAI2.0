const mongoose = require('mongoose');

const aiUsageLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        index: true
    },
    openaiCount: {
        type: Number,
        default: 0
    },
    openRouterCount: {
        type: Number,
        default: 0
    },
    requests: [{
        timestamp: { type: Date, default: Date.now },
        provider: String,
        model: String,
        status: String,
        tokens: Number,
        requestType: { type: String, default: 'GENERAL' }, // e.g., MCQ_GENERATION, CHATBOT
        usageDetails: { type: mongoose.Schema.Types.Mixed } // Flexible object for extra data (topic, etc)
    }]
}, {
    timestamps: true
});

// Compound index for fast lookups
aiUsageLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AIUsageLog', aiUsageLogSchema);
