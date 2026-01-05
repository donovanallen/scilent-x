import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
  ProviderSource,
} from '../types/index';
import type {
  ProviderConfig,
  LookupOptions,
  ParsedUrl,
} from '../types/provider.types';
import { Logger } from '../utils/logger';
import { RateLimiter } from '../utils/rate-limiter';
import { withRetry } from '../utils/retry';
import { normalizeString } from '../utils/validation';

export abstract class BaseProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly priority: number;

  protected logger: Logger;
  protected rateLimiter: RateLimiter;
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    // Logger will be initialized in subclass constructor after name is set
    this.logger = null as unknown as Logger;
    this.rateLimiter = null as unknown as RateLimiter;
  }

  protected initializeLogger(): void {
    this.logger = new Logger(`provider:${this.name}`);
    this.rateLimiter = new RateLimiter(
      this.name,
      this.config.rateLimit.requests,
      this.config.rateLimit.windowMs
    );
  }

  // URL handling
  abstract canHandleUrl(url: string): boolean;
  abstract parseUrl(url: string): ParsedUrl | null;

  // Core lookups (implement in subclasses)
  protected abstract _lookupReleaseByGtin(
    gtin: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null>;
  protected abstract _lookupReleaseByUrl(
    url: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null>;
  protected abstract _lookupReleaseById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null>;
  protected abstract _lookupTrackByIsrc(
    isrc: string,
    options?: LookupOptions
  ): Promise<HarmonizedTrack | null>;
  protected abstract _lookupArtistById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedArtist | null>;
  protected abstract _searchReleases(
    query: string,
    limit?: number
  ): Promise<HarmonizedRelease[]>;
  protected abstract _searchArtists(
    query: string,
    limit?: number
  ): Promise<HarmonizedArtist[]>;
  protected abstract _searchTracks(
    query: string,
    limit?: number
  ): Promise<HarmonizedTrack[]>;

  // Public methods with rate limiting + retry
  async lookupReleaseByGtin(
    gtin: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupReleaseByGtin(gtin, options)
    );
  }

  async lookupReleaseByUrl(
    url: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupReleaseByUrl(url, options)
    );
  }

  async lookupReleaseById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupReleaseById(id, options)
    );
  }

  async lookupTrackByIsrc(
    isrc: string,
    options?: LookupOptions
  ): Promise<HarmonizedTrack | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupTrackByIsrc(isrc, options)
    );
  }

  async lookupArtistById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedArtist | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupArtistById(id, options)
    );
  }

  async searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    return this.withRateLimitAndRetry(() => this._searchReleases(query, limit));
  }

  async searchArtists(query: string, limit = 25): Promise<HarmonizedArtist[]> {
    return this.withRateLimitAndRetry(() => this._searchArtists(query, limit));
  }

  async searchTracks(query: string, limit = 25): Promise<HarmonizedTrack[]> {
    return this.withRateLimitAndRetry(() => this._searchTracks(query, limit));
  }

  // Helper for wrapping calls
  protected async withRateLimitAndRetry<T>(fn: () => Promise<T>): Promise<T> {
    await this.rateLimiter.acquire();
    return withRetry(fn, this.config.retry, this.logger);
  }

  // Source helper
  protected createSource(id: string, url?: string): ProviderSource {
    return {
      provider: this.name,
      id,
      url,
      fetchedAt: new Date(),
    };
  }

  // Normalization helper
  protected normalizeString(str: string): string {
    return normalizeString(str);
  }
}

export type { ProviderConfig, LookupOptions } from '../types/provider.types';
