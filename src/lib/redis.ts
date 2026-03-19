import Redis from "ioredis";

/**
 * Cliente Redis para a VPS.
 * Configure REDIS_URL no seu .env.local (ex: redis://:senha@host:6379)
 */
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});
