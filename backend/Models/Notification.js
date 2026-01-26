const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: function () {
            // userId is only required for individual notifications
            return this.recipientType === 'individual';
        },
        index: true
    },
    type: {
        type: String,
        enum: ['success', 'info', 'warning', 'error'],
        default: 'info'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    // Extended fields for Broadcast support
    recipientType: {
        type: String,
        enum: ['individual', 'broadcast'],
        default: 'individual'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'admins', 'none'],
        default: 'none'
    },
    // For broadcast messages, we track who has read them here
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        default: null
    },
    actionUrl: {
        type: String,
        default: null
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ recipientType: 1, targetAudience: 1, isActive: 1 }); // For fetching broadcasts

module.exports = mongoose.model('Notification', notificationSchema);
