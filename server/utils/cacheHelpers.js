const { getRedisClient } = require('../config/redis');

/**
 * Clears all cache keys for a specific user that start with the given prefix
 * @param {string} userId - The user's ID
 * @param {string} prefix - The route prefix to clear (e.g., '/api/progress')
 */
const clearUserCache = async (userId, prefix = '/api') => {
    try {
        const redis = getRedisClient();

        // If Redis is disabled (e.g. CI/test), skip cache invalidation entirely
        if (!redis) {
            return;
        }

        const pattern = `cache:${userId}:${prefix}*`;
        
        // Find all matching keys
        const keys = await redis.keys(pattern);
        
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`Cleared ${keys.length} cache keys for user ${userId} matching ${prefix}`);
        }
    } catch (error) {
        console.error('Cache Invalidation Error:', error);
        throw error;
    }
};

module.exports = { clearUserCache };
