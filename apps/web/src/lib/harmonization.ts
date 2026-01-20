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
 * Build provider configuration based on available environment variables.
 * Providers are only enabled if their required credentials are present.
 */
function buildProviderConfig(): ProviderRegistryConfig {
  const providers: ProviderRegistryConfig['providers'] = {
    // MusicBrainz is always enabled (no auth required)
    musicbrainz: {
      enabled: true,
      priority: 100,
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
    },
  };

  // Spotify provider - requires client credentials
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (spotifyClientId && spotifyClientSecret) {
    providers.spotify = {
      enabled: true,
      priority: 80,
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

  if (tidalClientId && tidalClientSecret) {
    providers.tidal = {
      enabled: true,
      priority: 75,
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

export function getHarmonizationEngine() {
  if (!engine) {
    engine = new HarmonizationEngine({
      providers: buildProviderConfig(),
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
