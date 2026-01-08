import type { Redis } from 'ioredis';
import type { HarmonizedTrack, HarmonizedRelease } from '@scilent-one/harmony-engine';
import { Logger } from '@scilent-one/harmony-engine';
import {
  CreditsProviderRegistry,
  type CreditsProviderRegistryConfig,
} from './providers/index';
import { CreditsCache, type CreditsCacheConfig } from './cache/credits-cache';
import type {
  EnrichedTrackCredits,
  EnrichmentOptions,
  EnrichmentResult,
} from './types/index';
import { prepareIsrc } from './utils/matching';

/**
 * Configuration for the CreditsEnricher
 */
export interface CreditsEnricherConfig {
  /**
   * Provider configurations
   *
   * Example:
   * ```typescript
   * providers: {
   *   muso: {
   *     apiKey: process.env.MUSO_API_KEY!, // <-- Set your API key here
   *     rateLimit: { requests: 10, windowMs: 1000 },
   *   },
   * },
   * ```
   */
  providers: CreditsProviderRegistryConfig['providers'];

  /** Default provider to use (defaults to 'muso') */
  defaultProvider?: 'muso';

  /** Redis instance for caching (optional but recommended) */
  redis?: Redis | null;

  /** Cache configuration */
  cache?: CreditsCacheConfig;
}

/**
 * A track enriched with detailed credits information
 */
export type EnrichedTrack = HarmonizedTrack & {
  enrichedCredits?: EnrichedTrackCredits;
};

/**
 * A release with all tracks enriched with credits
 */
export type EnrichedRelease = Omit<HarmonizedRelease, 'media'> & {
  media: Array<{
    format?: string | undefined;
    position: number;
    tracks: EnrichedTrack[];
  }>;
};

/**
 * Credits Enricher - Augments harmonized music metadata with detailed credits.
 *
 * The enricher fetches credits from providers like Muso.ai and merges them
 * with existing harmonized track data. It uses ISRC as the primary lookup key.
 *
 * ## Setup
 *
 * ```typescript
 * import { CreditsEnricher } from '@scilent-one/credits-enricher';
 *
 * const enricher = new CreditsEnricher({
 *   providers: {
 *     muso: {
 *       apiKey: process.env.MUSO_API_KEY!, // <-- Your Muso.ai API key
 *       rateLimit: { requests: 10, windowMs: 1000 },
 *     },
 *   },
 *   redis, // Optional: for caching (highly recommended due to rate limits)
 * });
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * // Enrich a single track
 * const enrichedTrack = await enricher.enrichTrack(harmonizedTrack);
 *
 * // Enrich all tracks in a release
 * const enrichedRelease = await enricher.enrichRelease(harmonizedRelease);
 *
 * // Batch enrich multiple tracks
 * const enrichedTracks = await enricher.enrichTracks(tracks);
 * ```
 */
export class CreditsEnricher {
  private logger = new Logger('credits-enricher');
  private registry: CreditsProviderRegistry;
  private cache: CreditsCache;

  constructor(config: CreditsEnricherConfig) {
    this.registry = new CreditsProviderRegistry({
      providers: config.providers,
      defaultProvider: config.defaultProvider,
    });
    this.cache = new CreditsCache(config.redis ?? null, config.cache);

    if (!this.registry.hasProviders()) {
      this.logger.warn(
        'No credits providers configured. Make sure to set MUSO_API_KEY or provide apiKey in config.'
      );
    }
  }

  /**
   * Enrich a single track with credits information.
   * Uses ISRC as the primary lookup key.
   */
  async enrichTrack(
    track: HarmonizedTrack,
    options?: EnrichmentOptions
  ): Promise<EnrichedTrack> {
    const result = await this.lookupCredits(track, options);

    if (result.success && result.data) {
      return {
        ...track,
        enrichedCredits: result.data,
        // Also update the basic credits array for compatibility
        credits: result.data.credits.map((c) => ({
          name: c.name,
          role: c.role,
        })),
      };
    }

    return track;
  }

  /**
   * Enrich multiple tracks with credits information.
   * Processes tracks sequentially to respect rate limits.
   */
  async enrichTracks(
    tracks: HarmonizedTrack[],
    options?: EnrichmentOptions
  ): Promise<EnrichedTrack[]> {
    const results: EnrichedTrack[] = [];

    for (const track of tracks) {
      const enriched = await this.enrichTrack(track, options);
      results.push(enriched);
    }

    return results;
  }

  /**
   * Enrich all tracks in a release with credits information.
   */
  async enrichRelease(
    release: HarmonizedRelease,
    options?: EnrichmentOptions
  ): Promise<EnrichedRelease> {
    const enrichedMedia = await Promise.all(
      release.media.map(async (medium) => ({
        ...medium,
        tracks: await this.enrichTracks(medium.tracks, options),
      }))
    );

    return {
      ...release,
      media: enrichedMedia,
    };
  }

  /**
   * Look up credits for a track without modifying it.
   */
  async lookupCredits(
    track: HarmonizedTrack,
    options?: EnrichmentOptions
  ): Promise<EnrichmentResult<EnrichedTrackCredits>> {
    const provider = this.registry.getDefault();

    if (!provider) {
      return {
        success: false,
        error: 'No credits provider configured',
      };
    }

    // Try ISRC lookup first (primary method)
    if (track.isrc) {
      const normalizedIsrc = prepareIsrc(track.isrc);
      if (normalizedIsrc) {
        // Check cache first
        if (!options?.bypassCache) {
          const cached = await this.cache.getByIsrc(normalizedIsrc);
          if (cached) {
            this.logger.debug('Credits cache hit', { isrc: normalizedIsrc });
            return {
              success: true,
              data: cached,
              cached: true,
              provider: provider.name,
            };
          }
        }

        // Fetch from provider
        try {
          const credits = await provider.lookupByIsrc(normalizedIsrc, options);

          if (credits) {
            // Cache the result
            await this.cache.setByIsrc(normalizedIsrc, credits);

            return {
              success: true,
              data: credits,
              cached: false,
              provider: provider.name,
            };
          }
        } catch (error) {
          this.logger.error(
            'Credits lookup failed',
            error instanceof Error ? error : undefined,
            { isrc: normalizedIsrc }
          );
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: provider.name,
          };
        }
      }
    }

    // Fallback to title/artist lookup
    if (options?.fallbackToTitleMatch) {
      const artistName = track.artists?.[0]?.name;
      if (artistName) {
        try {
          const credits = await provider.lookupByTitleArtist(
            track.title,
            artistName,
            options
          );

          if (credits) {
            return {
              success: true,
              data: credits,
              cached: false,
              provider: provider.name,
            };
          }
        } catch (error) {
          this.logger.error(
            'Credits title/artist lookup failed',
            error instanceof Error ? error : undefined,
            { title: track.title, artist: artistName }
          );
        }
      }
    }

    return {
      success: false,
      error: 'No credits found',
      provider: provider.name,
    };
  }

  /**
   * Look up credits by ISRC directly.
   */
  async lookupByIsrc(
    isrc: string,
    options?: EnrichmentOptions
  ): Promise<EnrichmentResult<EnrichedTrackCredits>> {
    const provider = this.registry.getDefault();

    if (!provider) {
      return {
        success: false,
        error: 'No credits provider configured',
      };
    }

    const normalizedIsrc = prepareIsrc(isrc);
    if (!normalizedIsrc) {
      return {
        success: false,
        error: 'Invalid ISRC format',
      };
    }

    // Check cache first
    if (!options?.bypassCache) {
      const cached = await this.cache.getByIsrc(normalizedIsrc);
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true,
          provider: provider.name,
        };
      }
    }

    try {
      const credits = await provider.lookupByIsrc(normalizedIsrc, options);

      if (credits) {
        await this.cache.setByIsrc(normalizedIsrc, credits);
        return {
          success: true,
          data: credits,
          cached: false,
          provider: provider.name,
        };
      }

      return {
        success: false,
        error: 'No credits found for ISRC',
        provider: provider.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: provider.name,
      };
    }
  }

  /**
   * Get available credit roles from the provider.
   */
  async getRoles(): Promise<string[]> {
    const provider = this.registry.getDefault();
    if (!provider) {
      return [];
    }
    return provider.getRoles();
  }

  /**
   * Check if the enricher has any configured providers.
   */
  isConfigured(): boolean {
    return this.registry.hasProviders();
  }

  /**
   * Get the cache instance for advanced operations.
   */
  getCache(): CreditsCache {
    return this.cache;
  }

  /**
   * Get the provider registry for advanced operations.
   */
  getRegistry(): CreditsProviderRegistry {
    return this.registry;
  }
}
