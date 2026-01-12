const SystemSetting = require('../models/SystemSetting');

// Simple in-memory cache to avoid DB hits on every request
// In a distributed system, use Redis or short TTL.
const featureCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const getFeatureStatus = async (key, defaultValue = true) => {
    const now = Date.now();
    if (featureCache.has(key)) {
        const { value, timestamp } = featureCache.get(key);
        if (now - timestamp < CACHE_TTL) {
            return value;
        }
    }

    try {
        let setting = await SystemSetting.findOne({ key });

        // If setting doesn't exist, create it with default
        if (!setting) {
            setting = await SystemSetting.create({
                key,
                value: defaultValue,
                description: `Feature flag for ${key}`
            });
        }

        featureCache.set(key, { value: setting.value, timestamp: now });
        return setting.value;

    } catch (error) {
        console.error(`Error checking feature flag ${key}:`, error);
        // Fail open (allow feature) or closed? 
        // Failing open is usually better for UX if DB is flaky, unless it's critical.
        // Let's fallback to default.
        return defaultValue;
    }
};

/**
 * Middleware to check if a feature is enabled.
 * @param {string} featureKey - The unique key for the feature (e.g., 'ai_mcq_generation')
 * @param {string} customMessage - Optional custom error message
 */
const checkFeatureEnabled = (featureKey, customMessage) => {
    return async (req, res, next) => {
        // Skip check for admins/owners if we want them to bypass locks?
        // Usually feature flags apply to everyone to stop system load, 
        // BUT for testing, owners might want access.
        // Let's ENFORCE it for everyone for now to act as a "Kill Switch".
        // If the user wants to test, they can re-enable it.

        const isEnabled = await getFeatureStatus(featureKey, true);

        if (!isEnabled) {
            // If Owner, maybe respond with a warning header but allow?
            // Or simpler: strictly block. The prompt says "lock any specific AI service".
            // Strict lock is safer for "cost control".

            // UNLESS: The prompt implies ONLY blocking regular users? 
            // "Owner can lock... to handle AI servise"
            // Typically a kill switch kills it for everyone.

            return res.status(503).json({
                success: false,
                message: customMessage || 'This feature is currently disabled by the administrator.',
                code: 'FEATURE_DISABLED'
            });
        }

        next();
    };
};

/**
 * Clear cache for a key (call this when updating settings)
 */
const invalidateFeatureCache = (key) => {
    featureCache.delete(key);
};

module.exports = { checkFeatureEnabled, getFeatureStatus, invalidateFeatureCache };
