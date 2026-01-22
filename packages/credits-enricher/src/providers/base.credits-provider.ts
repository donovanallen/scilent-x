import {
  Logger,
  RateLimiter,
  withRetry,
  DEFAULT_RETRY_CONFIG,
  type RetryConfig,
} from '@scilent-one/harmony-engine';
import type {
  EnrichedTrackCredits,
  CreditsProviderConfig,
  EnrichmentOptions,
} from '../types/index';

/**
 * Abstract base class for credits providers.
 * Similar to harmony-engine's BaseProvider but specifically for credits lookups.
 */
export abstract class BaseCreditsProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;

  protected logger: Logger;
  protected rateLimiter: RateLimiter;
  protected config: CreditsProviderConfig;
  protected retryConfig: RetryConfig;

  constructor(config: CreditsProviderConfig) {
    this.config = config;
    this.retryConfig = config.retry ?? {
      ...DEFAULT_RETRY_CONFIG,
      // More conservative retries for credits API (due to rate limits)
      retries: 2,
    };
    // Logger will be initialized in subclass constructor after name is set
    this.logger = null as unknown as Logger;
    this.rateLimiter = null as unknown as RateLimiter;
  }

  protected initializeLogger(): void {
    this.logger = new Logger(`credits:${this.name}`);
    this.rateLimiter = new RateLimiter(
      `credits:${this.name}`,
      this.config.rateLimit.requests,
      this.config.rateLimit.windowMs
    );
  }

  /**
   * Look up credits by ISRC (primary method)
   */
  abstract lookupByIsrc(
    isrc: string,
    options?: EnrichmentOptions
  ): Promise<EnrichedTrackCredits | null>;

  /**
   * Look up credits by title and artist (fallback method)
   */
  abstract lookupByTitleArtist(
    title: string,
    artistName: string,
    options?: EnrichmentOptions
  ): Promise<EnrichedTrackCredits | null>;

  /**
   * Get available credit roles from the provider
   */
  abstract getRoles(): Promise<string[]>;

  /**
   * Check if the provider is properly configured and ready
   */
  abstract isConfigured(): boolean;

  /**
   * Wrap an operation with rate limiting and retry logic
   */
  protected async withRateLimitAndRetry<T>(fn: () => Promise<T>): Promise<T> {
    await this.rateLimiter.acquire();
    return withRetry(fn, this.retryConfig, this.logger);
  }

  /**
   * Create a source object for tracking where credits came from
   */
  protected createSource(id?: string) {
    return {
      provider: this.name,
      id,
      fetchedAt: new Date(),
    };
  }
}

export type { CreditsProviderConfig, EnrichmentOptions };
