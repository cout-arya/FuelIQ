const { getRedisClient } = require('../config/redis');

/**
 * Middleware to cache HTTP responses
 * @param {number} duration - Cache duration in seconds (default 3600s / 1h)
 */
const cacheRoute = (duration = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        try {
            const redis = getRedisClient();
            
            // Generate a unique key based on userId and the endpoint
            // E.g., cache:60d5ecb54b2c1234567890ab:/api/progress/summary
            const key = `cache:${req.user._id}:${req.originalUrl}`;

            const cachedData = await redis.get(key);

            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }

            // If not in cache, intercept the res.json to save the response
            const originalJson = res.json;
            res.json = function (body) {
                // Save to Redis asynchronously
                redis.setEx(key, duration, JSON.stringify(body)).catch(err => {
                    console.error('Redis Set Error:', err);
                });
                
                // Call original res.json
                return originalJson.call(this, body);
            };

            next();
        } catch (error) {
            console.error('Cache Middleware Error:', error);
            // If Redis fails, gracefully fall back to executing the route normally
            next();
        }
    };
};

module.exports = { cacheRoute };
