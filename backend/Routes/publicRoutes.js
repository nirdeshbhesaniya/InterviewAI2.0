const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/public/stats
// Public endpoint to get application statistics
router.get('/stats', require('../middlewares/cache')(600), async (req, res) => {
    try {
        // Count total users
        // Use estimatedDocumentCount for speed if large, or countDocuments for accuracy
        // For "Active Users" we might want to filter by lastLogin, but usually total registered is used for marketing.
        // Let's use countDocuments({}) for total registered users.
        const totalUsers = await User.countDocuments({});

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers,
                // We can add more stats here later if needed
                activeUsers: totalUsers // Using total as active for now, or could use recent logins if we track them efficiently
            }
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

module.exports = router;
