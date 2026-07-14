import type { Redis } from 'ioredis';
import { Logger } from '@scilent-one/harmony-engine';
import type { EnrichedTrackCredits } from '../types/index';

export interface CreditsCacheConfig {
  /** TTL for cached credits in seconds (default: 7 days) */
  defaultTtlSeconds?: number;
  /** Key prefix for cache entries */
  keyPrefix?: string;
}

/**
 * Cache for credits data.
 * Uses Redis if available, otherwise operates as a pass-through.
 *
 * Credits are cached with a longer TTL than regular metadata since
 * song credits rarely change.
 */
export class CreditsCache {
  private logger = new Logger('credits-cache');
  private keyPrefix: string;
  private defaultTtlSeconds: number;

  constructor(
    private redis: Redis | null,
    config?: CreditsCacheConfig
  ) {
    this.keyPrefix = config?.keyPrefix ?? 'credits:';
    // Default to 7 days since credits rarely change
    this.defaultTtlSeconds = config?.defaultTtlSeconds ?? 604800;
  }

  /**
   * Get credits from cache by ISRC
   */
  async getByIsrc(isrc: string): Promise<EnrichedTrackCredits | null> {
    return this.get(`isrc:${isrc.toUpperCase()}`);
  }

  /**
   * Set credits in cache by ISRC
   */
  async setByIsrc(
    isrc: string,
    credits: EnrichedTrackCredits,
    ttlSeconds?: number
  ): Promise<boolean> {
    return this.set(`isrc:${isrc.toUpperCase()}`, credits, ttlSeconds);
  }

  /**
   * Get credits from cache by provider ID
   */
  async getByProviderId(
    provider: string,
    id: string
  ): Promise<EnrichedTrackCredits | null> {
    return this.get(`${provider}:${id}`);
  }

  /**
   * Set credits in cache by provider ID
   */
  async setByProviderId(
    provider: string,
    id: string,
    credits: EnrichedTrackCredits,
    ttlSeconds?: number
  ): Promise<boolean> {
    return this.set(`${provider}:${id}`, credits, ttlSeconds);
  }

  /**
   * Generic get from cache
   */
  async get<T = EnrichedTrackCredits>(key: string): Promise<T | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const data = await this.redis.get(this.prefixKey(key));
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.warn('Cache get failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return null;
    }
  }

  /**
   * Generic set in cache
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      const ttl = ttlSeconds ?? this.defaultTtlSeconds;
      await this.redis.setex(this.prefixKey(key), ttl, serialized);
      return true;
    } catch (error) {
      this.logger.warn('Cache set failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return false;
    }
  }

  /**
   * Delete a cache entry
   */
  async delete(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      await this.redis.del(this.prefixKey(key));
      return true;
    } catch (error) {
      this.logger.warn('Cache delete failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return false;
    }
  }

  /**
   * Check if a cache entry exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      this.logger.warn('Cache exists check failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return false;
    }
  }

  /**
   * Get remaining TTL for a cache entry
   */
  async getTtl(key: string): Promise<number> {
    if (!this.redis) {
      return -2; // Key doesn't exist (no redis)
    }

    try {
      return await this.redis.ttl(this.prefixKey(key));
    } catch (error) {
      this.logger.warn('Cache TTL check failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return -2;
    }
  }

  /**
   * Check if redis is available
   */
  isAvailable(): boolean {
    return this.redis !== null;
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }
}
