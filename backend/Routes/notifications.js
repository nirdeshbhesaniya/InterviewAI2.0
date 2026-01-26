const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const UserSettings = require('../models/UserSettings');
const User = require('../models/User'); // Import User model
const { sendNotificationEmail } = require('../utils/emailService');

// GET all notifications for a user (Individual + Broadcasts)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, skip = 0, unreadOnly = false } = req.query;

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        // Fetch user to check role (for 'all_admins' targeting)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Store userId as string to match Notification model
        const userIdStr = userId.toString();

        // Base query for individual notifications
        const individualQuery = { userId: userIdStr };

        // Base query for broadcast notifications
        const broadcastQuery = {
            recipientType: { $in: ['all', 'broadcast'] }, // Support both legacy/new enum if needed, but strict enum is 'broadcast' implies targetAudience
            isActive: true
            // Add audience check below
        };

        // Construct complex query using $or
        const matchConditions = [
            { userId: userIdStr }, // Individual
            {
                recipientType: { $in: ['all', 'broadcast'] },
                isActive: true,
                targetAudience: 'all',
                hiddenBy: { $ne: userIdStr } // userIdStr or userId, ensure consistent type but usually objectId in DB vs string? 
                // DB stores ObjectIds in array. $ne handles mixed if properly cast? 
                // Safest to just rely on mongoose or pass userId. 
                // Let's assume standard behavior. hiddenBy: { $ne: userId }
            }
        ];

        if (user.role === 'admin' || user.role === 'owner') {
            matchConditions.push({
                recipientType: { $in: ['all', 'broadcast'] },
                isActive: true,
                targetAudience: 'admins',
                hiddenBy: { $ne: userIdStr }
            });
        }

        // If unreadOnly requested
        // Individual: read = false
        // Broadcast: userId NOT in readBy
        let finalQuery = { $or: matchConditions };

        if (unreadOnly === 'true') {
            finalQuery = {
                $or: matchConditions.map(cond => {
                    // For individual (userId exists)
                    if (cond.userId) return { ...cond, read: false };
                    // For broadcast (recipientType exists)
                    return { ...cond, readBy: { $ne: userId } };
                })
            };
        }

        // We can't easily sort mixed types if we fetch separately, so we use one query
        // But 'read' field vs 'readBy' array makes simple sort hard if we want "read status" to be consistent?
        // No, we just want list of notifications sorted by date.

        // Revised Strategy: Just fetch all matching candidates, then process unread logic if needed?
        // No, unreadOnly filter is common.
        // Let's rely on the $or construction above.

        const notifications = await Notification.find(finalQuery)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Calculate counts
        // 1. Individual Unread
        const individualUnread = await Notification.countDocuments({ userId: userIdStr, read: false });

        // 2. Broadcast Unread
        const broadcastMatch = {
            recipientType: { $in: ['all', 'broadcast'] },
            isActive: true,
            readBy: { $ne: userId },
            hiddenBy: { $ne: userId },
            $or: [{ targetAudience: 'all' }]
        };
        if (user.role === 'admin' || user.role === 'owner') {
            broadcastMatch.$or.push({ targetAudience: 'admins' });
        }
        const broadcastUnread = await Notification.countDocuments(broadcastMatch);

        const unreadCount = individualUnread + broadcastUnread;

        // Total Count (Individual + Broadcasts relevant to user)
        const totalIndividual = await Notification.countDocuments({ userId: userIdStr });
        const totalBroadcastMatch = {
            recipientType: { $in: ['all', 'broadcast'] },
            isActive: true,
            hiddenBy: { $ne: userId },
            $or: [{ targetAudience: 'all' }]
        };
        if (user.role === 'admin' || user.role === 'owner') {
            totalBroadcastMatch.$or.push({ targetAudience: 'admins' });
        }
        const totalBroadcast = await Notification.countDocuments(totalBroadcastMatch);
        const totalCount = totalIndividual + totalBroadcast;

        // Map notifications to add a virtual 'isRead' property for the frontend
        const mappedNotifications = notifications.map(notif => {
            const n = notif.toObject();
            if (n.recipientType === 'individual' || n.userId) {
                n.isRead = n.read;
            } else {
                n.isRead = n.readBy && n.readBy.some(id => id.toString() === userId || id.toString() === userIdStr);
            }
            return n;
        });

        res.json({
            success: true,
            notifications: mappedNotifications,
            unreadCount,
            totalCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// POST create new notification (Individual only - kept for legacy/user actions)
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
            recipientType: 'individual', // Explicitly set
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

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required' });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (markAll) {
            // 1. Mark individual notifications as read (userId stored as string in Notification model)
            const updateResult1 = await Notification.updateMany(
                { userId: userId.toString(), read: false },
                { $set: { read: true } }
            );
            console.log(`Marked ${updateResult1.modifiedCount} individual notifications as read for user ${userId}`);

            // 2. Mark relevant broadcasts as read (push to readBy)
            // BroadCast notifications should not be marked as read by "Mark All" action
            // They must be individually read or interacted with.
            /* 
            const broadcastQuery = {
                recipientType: { $in: ['all', 'broadcast'] },
                isActive: true,
                readBy: { $ne: userId },
                $or: [{ targetAudience: 'all' }]
            };
            if (user.role === 'admin' || user.role === 'owner') {
                broadcastQuery.$or.push({ targetAudience: 'admins' });
            }

            const updateResult2 = await Notification.updateMany(
                broadcastQuery,
                { $addToSet: { readBy: userId } }
            );
            console.log(`Marked ${updateResult2.modifiedCount} broadcast notifications as read for user ${userId}`);
            */
            const updateResult2 = { modifiedCount: 0 };

            return res.json({
                success: true,
                message: 'Individual notifications marked as read',
                individualUpdated: updateResult1.modifiedCount,
                broadcastUpdated: 0
            });
        }

        if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
            // Processing mixed types is tricky with updateMany in one go if logic differs
            // So we split by type

            // Find types
            const notifs = await Notification.find({ _id: { $in: notificationIds } });

            const individualIds = [];
            const broadcastIds = [];

            notifs.forEach(n => {
                if (n.recipientType === 'individual' || n.userId) {
                    individualIds.push(n._id);
                } else {
                    broadcastIds.push(n._id);
                }
            });

            if (individualIds.length > 0) {
                await Notification.updateMany(
                    { _id: { $in: individualIds } },
                    { $set: { read: true } }
                );
            }

            if (broadcastIds.length > 0) {
                await Notification.updateMany(
                    { _id: { $in: broadcastIds } },
                    { $addToSet: { readBy: userId } }
                );
            }

            return res.json({ success: true, message: 'Notifications marked as read' });
        }

        return res.status(400).json({
            success: false,
            message: 'Either notificationIds or markAll=true required'
        });

    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notifications as read', error: error.message });
    }
});

// DELETE notification(s) - Only allows deleting individual notifications from user's view
// Users generally cannot delete "Broadcasts" from the DB, only "hide" them (which is equivalent to reading/ignoring? Or separate ignoredBy?)
// For now, delete will only work for individual notifications.
router.delete('/', async (req, res) => {
    try {
        const { notificationIds, userId, deleteAll = false } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required' });
        }

        if (deleteAll) {
            // 1. Delete individual notifications
            const deleteResult = await Notification.deleteMany({ userId });

            // 2. Hide all relevant broadcast notifications
            const broadcastQuery = {
                recipientType: { $in: ['all', 'broadcast'] },
                isActive: true,
                hiddenBy: { $ne: userId },
                $or: [{ targetAudience: 'all' }]
            };

            const user = await User.findById(userId);
            if (user && (user.role === 'admin' || user.role === 'owner')) {
                broadcastQuery.$or.push({ targetAudience: 'admins' });
            }

            const updateResult = await Notification.updateMany(
                broadcastQuery,
                { $addToSet: { hiddenBy: userId } }
            );

            return res.json({
                success: true,
                deletedCount: deleteResult.deletedCount + updateResult.modifiedCount,
                message: 'All notifications cleared'
            });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Split by type
            const notifs = await Notification.find({ _id: { $in: notificationIds } });

            const individualIds = [];
            const broadcastIds = [];

            notifs.forEach(n => {
                if (n.recipientType === 'individual' || n.userId) {
                    individualIds.push(n._id);
                } else {
                    broadcastIds.push(n._id);
                }
            });

            let deletedCount = 0;

            if (individualIds.length > 0) {
                const res = await Notification.deleteMany({ _id: { $in: individualIds } });
                deletedCount += res.deletedCount;
            }

            if (broadcastIds.length > 0) {
                const res = await Notification.updateMany(
                    { _id: { $in: broadcastIds } },
                    { $addToSet: { hiddenBy: userId } }
                );
                deletedCount += res.modifiedCount;
            }

            return res.json({
                success: true,
                deletedCount
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid delete request'
            });
        }
    } catch (error) {
        console.error('Delete notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete notifications' });
    }
});

// GET notification stats
router.get('/stats/:userId', async (req, res) => {
    // ... Implement logic similar to GET /:userId for unification if needed, 
    // but for now keeping it simple or deprecated.
    // Let's update it to be correct count at least.
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false });

        // Count Individual
        const indTotal = await Notification.countDocuments({ userId });
        const indUnread = await Notification.countDocuments({ userId, read: false });

        // Count Broadcast
        const broadcastMatch = {
            recipientType: { $in: ['all', 'broadcast'] },
            isActive: true,
            hiddenBy: { $ne: userId },
            $or: [{ targetAudience: 'all' }]
        };
        if (user.role === 'admin' || user.role === 'owner') {
            broadcastMatch.$or.push({ targetAudience: 'admins' });
        }

        // We can't efficiently count "total" separately from "unread" for broadcast easily without complex queries?
        // Actually we can.
        const broadTotal = await Notification.countDocuments(broadcastMatch);

        const broadUnreadMatch = { ...broadcastMatch, readBy: { $ne: userId } };
        const broadUnread = await Notification.countDocuments(broadUnreadMatch);

        res.json({
            success: true,
            stats: {
                total: indTotal + broadTotal,
                unread: indUnread + broadUnread
            }
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
