import type { Redis } from "ioredis";

export interface RateLimiterConfig {
  redis?: Redis;
  useMemory?: boolean;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private redis: Redis | undefined;

  constructor(
    private readonly name: string,
    private readonly maxTokens: number,
    private readonly windowMs: number,
    config?: RateLimiterConfig
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.redis = config?.redis ?? undefined;
  }

  async acquire(): Promise<void> {
    if (this.redis) {
      return this.acquireDistributed();
    }
    return this.acquireLocal();
  }

  private async acquireLocal(): Promise<void> {
    this.refill();

    if (this.tokens <= 0) {
      const waitTime = this.windowMs - (Date.now() - this.lastRefill);
      await this.sleep(waitTime);
      this.tokens = this.maxTokens;
      this.lastRefill = Date.now();
    }

    this.tokens--;
  }

  private async acquireDistributed(): Promise<void> {
    const key = `ratelimit:${this.name}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Use Redis sorted set for sliding window
    const multi = this.redis!.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zcard(key);
    multi.zadd(key, now.toString(), `${now}-${Math.random()}`);
    multi.expire(key, Math.ceil(this.windowMs / 1000));

    const results = await multi.exec();
    const count = (results?.[1]?.[1] as number | undefined) ?? 0;

    if (count >= this.maxTokens) {
      // Get oldest entry to calculate wait time
      const oldest = await this.redis!.zrange(key, 0, 0, "WITHSCORES");
      if (oldest.length >= 2) {
        const oldestTime = parseInt(oldest[1]!, 10);
        const waitTime = oldestTime + this.windowMs - now;
        if (waitTime > 0) {
          await this.sleep(waitTime);
        }
      }
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const refillCount = Math.floor(elapsed / this.windowMs) * this.maxTokens;

    if (refillCount > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + refillCount);
      this.lastRefill = now;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
  }

  // For monitoring
  getStatus(): { tokens: number; maxTokens: number; windowMs: number } {
    this.refill();
    return {
      tokens: this.tokens,
      maxTokens: this.maxTokens,
      windowMs: this.windowMs,
    };
  }
}
