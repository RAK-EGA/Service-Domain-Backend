const Redis = require('ioredis');

// Replace these values with your ElastiCache Redis endpoint and port
const redis = new Redis({
  host: 'complaintcache-wrwwng.serverless.mes1.cache.amazonaws.com',
  port: 6379,
});

// Handle connection events
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});