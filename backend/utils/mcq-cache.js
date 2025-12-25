// MCQ Cache - In-memory caching for faster question retrieval
// Using native Map for zero dependencies

// Cache storage: Map<cacheKey, {questions: Array, timestamp: number}>
const cacheStore = new Map();
const CACHE_TTL = 86400000; // 24 hours in milliseconds

// Cleanup interval - remove expired entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cacheStore.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            cacheStore.delete(key);
            console.log(`🗑️ Expired cache entry removed: ${key}`);
        }
    }
}, 3600000); // Run every hour

/**
 * Generate cache key from topic and difficulty
 */
function getCacheKey(topic, difficulty = 'medium') {
    return `mcq_${topic.toLowerCase().replace(/\s+/g, '_')}_${difficulty}`;
}

/**
 * Get questions from cache
 * @param {string} topic - Topic name
 * @param {string} difficulty - Difficulty level
 * @param {number} count - Number of questions needed
 * @returns {Array|null} Array of questions or null if not enough in cache
 */
function getFromCache(topic, difficulty = 'medium', count = 30) {
    const cacheKey = getCacheKey(topic, difficulty);
    const cached = cacheStore.get(cacheKey);

    if (!cached) {
        console.log(`❌ Cache MISS for ${topic} (${difficulty})`);
        return null;
    }

    // Check if cache is expired
    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
        cacheStore.delete(cacheKey);
        console.log(`⏰ Cache EXPIRED for ${topic} (${difficulty})`);
        return null;
    }

    const questions = cached.questions;

    // Check if we have enough questions in cache
    if (!Array.isArray(questions) || questions.length < count) {
        console.log(`⚠️ Cache has only ${questions?.length || 0}/${count} questions for ${topic}`);
        return null;
    }

    // Randomly select questions from cache pool
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    console.log(`✅ Cache HIT for ${topic} (${difficulty}) - Serving ${count} questions from pool of ${questions.length}`);

    return selected;
}

/**
 * Add questions to cache
 * @param {string} topic - Topic name
 * @param {string} difficulty - Difficulty level
 * @param {Array} questions - Questions to cache
 */
function addToCache(topic, difficulty = 'medium', questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
        return;
    }

    const cacheKey = getCacheKey(topic, difficulty);
    const existing = cacheStore.get(cacheKey);

    // Merge with existing questions and deduplicate
    const existingQuestions = existing?.questions || [];
    const merged = [...existingQuestions, ...questions];
    const unique = deduplicateByQuestion(merged);

    // Limit cache size to 100 questions per topic
    const limited = unique.slice(0, 100);

    cacheStore.set(cacheKey, {
        questions: limited,
        timestamp: Date.now()
    });

    console.log(`💾 Cached ${limited.length} questions for ${topic} (${difficulty})`);
}

/**
 * Deduplicate questions by question text
 */
function deduplicateByQuestion(questions) {
    const seen = new Map();
    const unique = [];

    for (const question of questions) {
        const normalized = question.question
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!seen.has(normalized)) {
            seen.set(normalized, true);
            unique.push(question);
        }
    }

    return unique;
}

/**
 * Clear cache for specific topic
 */
function clearTopicCache(topic, difficulty = 'medium') {
    const cacheKey = getCacheKey(topic, difficulty);
    cacheStore.delete(cacheKey);
    console.log(`🗑️ Cleared cache for ${topic} (${difficulty})`);
}

/**
 * Clear all cache
 */
function clearAllCache() {
    cacheStore.clear();
    console.log(`🗑️ Cleared all MCQ cache`);
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    const stats = {
        totalTopics: cacheStore.size,
        topics: []
    };

    for (const [key, value] of cacheStore.entries()) {
        if (value.questions) {
            stats.topics.push({
                key,
                questionCount: value.questions.length,
                cachedAt: new Date(value.timestamp).toISOString()
            });
        }
    }

    return stats;
}

module.exports = {
    getFromCache,
    addToCache,
    clearTopicCache,
    clearAllCache,
    getCacheStats,
    getCacheKey
};
