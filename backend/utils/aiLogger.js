const AIUsageLog = require('../models/AIUsageLog');

/**
 * Log AI usage stats to MongoDB
 * @param {string} userId - The user's ID
 * @param {string} provider - 'openai' or 'openrouter'
 * @param {string} model - Model name used
 * @param {string} status - 'success' or 'failed'
 * @param {number} tokens - Estimated tokens (optional)
 */
const logAIUsage = async (userId, provider, model, status, tokens = 0, requestType = 'GENERAL', usageDetails = {}) => {
    if (!userId) return;

    const date = new Date().toISOString().split('T')[0];

    try {
        await AIUsageLog.findOneAndUpdate(
            { userId, date },
            {
                $inc: {
                    openaiCount: provider === 'openai' ? 1 : 0,
                    openRouterCount: provider === 'openrouter' ? 1 : 0
                },
                $push: {
                    requests: {
                        provider,
                        model,
                        status,
                        tokens,
                        requestType,
                        usageDetails,
                        timestamp: new Date()
                    }
                }
            },
            { upsert: true, new: true }
        );
        console.log(`[AI Logger] Logged usage for user ${userId}`);
    } catch (err) {
        console.error('[AI Logger] Failed to log usage:', err);
    }
};

module.exports = { logAIUsage };
