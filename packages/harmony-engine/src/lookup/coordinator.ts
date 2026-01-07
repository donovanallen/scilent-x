import type { BaseProvider } from '../providers/base.provider';
import type { ProviderRegistry } from '../providers/index';
import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
} from '../types/index';
import { ReleaseMerger } from '../harmonizer/merger';
import type { SnapshotCache } from '../cache/snapshot';
import { Logger } from '../utils/logger';

export interface LookupRequest {
  type: 'gtin' | 'isrc' | 'url' | 'search';
  value: string;
  providers?: string[];
  merge?: boolean;
  bypassCache?: boolean;
}

export interface LookupResult<T> {
  data: T | null;
  sources: string[];
  cached: boolean;
  timestamp: Date;
  errors: Array<{ provider: string; error: string }> | undefined;
}

export interface LookupCoordinatorConfig {
  persistRelease?: (release: HarmonizedRelease) => Promise<void>;
  persistTrack?: (track: HarmonizedTrack) => Promise<void>;
}

export class LookupCoordinator {
  private logger = new Logger('lookup-coordinator');
  private releaseMerger: ReleaseMerger;
  private config: LookupCoordinatorConfig;

  constructor(
    private registry: ProviderRegistry,
    private cache: SnapshotCache | null,
    config?: LookupCoordinatorConfig
  ) {
    this.releaseMerger = new ReleaseMerger();
    this.config = config ?? {};
  }

  async lookupRelease(
    request: LookupRequest
  ): Promise<LookupResult<HarmonizedRelease>> {
    const cacheKey = `release:${request.type}:${request.value}`;

    // Check cache
    if (!request.bypassCache && this.cache) {
      const cached = await this.cache.get<HarmonizedRelease>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { key: cacheKey });
        return {
          data: cached,
          sources: [],
          cached: true,
          timestamp: new Date(),
          errors: undefined,
        };
      }
    }

    const providers = this.getTargetProviders(request.providers);
    const errors: Array<{ provider: string; error: string }> = [];

    // Parallel lookup
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          switch (request.type) {
            case 'gtin':
              return await provider.lookupReleaseByGtin(request.value);
            case 'url':
              return await provider.lookupReleaseByUrl(request.value);
            default:
              return null;
          }
        } catch (error) {
          errors.push({
            provider: provider.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return null;
        }
      })
    );

    const releases = results
      .filter(
        (r): r is PromiseFulfilledResult<HarmonizedRelease | null> =>
          r.status === 'fulfilled'
      )
      .map((r) => r.value)
      .filter((r): r is HarmonizedRelease => r !== null);

    if (releases.length === 0) {
      return {
        data: null,
        sources: [],
        cached: false,
        timestamp: new Date(),
        errors: errors.length > 0 ? errors : undefined,
      };
    }

    // Merge if multiple results
    const merged =
      request.merge !== false && releases.length > 1
        ? this.releaseMerger.merge(releases)
        : releases[0]!;

    // Cache and persist
    if (this.cache) {
      await this.cache.set(cacheKey, merged);
    }

    if (this.config.persistRelease) {
      try {
        await this.config.persistRelease(merged);
      } catch (error) {
        this.logger.warn('Failed to persist release', {
          error: error instanceof Error ? error.message : 'Unknown',
        });
      }
    }

    return {
      data: merged,
      sources: merged.sources.map((s) => s.provider),
      cached: false,
      timestamp: new Date(),
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async lookupTrack(
    isrc: string,
    providers?: string[]
  ): Promise<LookupResult<HarmonizedTrack>> {
    const cacheKey = `track:isrc:${isrc}`;

    if (this.cache) {
      const cached = await this.cache.get<HarmonizedTrack>(cacheKey);
      if (cached) {
        return {
          data: cached,
          sources: [],
          cached: true,
          timestamp: new Date(),
          errors: undefined,
        };
      }
    }

    const targetProviders = this.getTargetProviders(providers);
    const errors: Array<{ provider: string; error: string }> = [];

    for (const provider of targetProviders) {
      try {
        const track = await provider.lookupTrackByIsrc(isrc);
        if (track) {
          if (this.cache) {
            await this.cache.set(cacheKey, track);
          }

          if (this.config.persistTrack) {
            try {
              await this.config.persistTrack(track);
            } catch (error) {
              this.logger.warn('Failed to persist track', {
                error: error instanceof Error ? error.message : 'Unknown',
              });
            }
          }

          return {
            data: track,
            sources: [provider.name],
            cached: false,
            timestamp: new Date(),
            errors: undefined,
          };
        }
      } catch (error) {
        this.logger.warn('Provider lookup failed', {
          provider: provider.name,
          isrc,
          error: error instanceof Error ? error.message : 'Unknown',
        });
        errors.push({
          provider: provider.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      data: null,
      sources: [],
      cached: false,
      timestamp: new Date(),
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async searchReleases(
    query: string,
    providers?: string[],
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    const targetProviders = this.getTargetProviders(providers);

    const results = await Promise.allSettled(
      targetProviders.map((p) => p.searchReleases(query, limit))
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<HarmonizedRelease[]> =>
          r.status === 'fulfilled'
      )
      .flatMap((r) => r.value);
  }

  async searchTracks(
    query: string,
    providers?: string[],
    limit = 25
  ): Promise<HarmonizedTrack[]> {
    const targetProviders = this.getTargetProviders(providers);

    const results = await Promise.allSettled(
      targetProviders.map((p) => p.searchTracks(query, limit))
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<HarmonizedTrack[]> =>
          r.status === 'fulfilled'
      )
      .flatMap((r) => r.value);
  }

  async searchArtists(
    query: string,
    providers?: string[],
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    const targetProviders = this.getTargetProviders(providers);

    const results = await Promise.allSettled(
      targetProviders.map((p) => p.searchArtists(query, limit))
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<HarmonizedArtist[]> =>
          r.status === 'fulfilled'
      )
      .flatMap((r) => r.value);
  }

  private getTargetProviders(names?: string[]): BaseProvider[] {
    if (names?.length) {
      return names
        .map((n) => this.registry.get(n))
        .filter((p): p is BaseProvider => p !== undefined);
    }
    return this.registry.getByPriority();
  }
}
