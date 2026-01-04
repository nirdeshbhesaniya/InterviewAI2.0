const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Interview = require('../Models/Interview');
const { authenticateToken } = require('../middlewares/auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }
};

// Apply auth and admin check to all routes
router.use(authenticateToken, requireAdmin);

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password -sessions -tempUserData -twoFactorSecret')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// PATCH ban/unban user
router.patch('/users/:userId/ban', async (req, res) => {
    try {
        const { userId } = req.params;
        const { isBanned } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent banning self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot ban yourself' });
        }

        user.isBanned = isBanned;

        // If banning, maybe clear sessions to force logout immediatley? 
        // The middleware check handles the "next request", but clearing sessions is good practice.
        if (isBanned) {
            user.sessions = [];
        }

        await user.save();

        res.json({
            message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
            user: { _id: user._id, isBanned: user.isBanned }
        });
    } catch (err) {
        console.error('Error updating ban status:', err);
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

// PUT update user details (Admin)
router.put('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent demoting self if admin
        if (user._id.toString() === req.user._id.toString() && updates.role && updates.role !== 'admin') {
            return res.status(400).json({ message: 'Cannot remove your own admin privileges' });
        }

        // Allowed fields to update
        const allowedUpdates = ['fullName', 'email', 'role', 'bio', 'location', 'website', 'linkedin', 'github'];

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                user[key] = updates[key];
            }
        });

        await user.save();

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// GET pending Q&A requests (Global view for admin)
router.get('/qna-requests', async (req, res) => {
    try {
        // Find all interviews that have at least one pending question
        const interviews = await Interview.find({ 'qna.status': 'pending' });

        let pendingRequests = [];
        for (const interview of interviews) {
            const pendingParams = interview.qna.filter(q => q.status === 'pending');
            for (const q of pendingParams) {
                // Fetch requester details if needed (optional)
                const requester = await User.findById(q.requestedBy).select('fullName email photo');

                pendingRequests.push({
                    interviewId: interview._id,
                    sessionId: interview.sessionId,
                    interviewTitle: interview.title,
                    qnaId: q._id,
                    question: q.question,
                    answerParts: q.answerParts,
                    category: q.category,
                    requestedBy: requester || { _id: q.requestedBy },
                    createdAt: q.createdAt
                });
            }
        }

        res.json(pendingRequests);

    } catch (err) {
        console.error('Error fetching Q&A requests:', err);
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
});

module.exports = router;
