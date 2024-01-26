const Redis = require('ioredis');

// Replace these values with your ElastiCache Redis endpoint and port
const redis = new Redis({
  host: 'service-catalog-cache.wrwwng.clustercfg.mes1.cache.amazonaws.com',
  port: 6379,
});

// Handle connection events
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

async function getCache(key) {
  const cachedValue = await redis.get(key);
  return cachedValue ? JSON.parse(cachedValue) : null;
}

async function getAllKeys() {
  // Use the KEYS command to get all keys in the Redis cache
  const keys = await redis.keys('*');
  return keys;
}

module.exports = {
  getCache,
  getAllKeys,
  // other exports if needed
};