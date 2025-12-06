const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pdf', 'youtube'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    likes: [{
        userId: String,
        userName: String,
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    viewers: [{
        userId: String,
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
noteSchema.index({ createdAt: -1 });
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ type: 1, createdAt: -1 });
noteSchema.index({ tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
