// apps/web/src/lib/harmonization.ts
import {
  HarmonizationEngine,
  type ProviderRegistryConfig,
} from '@scilent-one/harmonization-engine';

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
