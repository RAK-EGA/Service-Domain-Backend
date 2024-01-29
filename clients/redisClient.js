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
  console.error('Error: Redis connection error:', err);
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

async function setCache(key, value) {
  // Use the SET command to set a key-value pair in the Redis cache
  await redis.set(key, JSON.stringify(value));
}

module.exports = {
  getCache,
  getAllKeys,
  setCache,
  // other exports if needed
};