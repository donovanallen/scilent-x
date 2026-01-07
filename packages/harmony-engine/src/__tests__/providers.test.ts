import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpotifyProvider, type SpotifyConfig } from '../providers/spotify.provider';
import { TidalProvider, type TidalConfig } from '../providers/tidal.provider';
import { ProviderRegistry, type ProviderRegistryConfig } from '../providers/index';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SpotifyProvider', () => {
  let provider: SpotifyProvider;
  const config: SpotifyConfig = {
    enabled: true,
    priority: 80,
    rateLimit: { requests: 10, windowMs: 1000 },
    cache: { ttlSeconds: 3600 },
    retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  };

  beforeEach(() => {
    provider = new SpotifyProvider(config);
    mockFetch.mockReset();
  });

  describe('canHandleUrl', () => {
    it('handles open.spotify.com URLs', () => {
      expect(provider.canHandleUrl('https://open.spotify.com/album/123')).toBe(true);
      expect(provider.canHandleUrl('https://open.spotify.com/track/456')).toBe(true);
      expect(provider.canHandleUrl('https://open.spotify.com/artist/789')).toBe(true);
    });

    it('handles spotify URIs', () => {
      expect(provider.canHandleUrl('spotify:album:123')).toBe(true);
      expect(provider.canHandleUrl('spotify:track:456')).toBe(true);
      expect(provider.canHandleUrl('spotify:artist:789')).toBe(true);
    });

    it('rejects non-spotify URLs', () => {
      expect(provider.canHandleUrl('https://musicbrainz.org/release/123')).toBe(false);
      expect(provider.canHandleUrl('https://tidal.com/browse/album/123')).toBe(false);
    });
  });

  describe('parseUrl', () => {
    it('parses album URLs', () => {
      expect(provider.parseUrl('https://open.spotify.com/album/6JKNl79hMBsYyzGy0yUGLG')).toEqual({
        type: 'release',
        id: '6JKNl79hMBsYyzGy0yUGLG',
      });
    });

    it('parses track URLs', () => {
      expect(provider.parseUrl('https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh')).toEqual({
        type: 'track',
        id: '4iV5W9uYEdYUVa79Axb7Rh',
      });
    });

    it('parses artist URLs', () => {
      expect(provider.parseUrl('https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF')).toEqual({
        type: 'artist',
        id: '0OdUWJ0sBjDrqHygGUXeCF',
      });
    });

    it('parses spotify URIs', () => {
      expect(provider.parseUrl('spotify:album:6JKNl79hMBsYyzGy0yUGLG')).toEqual({
        type: 'release',
        id: '6JKNl79hMBsYyzGy0yUGLG',
      });

      expect(provider.parseUrl('spotify:track:4iV5W9uYEdYUVa79Axb7Rh')).toEqual({
        type: 'track',
        id: '4iV5W9uYEdYUVa79Axb7Rh',
      });
    });

    it('returns null for invalid URLs', () => {
      expect(provider.parseUrl('https://example.com')).toBeNull();
      expect(provider.parseUrl('invalid')).toBeNull();
    });
  });

  describe('provider properties', () => {
    it('has correct name', () => {
      expect(provider.name).toBe('spotify');
    });

    it('has correct displayName', () => {
      expect(provider.displayName).toBe('Spotify');
    });

    it('has correct priority', () => {
      expect(provider.priority).toBe(80);
    });
  });
});

describe('TidalProvider', () => {
  let provider: TidalProvider;
  const config: TidalConfig = {
    enabled: true,
    priority: 75,
    rateLimit: { requests: 10, windowMs: 1000 },
    cache: { ttlSeconds: 3600 },
    retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    countryCode: 'US',
  };

  beforeEach(() => {
    provider = new TidalProvider(config);
    mockFetch.mockReset();
  });

  describe('canHandleUrl', () => {
    it('handles tidal.com URLs', () => {
      expect(provider.canHandleUrl('https://tidal.com/browse/album/123456')).toBe(true);
      expect(provider.canHandleUrl('https://tidal.com/browse/track/789012')).toBe(true);
      expect(provider.canHandleUrl('https://tidal.com/browse/artist/345678')).toBe(true);
    });

    it('handles listen.tidal.com URLs', () => {
      expect(provider.canHandleUrl('https://listen.tidal.com/album/123456')).toBe(true);
    });

    it('rejects non-tidal URLs', () => {
      expect(provider.canHandleUrl('https://musicbrainz.org/release/123')).toBe(false);
      expect(provider.canHandleUrl('https://open.spotify.com/album/123')).toBe(false);
    });
  });

  describe('parseUrl', () => {
    it('parses album URLs', () => {
      expect(provider.parseUrl('https://tidal.com/browse/album/123456789')).toEqual({
        type: 'release',
        id: '123456789',
      });
    });

    it('parses track URLs', () => {
      expect(provider.parseUrl('https://tidal.com/browse/track/987654321')).toEqual({
        type: 'track',
        id: '987654321',
      });
    });

    it('parses artist URLs', () => {
      expect(provider.parseUrl('https://tidal.com/browse/artist/456789012')).toEqual({
        type: 'artist',
        id: '456789012',
      });
    });

    it('parses listen.tidal.com URLs', () => {
      expect(provider.parseUrl('https://listen.tidal.com/album/123456789')).toEqual({
        type: 'release',
        id: '123456789',
      });
    });

    it('returns null for invalid URLs', () => {
      expect(provider.parseUrl('https://example.com')).toBeNull();
      expect(provider.parseUrl('invalid')).toBeNull();
    });
  });

  describe('provider properties', () => {
    it('has correct name', () => {
      expect(provider.name).toBe('tidal');
    });

    it('has correct displayName', () => {
      expect(provider.displayName).toBe('Tidal');
    });

    it('has correct priority', () => {
      expect(provider.priority).toBe(75);
    });
  });
});

describe('ProviderRegistry', () => {
  describe('with all providers enabled', () => {
    const registryConfig: ProviderRegistryConfig = {
      providers: {
        musicbrainz: {
          enabled: true,
          priority: 100,
          rateLimit: { requests: 1, windowMs: 1000 },
          cache: { ttlSeconds: 86400 },
          retry: { retries: 3, minTimeout: 1000, maxTimeout: 10000, factor: 2 },
          appName: 'TestApp',
          appVersion: '1.0.0',
          contact: 'test@example.com',
        },
        spotify: {
          enabled: true,
          priority: 80,
          rateLimit: { requests: 10, windowMs: 1000 },
          cache: { ttlSeconds: 3600 },
          retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
        },
        tidal: {
          enabled: true,
          priority: 75,
          rateLimit: { requests: 10, windowMs: 1000 },
          cache: { ttlSeconds: 3600 },
          retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          countryCode: 'US',
        },
      },
      defaultProviders: ['musicbrainz', 'spotify'],
    };

    it('initializes all enabled providers', () => {
      const registry = new ProviderRegistry(registryConfig);
      expect(registry.get('musicbrainz')).toBeDefined();
      expect(registry.get('spotify')).toBeDefined();
      expect(registry.get('tidal')).toBeDefined();
    });

    it('returns providers sorted by priority', () => {
      const registry = new ProviderRegistry(registryConfig);
      const providers = registry.getByPriority();
      
      expect(providers.length).toBe(3);
      expect(providers[0]?.name).toBe('musicbrainz'); // priority 100
      expect(providers[1]?.name).toBe('spotify');     // priority 80
      expect(providers[2]?.name).toBe('tidal');       // priority 75
    });

    it('finds provider by URL', () => {
      const registry = new ProviderRegistry(registryConfig);
      
      const spotifyProvider = registry.findByUrl('https://open.spotify.com/album/123');
      expect(spotifyProvider?.name).toBe('spotify');

      const tidalProvider = registry.findByUrl('https://tidal.com/browse/album/123');
      expect(tidalProvider?.name).toBe('tidal');

      const mbProvider = registry.findByUrl('https://musicbrainz.org/release/abc-123');
      expect(mbProvider?.name).toBe('musicbrainz');
    });

    it('returns default providers', () => {
      const registry = new ProviderRegistry(registryConfig);
      const defaults = registry.getDefaults();
      
      expect(defaults.length).toBe(2);
      expect(defaults.map(p => p.name)).toEqual(['musicbrainz', 'spotify']);
    });
  });

  describe('with partial providers enabled', () => {
    it('only initializes enabled providers', () => {
      const config: ProviderRegistryConfig = {
        providers: {
          spotify: {
            enabled: true,
            priority: 80,
            rateLimit: { requests: 10, windowMs: 1000 },
            cache: { ttlSeconds: 3600 },
            retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
          },
          tidal: {
            enabled: false, // disabled
            priority: 75,
            rateLimit: { requests: 10, windowMs: 1000 },
            cache: { ttlSeconds: 3600 },
            retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
          },
        },
      };

      const registry = new ProviderRegistry(config);
      expect(registry.get('spotify')).toBeDefined();
      expect(registry.get('tidal')).toBeUndefined();
      expect(registry.getAll().length).toBe(1);
    });
  });
});
