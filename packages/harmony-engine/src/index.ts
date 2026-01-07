import type { Redis } from 'ioredis';
import {
  ProviderRegistry,
  type ProviderRegistryConfig,
} from './providers/index';
import {
  LookupCoordinator,
  type LookupCoordinatorConfig,
} from './lookup/coordinator';
import { SnapshotCache, type SnapshotCacheConfig } from './cache/snapshot';
// import type { HarmonizedRelease, HarmonizedTrack } from './types/index';

// Re-export everything
export {
  ProviderRegistry,
  type ProviderRegistryConfig,
  type ProviderName,
} from './providers/index';
export {
  BaseProvider,
  type ProviderConfig,
  type LookupOptions,
} from './providers/base.provider';
export {
  MusicBrainzProvider,
  type MusicBrainzConfig,
} from './providers/musicbrainz.provider';
export {
  LookupCoordinator,
  type LookupRequest,
  type LookupResult,
  type LookupCoordinatorConfig,
} from './lookup/coordinator';
export { ReleaseMerger, ArtistMerger, TrackMerger } from './harmonizer/merger';
export { SnapshotCache, type SnapshotCacheConfig } from './cache/snapshot';
export { Logger, type LogLevel, type LogContext } from './utils/logger';
export { RateLimiter, type RateLimiterConfig } from './utils/rate-limiter';
export {
  withRetry,
  DEFAULT_RETRY_CONFIG,
  type RetryConfig,
} from './utils/retry';
export {
  isValidGtin,
  isValidIsrc,
  normalizeGtin,
  normalizeIsrc,
  normalizeString,
} from './utils/validation';
export * from './types/index';
export * from './errors/index';

// Main engine configuration
export interface HarmonizationConfig {
  providers: ProviderRegistryConfig;
  redis?: Redis | null;
  cache?: SnapshotCacheConfig;
  persistence?: LookupCoordinatorConfig;
}

/**
 * Main entry point for the harmonization engine.
 * Provides a unified interface for looking up and merging music metadata.
 */
export class HarmonizationEngine {
  public readonly registry: ProviderRegistry;
  public readonly coordinator: LookupCoordinator;
  public readonly cache: SnapshotCache;

  constructor(config: HarmonizationConfig) {
    this.registry = new ProviderRegistry(config.providers);
    this.cache = new SnapshotCache(config.redis ?? null, config.cache);
    this.coordinator = new LookupCoordinator(
      this.registry,
      this.cache,
      config.persistence
    );
  }

  /**
   * Look up a release by GTIN (UPC/EAN barcode)
   */
  async lookupByGtin(
    gtin: string,
    options?: { providers?: string[]; bypassCache?: boolean }
  ) {
    return this.coordinator.lookupRelease({
      type: 'gtin',
      value: gtin,
      ...options,
    });
  }

  /**
   * Look up a track by ISRC
   */
  async lookupByIsrc(isrc: string, providers?: string[]) {
    return this.coordinator.lookupTrack(isrc, providers);
  }

  /**
   * Look up a release by provider URL (e.g., MusicBrainz, Spotify)
   */
  async lookupByUrl(
    url: string,
    options?: { providers?: string[]; bypassCache?: boolean }
  ) {
    return this.coordinator.lookupRelease({
      type: 'url',
      value: url,
      ...options,
    });
  }

  /**
   * Search for releases across enabled providers
   */
  async search(query: string, providers?: string[], limit = 25) {
    return this.coordinator.searchReleases(query, providers, limit);
  }

  /**
   * Search for tracks across enabled providers
   */
  async searchTracks(query: string, providers?: string[], limit = 25) {
    return this.coordinator.searchTracks(query, providers, limit);
  }

  /**
   * Search for artists across enabled providers
   */
  async searchArtists(query: string, providers?: string[], limit = 25) {
    return this.coordinator.searchArtists(query, providers, limit);
  }

  /**
   * Get a specific provider by name
   */
  getProvider(name: string) {
    return this.registry.get(name);
  }

  /**
   * Get all enabled providers
   */
  getEnabledProviders() {
    return this.registry.getEnabled();
  }
}
