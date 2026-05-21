const redis = require('redis');
require('dotenv').config({ path: '.env.docker' });

let client;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URI || 'redis://localhost:6379';
    client = redis.createClient({ url: redisUrl });
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    process.exit(1);
  }
};

const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return client;
};

module.exports = { connectRedis, getRedisClient };
