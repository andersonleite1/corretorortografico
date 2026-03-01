import { Redis } from "@upstash/redis";

/**
 * Cliente Redis para Upstash.
 * Estas variáveis devem ser configuradas no seu .env.local posteriormente.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});
