const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link'],
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    branch: [{
        type: String,
        required: true,
        enum: [
            'computer',
            'it',
            'cs-ds',
            'electronics',
            'electrical',
            'mechanical',
            'civil',
            'instrumentation',
            'power-electronics',
            'chemical',
            'interview',
            'all'
        ]
    }],
    subject: {
        type: String,
        required: true,
        trim: true
    },
    semester: [{
        type: String,
        required: true
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedByName: {
        type: String,
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for faster queries
// Separate indexes for array fields to avoid parallel array indexing error
resourceSchema.index({ branch: 1 });
resourceSchema.index({ semester: 1 });
resourceSchema.index({ subject: 1 });
resourceSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
