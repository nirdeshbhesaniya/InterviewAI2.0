const redisClient = require('../utils/redisClient');

const cache = (duration) => {
    return async (req, res, next) => {
        // If Redis is not connected or client is missing, verify connectivity status or skip caching
        if (!redisClient || !redisClient.isOpen) {
            console.warn('⚠️ Redis not available, skipping cache');
            return next();
        }

        // Generate cache key
        // We include query parameters to ensure unique cache per filter
        let key = `__express__${req.originalUrl || req.url}`;

        // If user is logged in, append user ID to ensure personalization (e.g. pending status) is not shared globally unless intended
        // For public endpoints that don't depend on user context, this might be redundant but safer.
        // However, for lists like "All Notes", if they change based on "Who is viewing" (e.g. creator sees pending), we MUST cache per user or includes user-specific logic.
        // Given logical constraints:
        // - Public Routes (stats): No user context needed -> Global cache.
        // - Notes/Resources: "Creator view" shows pending. Normal view shows only approved.

        // Strategy: 
        // If req.user exists, we append user ID. This means logged-in users get their OWN cache.
        // Guests share a "guest" cache.
        // This effectively caches PERSONALIZED views, but might reduce cache hit rate for common content across users.
        // For "Get All Notes" which is heavily filtered, this is acceptable.

        if (req.user) {
            key += `__user__${req.user._id || req.user.userId}`;
        } else {
            key += `__guest`;
        }

        try {
            const cachedBody = await redisClient.get(key);
            if (cachedBody) {
                // console.log(`🚀 Cache HIT for ${key}`);
                res.setHeader('X-Cache', 'HIT');
                return res.send(JSON.parse(cachedBody));
            } else {
                // console.log(`MISS for ${key}, fetching...`);
                res.setHeader('X-Cache', 'MISS');
                res.sendResponse = res.send;
                res.send = (body) => {
                    // Cache the response
                    // Only cache successful 200 responses
                    if (res.statusCode === 200) {
                        redisClient.setEx(key, duration, body).catch(err => console.error('Redis Set Error:', err));
                    }
                    res.sendResponse(body);
                };
                next();
            }
        } catch (error) {
            console.error('Redis Cache Error:', error);
            next();
        }
    };
};

module.exports = cache;
