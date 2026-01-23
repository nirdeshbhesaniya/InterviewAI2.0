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
                    totalGemini: { $sum: '$geminiCount' },
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
                    gemini: stat.totalGemini || 0,
                    activeUsers: stat.uniqueUsers ? stat.uniqueUsers.length : 0
                });
            } else {
                formattedUsage.push({
                    date: dateStr,
                    openai: 0,
                    openRouter: 0,
                    gemini: 0,
                    activeUsers: 0
                });
            }
        }

        // 3. Get Today's totals with breakdown
        const todayStr = new Date().toISOString().split('T')[0];
        const todayStats = await AIUsageLog.aggregate([
            { $match: { date: todayStr } },
            { $unwind: '$requests' }, // Unwind to count individual requests by type
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    totalTokens: { $sum: '$requests.tokens' },
                    byType: {
                        $push: {
                            type: '$requests.requestType',
                            count: 1
                        }
                    }
                }
            },
            {
                $project: {
                    totalRequests: 1,
                    totalTokens: 1,
                    breakdown: {
                        $reduce: {
                            input: '$byType',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    { $literal: { ['$$this.type']: 1 } } // Simplified counting - actually let's use a better group strategy
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        // Better aggregation for breakdown
        const todayBreakdown = await AIUsageLog.aggregate([
            { $match: { date: todayStr } },
            { $unwind: '$requests' },
            {
                $group: {
                    _id: '$requests.requestType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Count today's usage by provider for summary cards
        const todayProviderStats = await AIUsageLog.aggregate([
            { $match: { date: todayStr } },
            {
                $group: {
                    _id: null,
                    openAI: { $sum: '$openaiCount' },
                    openRouter: { $sum: '$openRouterCount' },
                    gemini: { $sum: '$geminiCount' }
                }
            }
        ]);

        const todayTotals = {
            totalRequests: todayBreakdown.reduce((acc, curr) => acc + curr.count, 0),
            breakdown: todayBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
            totalOpenAI: todayProviderStats[0]?.openAI || 0,
            totalOpenRouter: todayProviderStats[0]?.openRouter || 0,
            totalGemini: todayProviderStats[0]?.gemini || 0
        };

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
        const search = req.query.search || '';
        const providerFilter = req.query.provider || '';
        const statusFilter = req.query.status || '';

        const skip = (page - 1) * limit;

        // Base match for requests array fields (optimize by filtering before lookup if possible)
        let requestMatch = {};
        if (providerFilter && providerFilter !== 'all') {
            requestMatch['requests.provider'] = providerFilter;
        }
        if (statusFilter && statusFilter !== 'all') {
            requestMatch['requests.status'] = statusFilter;
        }

        const stats = await AIUsageLog.aggregate([
            // 1. Unwind to work with individual requests
            { $unwind: '$requests' },

            // 2. Filter requests based on provider/status
            { $match: requestMatch },

            // 3. Sort by timestamp descending (newest first)
            { $sort: { 'requests.timestamp': -1 } },

            // 4. Join with User data
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },

            // 5. Search Filter (if search query exists)
            ...(search ? [{
                $match: {
                    $or: [
                        { 'userInfo.fullName': { $regex: search, $options: 'i' } },
                        { 'userInfo.email': { $regex: search, $options: 'i' } },
                        // Optional: Search by model or request type
                        { 'requests.model': { $regex: search, $options: 'i' } }
                    ]
                }
            }] : []),

            // 6. Facet for Pagination and Data
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                timestamp: '$requests.timestamp',
                                provider: '$requests.provider',
                                model: '$requests.model',
                                status: '$requests.status',
                                tokens: '$requests.tokens',
                                requestType: '$requests.requestType',
                                usageDetails: '$requests.usageDetails',
                                userEmail: '$userInfo.email',
                                userName: '$userInfo.fullName'
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0];
        const logs = result.data;
        const totalCount = result.metadata[0] ? result.metadata[0].total : 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            status: 'success',
            logs,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages
            }
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
