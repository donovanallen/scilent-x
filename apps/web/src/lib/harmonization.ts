// apps/web/src/lib/harmonization.ts
import { db } from '@scilent-one/db';
import {
  HarmonizationEngine,
  TidalProvider,
  SpotifyProvider,
  AppleMusicProvider,
  type HarmonizedArtist,
  type HarmonizedPlaylist,
  type HarmonizedListenHistoryItem,
  type ProviderRegistryConfig,
  type PaginatedCollection,
  type CollectionParams,
  type PlaylistCollectionParams,
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
 *
 * **Note on concurrency:** This performs a simple null assignment which means
 * any in-flight requests that already have a reference to the old engine will
 * continue using it until they complete. New requests will get a fresh engine
 * with updated settings. This "eventual consistency" behavior is acceptable for
 * admin configuration changes which are infrequent and don't require immediate
 * atomic switchover.
 *
 * If stricter consistency is needed in the future (e.g., for high-frequency
 * automated changes), consider implementing a versioned engine with graceful
 * transition or request-scoped engine instances.
 */
export function resetEngine(): void {
  engine = null;
}

/**
 * Fetch provider settings from the database and return as a Map.
 * Used internally when building the engine to ensure DB settings are always respected.
 */
async function fetchProviderSettingsFromDb(): Promise<
  Map<string, ProviderDbSetting>
> {
  try {
    const settings = await db.providerSetting.findMany();
    const map = new Map<string, ProviderDbSetting>();

    for (const setting of settings) {
      map.set(setting.providerName, {
        enabled: setting.enabled,
        priority: setting.priority,
      });
    }

    return map;
  } catch (error) {
    // If DB is not available, return empty map (use defaults)
    console.warn('Failed to fetch provider settings from DB:', error);
    return new Map();
  }
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

  // Apple Music provider - requires a MusicKit developer token, minted from an
  // Apple Developer Team ID, a MusicKit Key ID, and the matching .p8 private key.
  const appleMusicTeamId = process.env.APPLE_MUSIC_TEAM_ID;
  const appleMusicKeyId = process.env.APPLE_MUSIC_KEY_ID;
  const appleMusicPrivateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;

  if (
    appleMusicTeamId &&
    appleMusicKeyId &&
    appleMusicPrivateKey &&
    isProviderEnabled('apple_music')
  ) {
    providers.apple_music = {
      enabled: true,
      priority: getProviderPriority('apple_music', 70),
      rateLimit: { requests: 10, windowMs: 1000 },
      cache: { ttlSeconds: 3600 },
      retry: {
        retries: 3,
        minTimeout: 500,
        maxTimeout: 5000,
        factor: 2,
      },
      teamId: appleMusicTeamId,
      keyId: appleMusicKeyId,
      privateKey: appleMusicPrivateKey,
      storefront: process.env.APPLE_MUSIC_STOREFRONT || 'us',
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

  // Apple Music - check for the MusicKit developer-token credentials
  if (
    process.env.APPLE_MUSIC_TEAM_ID &&
    process.env.APPLE_MUSIC_KEY_ID &&
    process.env.APPLE_MUSIC_PRIVATE_KEY
  ) {
    providers.add('apple_music');
  }

  return providers;
}

/**
 * Get or create the harmonization engine singleton.
 *
 * This function automatically fetches provider settings from the database
 * when creating a new engine instance, ensuring all parts of the application
 * consistently use the database configuration.
 *
 * The engine is cached as a singleton - subsequent calls return the same
 * instance until `resetEngine()` is called.
 */
export async function getHarmonizationEngine(): Promise<HarmonizationEngine> {
  if (!engine) {
    const dbSettings = await fetchProviderSettingsFromDb();
    engine = new HarmonizationEngine({
      providers: buildProviderConfig(dbSettings),
      redis: null,
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

  const engine = await getHarmonizationEngine();
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

  // Apple Music search uses the catalog (developer token); the user's Music
  // User Token is not required, so we search the catalog directly.
  if (normalizedProvider === 'apple_music') {
    const provider = engine.getProvider('apple_music');
    if (provider) {
      try {
        return await engine.searchArtists(query, ['apple_music'], limit);
      } catch (error) {
        console.warn('Apple Music artist search failed, falling back:', error);
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
  const engine = await getHarmonizationEngine();
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

  // Apple Music has no "followed artists"; this returns the user's library
  // artists via their Music User Token (passed as accessToken).
  if (normalizedProvider === 'apple_music') {
    const provider = engine.getProvider('apple_music');
    if (provider instanceof AppleMusicProvider) {
      return provider.getFollowedArtists(accessToken, params);
    }
  }

  throw new Error(`Provider '${providerId}' does not support followed artists`);
}

/**
 * Get a user's playlists from their connected provider's library.
 * Currently supports Apple Music (library playlists), with more providers to
 * be added.
 *
 * @param accessToken - The user's OAuth access token (or Music User Token) for the provider
 * @param providerId - The provider identifier (e.g., 'apple_music')
 * @param params - Pagination parameters (limit, cursor), plus `publicOnly` to
 *   filter to publicly shared playlists
 * @returns Paginated list of harmonized playlists
 */
export async function getPlaylistsFromProvider(
  accessToken: string,
  providerId: string,
  params?: PlaylistCollectionParams
): Promise<PaginatedCollection<HarmonizedPlaylist>> {
  const engine = await getHarmonizationEngine();
  const normalizedProvider = providerId.toLowerCase();

  if (normalizedProvider === 'apple_music') {
    const provider = engine.getProvider('apple_music');
    if (provider instanceof AppleMusicProvider) {
      return provider.getPlaylists(accessToken, params);
    }
  }

  throw new Error(`Provider '${providerId}' does not support playlists`);
}

/**
 * Get a user's recent listen history from their connected provider.
 * Currently supports Apple Music (recently played tracks), with more
 * providers to be added.
 *
 * @param accessToken - The user's OAuth access token (or Music User Token) for the provider
 * @param providerId - The provider identifier (e.g., 'apple_music')
 * @param params - Pagination parameters (limit, cursor)
 * @returns Paginated list of recently played tracks, most recent first
 */
export async function getRecentlyPlayedFromProvider(
  accessToken: string,
  providerId: string,
  params?: CollectionParams
): Promise<PaginatedCollection<HarmonizedListenHistoryItem>> {
  const engine = await getHarmonizationEngine();
  const normalizedProvider = providerId.toLowerCase();

  if (normalizedProvider === 'apple_music') {
    const provider = engine.getProvider('apple_music');
    if (provider instanceof AppleMusicProvider) {
      return provider.getRecentlyPlayed(accessToken, params);
    }
  }

  throw new Error(
    `Provider '${providerId}' does not support recent listen history`
  );
}
