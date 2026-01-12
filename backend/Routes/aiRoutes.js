const express = require('express');
const router = express.Router();
const AIUsageLog = require('../models/AIUsageLog');
const aiKeyManager = require('../utils/AIKeyManager');
const { authenticateToken } = require('../middlewares/auth');

// Middleware to check for Admin OR Owner (Read Access)
const requireAdminOrOwner = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin or Owner rights required.' });
    }
};

// Middleware to check for Owner ONLY (Write/Control Access)
const requireOwner = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Owner rights required.' });
    }
};

/**
 * GET /api/ai/dashboard
 * Aggregated stats for the dashboard.
 */
router.get('/dashboard', authenticateToken, requireAdminOrOwner, async (req, res) => {
    try {
        // 1. Get System Health (Key Status)
        const systemStatus = aiKeyManager.getSystemStatus();

        // 2. Get Usage Stats (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const usageStats = await AIUsageLog.aggregate([
            {
                $match: {
                    date: { $gte: sevenDaysAgoStr }
                }
            },
            {
                $group: {
                    _id: '$date',
                    totalOpenAI: { $sum: '$openaiCount' },
                    totalOpenRouter: { $sum: '$openRouterCount' },
                    uniqueUsers: { $addToSet: '$userId' } // Count unique users later
                }
            },
            {
                $sort: { _id: 1 } // Sort by date ascending
            }
        ]);

        // Format stats for frontend chart
        // Create a map of existing stats
        const statsMap = new Map(usageStats.map(stat => [stat._id, stat]));

        // Generate last 7 days
        const formattedUsage = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            if (statsMap.has(dateStr)) {
                const stat = statsMap.get(dateStr);
                formattedUsage.push({
                    date: dateStr,
                    openai: stat.totalOpenAI || 0,
                    openRouter: stat.totalOpenRouter || 0,
                    activeUsers: stat.uniqueUsers ? stat.uniqueUsers.length : 0
                });
            } else {
                formattedUsage.push({
                    date: dateStr,
                    openai: 0,
                    openRouter: 0,
                    activeUsers: 0
                });
            }
        }

        // 3. Get Today's totals
        const todayStr = new Date().toISOString().split('T')[0];
        const todayStats = await AIUsageLog.aggregate([
            { $match: { date: todayStr } },
            {
                $group: {
                    _id: null,
                    totalOpenAI: { $sum: '$openaiCount' },
                    totalOpenRouter: { $sum: '$openRouterCount' },
                    totalRequests: { $sum: { $add: ['$openaiCount', '$openRouterCount'] } }
                }
            }
        ]);

        const todayTotals = todayStats[0] || { totalOpenAI: 0, totalOpenRouter: 0, totalRequests: 0 };

        res.json({
            status: 'success',
            systemStatus,
            usageStats: formattedUsage,
            todayTotals
        });

    } catch (error) {
        console.error('Error fetching AI dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
});

/**
 * POST /api/ai/control
 * Lock or Unlock API Keys. (Owner Only)
 */
router.post('/control', authenticateToken, requireOwner, (req, res) => {
    const { action, key, provider } = req.body;

    if (!action || !key) {
        return res.status(400).json({ message: 'Missing action or key' });
    }

    let success = false;

    if (provider === 'openRouter') {
        if (action === 'lock') {
            success = aiKeyManager.forceDisableKey(key);
        } else if (action === 'unlock') {
            success = aiKeyManager.enableKey(key);
        }
    } else {
        return res.status(400).json({ message: 'Only OpenRouter keys can be managed currently.' });
    }

    if (success) {
        res.json({ message: `Key successfully ${action}ed`, updatedStatus: aiKeyManager.getSystemStatus() });
    } else {
        res.status(404).json({ message: 'Key not found' });
    }
});

/**
 * GET /api/ai/logs
 * detailed transaction logs
 */
router.get('/logs', authenticateToken, requireAdminOrOwner, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // We need to unwind the 'requests' array from AIUsageLog to show individual transactions
        // However, 'requests' array inside documents can get large, so standard find() on log documents 
        // returns grouped data. 
        // The user wants "relevant info show on owner".
        // A simple approach is to fetch the most recent AIUsageLog documents and flatten them in JS, 
        // but for pagination that's tricky.
        // Better approach: Use aggregation to unwind and sort by timestamp.

        const logs = await AIUsageLog.aggregate([
            { $match: {} }, // Match all (can filter by date if needed for perf)
            { $unwind: '$requests' },
            { $sort: { 'requests.timestamp': -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $project: {
                    timestamp: '$requests.timestamp',
                    provider: '$requests.provider',
                    model: '$requests.model',
                    status: '$requests.status',
                    tokens: '$requests.tokens',
                    userEmail: { $arrayElemAt: ['$userInfo.email', 0] },
                    userName: { $arrayElemAt: ['$userInfo.fullName', 0] }
                }
            }
        ]);

        // Get total count (approximation for performance)
        // Calculating total unwound documents is expensive. Let's just return what we have or cap it.
        // For a dashboard, infinite scroll or "load more" is often better, or just "Recent 100".
        // We'll return the page data.

        res.json({
            status: 'success',
            logs
        });

    } catch (error) {
        console.error('Error fetching AI logs:', error);
        res.status(500).json({ message: 'Failed to fetch logs' });
    }
});

const SystemSetting = require('../models/SystemSetting');
const { invalidateFeatureCache, getFeatureStatus } = require('../middlewares/featureAuth');

// ... existing code ...

/**
 * GET /api/ai/features
 * Get all AI-related feature flags.
 */
router.get('/features', authenticateToken, requireAdminOrOwner, async (req, res) => {
    try {
        const features = [
            'ai_interview_generation',
            'ai_mcq_generation',
            'ai_chatbot'
        ];

        const settings = [];
        for (const key of features) {
            const isEnabled = await getFeatureStatus(key, true);
            settings.push({ key, isEnabled, label: formatFeatureLabel(key) });
        }

        res.json({
            status: 'success',
            features: settings
        });
    } catch (error) {
        console.error('Error fetching features:', error);
        res.status(500).json({ message: 'Failed to fetch features' });
    }
});

/**
 * POST /api/ai/features/toggle
 * Toggle a feature. (Owner Only)
 */
router.post('/features/toggle', authenticateToken, requireOwner, async (req, res) => {
    try {
        const { key, isEnabled } = req.body;

        if (typeof isEnabled !== 'boolean') {
            return res.status(400).json({ message: 'isEnabled must be a boolean' });
        }

        await SystemSetting.findOneAndUpdate(
            { key },
            {
                value: isEnabled,
                updatedBy: req.user._id,
                description: `Feature flag for ${key}`
            },
            { upsert: true, new: true }
        );

        // Clear cache so changes take effect immediately
        invalidateFeatureCache(key);

        res.json({
            message: `Feature ${formatFeatureLabel(key)} ${isEnabled ? 'enabled' : 'disabled'} successfully.`,
            key,
            isEnabled
        });

    } catch (error) {
        console.error('Error toggling feature:', error);
        res.status(500).json({ message: 'Failed to update feature' });
    }
});

function formatFeatureLabel(key) {
    const labels = {
        'ai_interview_generation': 'Interview Generation',
        'ai_mcq_generation': 'MCQ Test Generation',
        'ai_chatbot': 'AI Chatbot'
    };
    return labels[key] || key;
}

module.exports = router;
