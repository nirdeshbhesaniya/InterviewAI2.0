const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        interviewReminders: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: true },
        newFeatures: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true }
    },
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'friends'],
            default: 'public'
        },
        showEmail: { type: Boolean, default: false },
        showStats: { type: Boolean, default: true }
    },
    appearance: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        },
        language: { type: String, default: 'en' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
