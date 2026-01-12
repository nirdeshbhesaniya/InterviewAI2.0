const express = require('express');
const router = express.Router();
const UserSettings = require('../models/UserSettings');

// GET user settings
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        let settings = await UserSettings.findOne({ userId });

        // Create default settings if not exists
        if (!settings) {
            settings = new UserSettings({ userId });
            await settings.save();
        }

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
});

// PUT update user settings
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { notifications, privacy, appearance } = req.body;

        let settings = await UserSettings.findOne({ userId });

        if (!settings) {
            settings = new UserSettings({ userId });
        }

        // Update settings
        if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
        if (privacy) settings.privacy = { ...settings.privacy, ...privacy };
        if (appearance) settings.appearance = { ...settings.appearance, ...appearance };

        await settings.save();

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
});

// PATCH update specific setting
router.patch('/:userId/:category/:setting', async (req, res) => {
    try {
        const { userId, category, setting } = req.params;
        const { value } = req.body;

        let settings = await UserSettings.findOne({ userId });

        if (!settings) {
            settings = new UserSettings({ userId });
        }

        // Update specific setting
        if (settings[category]) {
            settings[category][setting] = value;
            await settings.save();
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Update specific setting error:', error);
        res.status(500).json({ success: false, message: 'Failed to update setting' });
    }
});

module.exports = router;
