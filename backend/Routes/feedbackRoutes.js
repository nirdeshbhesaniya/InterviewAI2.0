const express = require('express');
const router = express.Router();
const Feedback = require('../Models/FeedbackModel');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/feedback - Submit feedback
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required' });
        }

        const feedback = new Feedback({
            user: req.user.id,
            rating,
            comment
        });

        await feedback.save();

        res.status(201).json({ success: true, message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/feedback/public - Get featured feedback for Landing Page
router.get('/public', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ isVisible: true, isFeatured: true })
            .populate('user', 'fullName photo') // Adjusted to match User model
            .sort({ createdAt: -1 })
            .limit(6);

        // If not enough featured, fill with recent high rated ones? 
        // For now, let's just return what we have. If 0 featured, maybe return top rated?
        // Let's stick to strict 'isFeatured' for control, or fallback to high rated if empty.

        let result = feedbacks;
        if (result.length === 0) {
            // Fallback: Show high rated recent ones if no featured ones exist yet
            result = await Feedback.find({ isVisible: true, rating: { $gte: 4 } })
                .populate('user', 'fullName photo') // Adjust fields based on User model
                .sort({ createdAt: -1 })
                .limit(6);
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching public feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/feedback/admin - Get all feedback for Admin with pagination
router.get('/admin', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Feedback.countDocuments();
        const feedbacks = await Feedback.find({})
            .populate('user', 'fullName email photo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            feedbacks,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching admin feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PATCH /api/feedback/admin/:id - Update feedback status
router.patch('/admin/:id', authenticateToken, async (req, res) => {
    try {
        const { isFeatured, isVisible } = req.body;
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (isFeatured !== undefined) feedback.isFeatured = isFeatured;
        if (isVisible !== undefined) feedback.isVisible = isVisible;

        await feedback.save();
        res.json({ success: true, feedback });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
