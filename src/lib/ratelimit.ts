import { redis } from "./redis";

export interface RatelimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class SlidingWindowRatelimit {
  private limitCount: number;
  private windowSeconds: number;
  private prefix: string;

  constructor(limitCount: number, windowStr: string, prefix: string) {
    this.limitCount = limitCount;
    this.prefix = prefix;
    
    const [val, unit] = windowStr.split(" ");
    let multiplier = 1;
    if (unit === "h") multiplier = 3600;
    else if (unit === "m") multiplier = 60;
    else if (unit === "s") multiplier = 1;
    
    this.windowSeconds = parseInt(val) * multiplier;
  }

  async limit(identifier: string): Promise<RatelimitResponse> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - (this.windowSeconds * 1000);
    const clearBefore = windowStart;

    const multi = redis.multi();
    // Remove old requests that fall outside the current window
    multi.zremrangebyscore(key, 0, clearBefore);
    // Add current request
    multi.zadd(key, now, `${now}-${Math.random()}`);
    // Count current valid requests
    multi.zcard(key);
    // Set expiry to clean up memory automatically if inactive
    multi.expire(key, this.windowSeconds);

    const results = await multi.exec();
    
    let count = 0;
    // ZCARD is the 3rd operation (index 2)
    if (results && results[2] && results[2][1] !== null) {
      count = results[2][1] as number;
    }

    const success = count <= this.limitCount;
    
    return {
      success,
      limit: this.limitCount,
      remaining: Math.max(0, this.limitCount - count),
      reset: now + (this.windowSeconds * 1000),
    };
  }
}

/**
 * Utilitário de Rate Limit usando ioredis.
 * Estado persiste via ZSET no Redis.
 */
export const ratelimit = {
  bugReports: new SlidingWindowRatelimit(5, "1 h", "ratelimit:bug-reports"),
  languageTool: new SlidingWindowRatelimit(60, "1 m", "ratelimit:languagetool"),
  ai: new SlidingWindowRatelimit(10, "10 m", "ratelimit:ai"),
  pdfExport: new SlidingWindowRatelimit(10, "1 m", "ratelimit:pdf"),
};
