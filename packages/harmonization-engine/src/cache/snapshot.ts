import type { Redis } from "ioredis";
import { Logger } from "../utils/logger.js";

export interface SnapshotCacheConfig {
  defaultTtlSeconds?: number;
  keyPrefix?: string;
}

export class SnapshotCache {
  private logger = new Logger("snapshot-cache");
  private keyPrefix: string;
  private defaultTtlSeconds: number;

  constructor(
    private redis: Redis | null,
    config?: SnapshotCacheConfig
  ) {
    this.keyPrefix = config?.keyPrefix ?? "harmonize:";
    this.defaultTtlSeconds = config?.defaultTtlSeconds ?? 86400; // 24 hours
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const data = await this.redis.get(this.prefixKey(key));
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.warn("Cache get failed", {
        key,
        error: error instanceof Error ? error.message : "Unknown",
      });
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      const ttl = ttlSeconds ?? this.defaultTtlSeconds;
      await this.redis.setex(this.prefixKey(key), ttl, serialized);
      return true;
    } catch (error) {
      this.logger.warn("Cache set failed", {
        key,
        error: error instanceof Error ? error.message : "Unknown",
      });
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      await this.redis.del(this.prefixKey(key));
      return true;
    } catch (error) {
      this.logger.warn("Cache delete failed", {
        key,
        error: error instanceof Error ? error.message : "Unknown",
      });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }
}
