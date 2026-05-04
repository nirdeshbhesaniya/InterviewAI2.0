const SystemSetting = require('../models/SystemSetting');
const { getFeatureDefinition } = require('../utils/featureRegistry');

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
        // Use findOneAndUpdate with upsert to atomically get-or-create the setting.
        // This eliminates the duplicate-key race condition that occurred when two
        // concurrent requests both tried to create the same missing setting.
        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            { $setOnInsert: { key, value: defaultValue, description: `Feature flag for ${key}` } },
            { upsert: true, new: true }
        );

        featureCache.set(key, { value: setting.value, timestamp: now });
        return setting.value;

    } catch (error) {
        console.error(`Error checking feature flag ${key}:`, error);
        // Fail open: allow the feature if DB is unavailable to avoid blocking users.
        return defaultValue;
    }
};

const setFeatureStatus = async (key, isEnabled, updatedBy = null, description = '') => {
    const featureDefinition = getFeatureDefinition(key);

    const setting = await SystemSetting.findOneAndUpdate(
        { key },
        {
            value: isEnabled,
            updatedBy,
            description: description || featureDefinition?.description || `Feature flag for ${key}`
        },
        { upsert: true, new: true }
    );

    featureCache.set(key, { value: setting.value, timestamp: Date.now() });
    return setting;
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

module.exports = { checkFeatureEnabled, getFeatureStatus, setFeatureStatus, invalidateFeatureCache };
