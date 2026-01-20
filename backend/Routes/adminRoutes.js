const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Interview = require('../models/Interview');
const { authenticateToken } = require('../middlewares/auth');

// Middleware to check if user is admin or owner
const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin or Owner rights required.' });
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

        const requester = req.user;

        // Role Management Rules:
        // 1. Only 'owner' can change ANY user's role to/from 'admin'.
        // 2. Admins cannot change roles at all.
        // 3. Admins cannot modify other admins or the owner.

        if (updates.role) {
            // Check if role is changing
            if (updates.role !== user.role) {
                if (requester.role !== 'owner') {
                    return res.status(403).json({ message: 'Only the Owner can change user roles.' });
                }

                // Owner cannot demote themselves (unless transferring ownership, but let's block simple demotion)
                if (user._id.toString() === requester._id.toString() && updates.role !== 'owner') {
                    return res.status(400).json({ message: 'Cannot demote yourself from Owner.' });
                }
            }
        }

        // General Profile Updates Limitation for Admins:
        // Admins should not be able to edit other Admins or Owner
        if (requester.role === 'admin' && (user.role === 'admin' || user.role === 'owner') && user._id.toString() !== requester._id.toString()) {
            return res.status(403).json({ message: 'Admins cannot edit other Admins or the Owner.' });
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { category } = req.query;

        // Build Aggregation Pipeline
        const pipeline = [
            // 1. Match interviews with at least one pending question
            { $match: { 'qna.status': 'pending' } },
            // 2. Unwind qna array to process individual questions
            { $unwind: '$qna' },
            // 3. Match only pending questions and optional category filter
            {
                $match: {
                    'qna.status': 'pending',
                    ...(category ? { 'qna.category': category } : {})
                }
            },
            // 4. Lookup user details (requester)
            {
                $lookup: {
                    from: 'users', // Collection name for User model
                    localField: 'qna.requestedBy',
                    foreignField: '_id',
                    as: 'requester'
                }
            },
            // 5. Unwind requester (preserve if missing, though it shouldn't be)
            { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },
            // 6. Search Match (if provided)
            ...(req.query.search ? [{
                $match: {
                    $or: [
                        { 'qna.question': { $regex: req.query.search, $options: 'i' } },
                        { 'qna.category': { $regex: req.query.search, $options: 'i' } },
                        { 'requester.fullName': { $regex: req.query.search, $options: 'i' } },
                        { 'requester.email': { $regex: req.query.search, $options: 'i' } }
                    ]
                }
            }] : []),
            // 7. Sort by creation date (newest first)
            { $sort: { 'qna.createdAt': -1 } }
        ];

        // Get Total Count for Pagination (before skip/limit)
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await Interview.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Apply Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        // Project final shape
        pipeline.push({
            $project: {
                interviewId: '$_id',
                sessionId: '$sessionId',
                interviewTitle: '$title',
                qnaId: '$qna._id',
                question: '$qna.question',
                answerParts: '$qna.answerParts',
                category: '$qna.category',
                requestedBy: {
                    _id: '$requester._id',
                    fullName: '$requester.fullName',
                    email: '$requester.email',
                    photo: '$requester.photo'
                },
                createdAt: '$qna.createdAt'
            }
        });

        const pendingRequests = await Interview.aggregate(pipeline);

        res.json({
            success: true,
            data: pendingRequests,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRequests: total,
                hasMore: page * limit < total
            }
        });

    } catch (err) {
        console.error('Error fetching Q&A requests:', err);
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
});

// POST approve ALL pending Q&A requests
router.post('/approve-all-qna', async (req, res) => {
    try {
        const interviews = await Interview.find({ 'qna.status': 'pending' });

        let approvedCount = 0;

        for (const interview of interviews) {
            let modified = false;
            interview.qna.forEach(q => {
                if (q.status === 'pending') {
                    q.status = 'approved';
                    // Optional: Create notification for requester here if needed, 
                    // skipping for bulk performance for now unless critical.
                    modified = true;
                    approvedCount++;
                }
            });

            if (modified) {
                await interview.save();
            }
        }

        res.json({ message: `Successfully approved ${approvedCount} questions across ${interviews.length} sessions.`, count: approvedCount });

    } catch (err) {
        console.error('Error approving all requests:', err);
        res.status(500).json({ message: 'Failed to approve all requests' });
    }
});

// DELETE user (Admin)
router.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        // Soft delete (or hard delete if preferred, but usually soft first)
        // User requested "delete any user account", implying removal. 
        // We will perform a hard delete for "Delete" action to fully remove data as requested, 
        // OR a strict soft delete. Given "isDeleted" exists in schema, let's use that but ensure it BLOCKS access.
        // Actually, for "Delete" button in Admin, typically means hard delete or irreversible soft delete.
        // Let's do Soft Delete + Ban to be safe, or Hard Delete if they want to clean up.
        // User said "if any user account deleted... not able to use any service".
        // Use soft delete with isDeleted flag.

        user.isDeleted = true;
        user.isBanned = true; // Double ensure lock
        user.sessions = []; // Kill sessions
        await user.save();

        // Optionally remove related data? For now, we keep data but user is gone.

        res.json({ message: 'User account deleted and access revoked successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// DELETE interview session (Admin)
router.delete('/interviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findByIdAndDelete(id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        res.json({ message: 'Interview session deleted successfully' });
    } catch (err) {
        console.error('Error deleting interview:', err);
        res.status(500).json({ message: 'Failed to delete interview session' });
    }
});

// DELETE Note (Admin)
router.delete('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Assuming you have a Note model, but it wasn't required at top.
        // I need to require it or use mongoose.model('Note') if strictly dynamic, 
        // but better to add `const Note = require('../Models/Note');` at top if not there.
        // Checking imports... Note is missing. I will add it to imports in a separate edit or use mongoose.model.
        // For safety/cleanliness, I'll use mongoose.model if I can't confirm the file path, 
        // but I should add the import.
        // Let's assume the file is '../Models/Note'.
        const Note = require('../models/Note');
        const note = await Note.findByIdAndDelete(id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ message: 'Failed to delete note' });
    }
});

// DELETE Resource (Admin)
router.delete('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Resource = require('../models/Resource');
        const resource = await Resource.findByIdAndDelete(id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Error deleting resource:', err);
        res.status(500).json({ message: 'Failed to delete resource' });
    }
});

// CREATE Practice Test (Admin)
router.post('/practice-tests', async (req, res) => {
    try {
        const { title, description, topic, difficulty, questions, isPublished } = req.body;
        const PracticeTest = require('../models/PracticeTest');

        const newTest = new PracticeTest({
            title,
            description,
            topic,
            difficulty,
            questions, // Array of { question, options, correctAnswer, explanation }
            createdBy: req.user._id,
            isPublished: isPublished !== undefined ? isPublished : true
        });

        await newTest.save();
        res.status(201).json({ message: 'Practice test created successfully', test: newTest });
    } catch (err) {
        console.error('Error creating practice test:', err);
        res.status(500).json({ message: 'Failed to create practice test', error: err.message });
    }
});

// UPDATE Practice Test (Admin)
router.put('/practice-tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const PracticeTest = require('../models/PracticeTest');

        const test = await PracticeTest.findByIdAndUpdate(id, updates, { new: true });

        if (!test) {
            return res.status(404).json({ message: 'Practice test not found' });
        }

        res.json({ message: 'Practice test updated successfully', test });
    } catch (err) {
        console.error('Error updating practice test:', err);
        res.status(500).json({ message: 'Failed to update practice test' });
    }
});

// DELETE Practice Test (Admin)
router.delete('/practice-tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const PracticeTest = require('../models/PracticeTest');

        const test = await PracticeTest.findByIdAndDelete(id);

        if (!test) {
            return res.status(404).json({ message: 'Practice test not found' });
        }

        res.json({ message: 'Practice test deleted successfully' });
    } catch (err) {
        console.error('Error deleting practice test:', err);
        res.status(500).json({ message: 'Failed to delete practice test' });
    }
});

// POST Create Notification (Owner Only)
router.post('/notifications/create', async (req, res) => {
    try {
        // Strict Owner Check
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only the Owner can create broadcast notifications.' });
        }

        const { title, message, recipientType, recipientId, isEmailSent } = req.body;
        const Notification = require('../models/Notification');
        const { sendNotificationEmail } = require('../utils/emailService');

        if (!title || !message || !recipientType) {
            return res.status(400).json({ message: 'Title, message, and recipientType are required.' });
        }

        let notificationData = {
            title,
            message,
            recipientType,
            createdBy: req.user._id,
            isActive: true,
            emailSent: isEmailSent || false
        };

        if (recipientType === 'user' || recipientType === 'admin') {
            if (!recipientId) return res.status(400).json({ message: 'Recipient ID required for specific user/admin.' });
            notificationData.recipientType = 'individual';
            notificationData.userId = recipientId; // Legacy support
            notificationData.targetAudience = 'none';
        } else if (recipientType === 'all') {
            notificationData.recipientType = 'broadcast';
            notificationData.targetAudience = 'all';
        } else if (recipientType === 'all_admins') {
            notificationData.recipientType = 'broadcast';
            notificationData.targetAudience = 'admins';
        }

        const notification = new Notification(notificationData);
        await notification.save();

        // Handle Email Sending
        if (isEmailSent) {
            // Async execution to not block response
            (async () => {
                try {
                    if (recipientType === 'user' || recipientType === 'admin') {
                        // Fetch email
                        const targetUser = await User.findById(recipientId);
                        if (targetUser && targetUser.preferences?.emailNotifications !== false) {
                            await sendNotificationEmail(targetUser.email, title, message);
                        }
                    } else {
                        // Broadcast Email
                        let query = {};
                        if (recipientType === 'all_admins') {
                            query.role = { $in: ['admin', 'owner'] };
                        } else if (recipientType === 'all') {
                            // Fetch all users? Be careful.
                            // For now, let's limit or chunk.
                            // query is empty {}
                        }

                        // We only send to those who have email enabled
                        query['preferences.emailNotifications'] = { $ne: false };

                        // Limit to avoid explosion? 
                        const users = await User.find(query, 'email');

                        console.log(`Sending broadcast email to ${users.length} users...`);

                        // Send in chunks or sequentially
                        // Use a simple loop for now (SendGrid/Brevo usually handles rate limits, but we should be careful)
                        for (const u of users) {
                            try {
                                await sendNotificationEmail(u.email, title, message);
                            } catch (e) {
                                console.error(`Failed to send email to ${u.email}`, e.message);
                            }
                        }
                        console.log('Broadcast emails sent.');
                    }
                } catch (emailErr) {
                    console.error('Error in email sending task:', emailErr);
                }
            })();
        }

        res.status(201).json({ message: 'Notification created successfully', notification });

    } catch (err) {
        console.error('Error creating notification:', err);
        res.status(500).json({ message: 'Failed to create notification' });
    }
});

module.exports = router;
