import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
  HarmonizedUserProfile,
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
import { UserAuthNotSupportedError } from '../errors/index';

export abstract class BaseProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly priority: number;

  /**
   * Whether this provider supports user-authenticated API calls.
   * Override in subclass to return true if the provider implements getCurrentUser.
   */
  get supportsUserAuth(): boolean {
    return false;
  }

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

  // User-authenticated methods (optional - override in subclasses that support user auth)

  /**
   * Get the current user's profile using their OAuth access token.
   * Override this method in providers that support user authentication.
   * @param accessToken - The user's OAuth access token from the connected account
   * @throws UserAuthNotSupportedError if the provider doesn't support user auth
   */
  protected async _getCurrentUser(
    _accessToken: string
  ): Promise<HarmonizedUserProfile> {
    throw new UserAuthNotSupportedError(this.name);
  }

  /**
   * Get the current user's profile using their OAuth access token.
   * @param accessToken - The user's OAuth access token from the connected account
   * @returns The harmonized user profile with normalized fields and raw provider data
   * @throws UserAuthNotSupportedError if the provider doesn't support user auth
   */
  async getCurrentUser(accessToken: string): Promise<HarmonizedUserProfile> {
    return this.withRateLimitAndRetry(() => this._getCurrentUser(accessToken));
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
