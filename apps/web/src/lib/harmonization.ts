// apps/web/src/lib/harmonization.ts
import {
  HarmonizationEngine,
  TidalProvider,
  SpotifyProvider,
  type HarmonizedArtist,
  type ProviderRegistryConfig,
  type PaginatedCollection,
  type CollectionParams,
} from '@scilent-one/harmony-engine';

// Singleton instance
let engine: HarmonizationEngine | null = null;

/**
 * Database settings type for provider configuration overrides.
 */
export interface ProviderDbSetting {
  enabled: boolean;
  priority: number;
}

/**
 * Reset the engine singleton to force rebuild with new settings.
 * Call this after updating provider settings in the database.
 */
export function resetEngine(): void {
  engine = null;
}

/**
 * Build provider configuration based on available environment variables
 * and optional database settings overrides.
 * Providers are only enabled if their required credentials are present
 * AND they are enabled in the database (defaults to enabled if no DB record).
 */
function buildProviderConfig(
  dbSettings?: Map<string, ProviderDbSetting>
): ProviderRegistryConfig {
  // Helper to check if provider is enabled (defaults to true if no DB record)
  const isProviderEnabled = (providerName: string): boolean => {
    const setting = dbSettings?.get(providerName);
    return setting?.enabled ?? true;
  };

  // Helper to get provider priority from DB or use default
  const getProviderPriority = (
    providerName: string,
    defaultPriority: number
  ): number => {
    const setting = dbSettings?.get(providerName);
    return setting?.priority ?? defaultPriority;
  };

  const providers: ProviderRegistryConfig['providers'] = {};

  // MusicBrainz - always has credentials (no auth required), check DB for enabled
  if (isProviderEnabled('musicbrainz')) {
    providers.musicbrainz = {
      enabled: true,
      priority: getProviderPriority('musicbrainz', 100),
      rateLimit: { requests: 1, windowMs: 1000 },
      cache: { ttlSeconds: 86400 },
      retry: {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 10000,
        factor: 2,
      },
      appName: 'ScilentWeb',
      appVersion: '0.1.0',
      contact: process.env.MUSICBRAINZ_CONTACT ?? 'dev@example.com',
    };
  }

  // Spotify provider - requires client credentials
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (spotifyClientId && spotifyClientSecret && isProviderEnabled('spotify')) {
    providers.spotify = {
      enabled: true,
      priority: getProviderPriority('spotify', 80),
      rateLimit: { requests: 10, windowMs: 1000 },
      cache: { ttlSeconds: 3600 },
      retry: {
        retries: 3,
        minTimeout: 500,
        maxTimeout: 5000,
        factor: 2,
      },
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
    };
  }

  // Tidal provider - requires client credentials
  const tidalClientId = process.env.TIDAL_CLIENT_ID;
  const tidalClientSecret = process.env.TIDAL_CLIENT_SECRET;

  if (tidalClientId && tidalClientSecret && isProviderEnabled('tidal')) {
    providers.tidal = {
      enabled: true,
      priority: getProviderPriority('tidal', 75),
      rateLimit: { requests: 10, windowMs: 1000 },
      cache: { ttlSeconds: 3600 },
      retry: {
        retries: 3,
        minTimeout: 500,
        maxTimeout: 5000,
        factor: 2,
      },
      clientId: tidalClientId,
      clientSecret: tidalClientSecret,
      countryCode: process.env.TIDAL_COUNTRY_CODE ?? 'US',
    };
  }

  return { providers };
}

/**
 * Check which providers have credentials configured (env vars present).
 * This is used to determine if a provider can be toggled on/off.
 */
export function getProvidersWithCredentials(): Set<string> {
  const providers = new Set<string>();

  // MusicBrainz always has credentials (no auth required)
  providers.add('musicbrainz');

  // Spotify - check for client credentials
  if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
    providers.add('spotify');
  }

  // Tidal - check for client credentials
  if (process.env.TIDAL_CLIENT_ID && process.env.TIDAL_CLIENT_SECRET) {
    providers.add('tidal');
  }

  return providers;
}

/**
 * Get or create the harmonization engine singleton.
 * Optionally accepts database settings to configure provider enabled/priority.
 */
export function getHarmonizationEngine(
  dbSettings?: Map<string, ProviderDbSetting>
) {
  if (!engine) {
    engine = new HarmonizationEngine({
      providers: buildProviderConfig(dbSettings),
      // redis: null, // Add Redis connection for production caching
    });
  }
  return engine;
}

export async function searchArtistsWithUserProvider(
  query: string,
  accessToken: string | null,
  providerId: string | null,
  limit = 10
): Promise<HarmonizedArtist[]> {
  if (!query.trim()) return [];

  const engine = getHarmonizationEngine();
  const normalizedProvider = providerId?.toLowerCase() ?? null;

  if (normalizedProvider === 'tidal' && accessToken) {
    const provider = engine.getProvider('tidal');
    if (provider instanceof TidalProvider) {
      try {
        return await provider.searchArtistsWithUserToken(
          query,
          accessToken,
          limit
        );
      } catch (error) {
        console.warn('Tidal artist search failed, falling back:', error);
      }
    }
  }

  if (normalizedProvider === 'spotify' && accessToken) {
    const provider = engine.getProvider('spotify');
    if (provider instanceof SpotifyProvider) {
      try {
        return await provider.searchArtistsWithUserToken(
          query,
          accessToken,
          limit
        );
      } catch (error) {
        console.warn('Spotify artist search failed, falling back:', error);
      }
    }
  }

  return engine.searchArtists(query, ['musicbrainz'], limit);
}

/**
 * Get followed/favorite artists from the user's connected provider.
 * Currently supports Tidal, with more providers to be added.
 *
 * @param accessToken - The user's OAuth access token for the provider
 * @param providerId - The provider identifier (e.g., 'tidal', 'spotify')
 * @param params - Pagination parameters (limit, cursor)
 * @returns Paginated list of harmonized artists the user follows
 */
export async function getFollowedArtistsFromProvider(
  accessToken: string,
  providerId: string,
  params?: CollectionParams
): Promise<PaginatedCollection<HarmonizedArtist>> {
  const engine = getHarmonizationEngine();
  const normalizedProvider = providerId.toLowerCase();

  if (normalizedProvider === 'tidal') {
    const provider = engine.getProvider('tidal');
    if (provider instanceof TidalProvider) {
      return provider.getFollowedArtists(accessToken, params);
    }
  }

  if (normalizedProvider === 'spotify') {
    const provider = engine.getProvider('spotify');
    if (provider instanceof SpotifyProvider) {
      return provider.getFollowedArtists(accessToken, params);
    }
  }

  throw new Error(`Provider '${providerId}' does not support followed artists`);
}
