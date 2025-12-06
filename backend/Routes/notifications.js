const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification');
const UserSettings = require('../Models/UserSettings');
const { sendNotificationEmail } = require('../utils/emailService');

// GET all notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, skip = 0, unreadOnly = false } = req.query;

        const query = { userId };
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const unreadCount = await Notification.countDocuments({ userId, read: false });
        const totalCount = await Notification.countDocuments({ userId });

        res.json({
            success: true,
            notifications,
            unreadCount,
            totalCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// POST create new notification
router.post('/', async (req, res) => {
    try {
        const { userId, type, title, message, action, actionUrl, metadata } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, title, and message are required'
            });
        }

        // Create notification
        const notification = new Notification({
            userId,
            type: type || 'info',
            title,
            message,
            action,
            actionUrl,
            metadata: metadata || {}
        });

        await notification.save();

        // Check user settings for email notifications
        const userSettings = await UserSettings.findOne({ userId });

        if (userSettings?.notifications?.email !== false) {
            try {
                await sendNotificationEmail(userId, title, message, action, actionUrl);
                notification.emailSent = true;
                await notification.save();
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
});

// PATCH mark notification(s) as read
router.patch('/mark-read', async (req, res) => {
    try {
        const { notificationIds, userId, markAll = false } = req.body;

        let result;
        if (markAll && userId) {
            result = await Notification.updateMany(
                { userId, read: false },
                { $set: { read: true } }
            );
        } else if (notificationIds && Array.isArray(notificationIds)) {
            result = await Notification.updateMany(
                { _id: { $in: notificationIds } },
                { $set: { read: true } }
            );
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either notificationIds or userId with markAll=true required'
            });
        }

        res.json({
            success: true,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
    }
});

// DELETE notification(s)
router.delete('/', async (req, res) => {
    try {
        const { notificationIds, userId, deleteAll = false } = req.body;

        let result;
        if (deleteAll && userId) {
            result = await Notification.deleteMany({ userId });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            result = await Notification.deleteMany({ _id: { $in: notificationIds } });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either notificationIds or userId with deleteAll=true required'
            });
        }

        res.json({
            success: true,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Delete notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete notifications' });
    }
});

// GET notification stats
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await Notification.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalCount = await Notification.countDocuments({ userId });
        const unreadCount = await Notification.countDocuments({ userId, read: false });

        res.json({
            success: true,
            stats: {
                total: totalCount,
                unread: unreadCount,
                byType: stats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notification stats' });
    }
});

module.exports = router;
