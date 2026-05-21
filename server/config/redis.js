const redis = require('redis');
require('dotenv').config({ path: '.env.docker' });

let client;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URI;

  if (!redisUrl) {
    console.warn('⚠️  REDIS_URI not set — Redis caching disabled.');
    return;
  }

  try {
    client = redis.createClient({ url: redisUrl });
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
};

const getRedisClient = () => {
  return client || null;
};

module.exports = { connectRedis, getRedisClient };
