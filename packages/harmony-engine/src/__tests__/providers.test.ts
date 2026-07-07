import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import {
  SpotifyProvider,
  type SpotifyConfig,
} from '../providers/spotify.provider';
import { TidalProvider, type TidalConfig } from '../providers/tidal.provider';
import {
  AppleMusicProvider,
  type AppleMusicConfig,
} from '../providers/apple-music.provider';
import {
  ProviderRegistry,
  type ProviderRegistryConfig,
} from '../providers/index';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// A throwaway P-256 private key so the Apple Music provider can mint (and we can
// exercise) real ES256 developer-token JWTs during tests.
const { privateKey: appleTestPrivateKey } = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

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
      expect(provider.canHandleUrl('https://open.spotify.com/album/123')).toBe(
        true
      );
      expect(provider.canHandleUrl('https://open.spotify.com/track/456')).toBe(
        true
      );
      expect(provider.canHandleUrl('https://open.spotify.com/artist/789')).toBe(
        true
      );
    });

    it('handles spotify URIs', () => {
      expect(provider.canHandleUrl('spotify:album:123')).toBe(true);
      expect(provider.canHandleUrl('spotify:track:456')).toBe(true);
      expect(provider.canHandleUrl('spotify:artist:789')).toBe(true);
    });

    it('rejects non-spotify URLs', () => {
      expect(provider.canHandleUrl('https://musicbrainz.org/release/123')).toBe(
        false
      );
      expect(provider.canHandleUrl('https://tidal.com/browse/album/123')).toBe(
        false
      );
    });
  });

  describe('parseUrl', () => {
    it('parses album URLs', () => {
      expect(
        provider.parseUrl(
          'https://open.spotify.com/album/6JKNl79hMBsYyzGy0yUGLG'
        )
      ).toEqual({
        type: 'release',
        id: '6JKNl79hMBsYyzGy0yUGLG',
      });
    });

    it('parses track URLs', () => {
      expect(
        provider.parseUrl(
          'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh'
        )
      ).toEqual({
        type: 'track',
        id: '4iV5W9uYEdYUVa79Axb7Rh',
      });
    });

    it('parses artist URLs', () => {
      expect(
        provider.parseUrl(
          'https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF'
        )
      ).toEqual({
        type: 'artist',
        id: '0OdUWJ0sBjDrqHygGUXeCF',
      });
    });

    it('parses spotify URIs', () => {
      expect(provider.parseUrl('spotify:album:6JKNl79hMBsYyzGy0yUGLG')).toEqual(
        {
          type: 'release',
          id: '6JKNl79hMBsYyzGy0yUGLG',
        }
      );

      expect(provider.parseUrl('spotify:track:4iV5W9uYEdYUVa79Axb7Rh')).toEqual(
        {
          type: 'track',
          id: '4iV5W9uYEdYUVa79Axb7Rh',
        }
      );
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

  describe('lookupTrackByUrl (base default)', () => {
    it('returns null for providers that do not implement track-by-id lookup', async () => {
      // Spotify does not override _lookupTrackById, so the base no-op applies.
      const track = await provider.lookupTrackByUrl(
        'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh'
      );
      expect(track).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
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
      expect(
        provider.canHandleUrl('https://tidal.com/browse/album/123456')
      ).toBe(true);
      expect(
        provider.canHandleUrl('https://tidal.com/browse/track/789012')
      ).toBe(true);
      expect(
        provider.canHandleUrl('https://tidal.com/browse/artist/345678')
      ).toBe(true);
    });

    it('handles listen.tidal.com URLs', () => {
      expect(
        provider.canHandleUrl('https://listen.tidal.com/album/123456')
      ).toBe(true);
    });

    it('rejects non-tidal URLs', () => {
      expect(provider.canHandleUrl('https://musicbrainz.org/release/123')).toBe(
        false
      );
      expect(provider.canHandleUrl('https://open.spotify.com/album/123')).toBe(
        false
      );
    });
  });

  describe('parseUrl', () => {
    it('parses album URLs', () => {
      expect(
        provider.parseUrl('https://tidal.com/browse/album/123456789')
      ).toEqual({
        type: 'release',
        id: '123456789',
      });
    });

    it('parses track URLs', () => {
      expect(
        provider.parseUrl('https://tidal.com/browse/track/987654321')
      ).toEqual({
        type: 'track',
        id: '987654321',
      });
    });

    it('parses artist URLs', () => {
      expect(
        provider.parseUrl('https://tidal.com/browse/artist/456789012')
      ).toEqual({
        type: 'artist',
        id: '456789012',
      });
    });

    it('parses listen.tidal.com URLs', () => {
      expect(
        provider.parseUrl('https://listen.tidal.com/album/123456789')
      ).toEqual({
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

describe('AppleMusicProvider', () => {
  let provider: AppleMusicProvider;
  const config: AppleMusicConfig = {
    enabled: true,
    priority: 70,
    rateLimit: { requests: 10, windowMs: 1000 },
    cache: { ttlSeconds: 3600 },
    retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
    teamId: 'ABCDE12345',
    keyId: 'KEY1234567',
    privateKey: appleTestPrivateKey as string,
    storefront: 'us',
  };

  beforeEach(() => {
    provider = new AppleMusicProvider(config);
    mockFetch.mockReset();
  });

  describe('canHandleUrl', () => {
    it('handles music.apple.com URLs', () => {
      expect(
        provider.canHandleUrl('https://music.apple.com/us/album/x/1234567890')
      ).toBe(true);
      expect(
        provider.canHandleUrl('https://music.apple.com/gb/artist/x/159260351')
      ).toBe(true);
    });

    it('handles legacy itunes.apple.com URLs', () => {
      expect(
        provider.canHandleUrl(
          'https://itunes.apple.com/us/album/x/id1234567890'
        )
      ).toBe(true);
    });

    it('rejects non-apple URLs', () => {
      expect(provider.canHandleUrl('https://open.spotify.com/album/123')).toBe(
        false
      );
      expect(provider.canHandleUrl('https://tidal.com/browse/album/123')).toBe(
        false
      );
    });
  });

  describe('parseUrl', () => {
    it('parses album URLs', () => {
      expect(
        provider.parseUrl(
          'https://music.apple.com/us/album/some-album/1440783617'
        )
      ).toEqual({ type: 'release', id: '1440783617' });
    });

    it('parses a song URL expressed via the ?i= param as a track', () => {
      expect(
        provider.parseUrl(
          'https://music.apple.com/us/album/some-album/1440783617?i=1440783625'
        )
      ).toEqual({ type: 'track', id: '1440783625' });
    });

    it('parses artist URLs', () => {
      expect(
        provider.parseUrl(
          'https://music.apple.com/us/artist/taylor-swift/159260351'
        )
      ).toEqual({ type: 'artist', id: '159260351' });
    });

    it('parses legacy artist id URLs', () => {
      expect(
        provider.parseUrl('https://itunes.apple.com/us/artist/id159260351')
      ).toEqual({ type: 'artist', id: '159260351' });
    });

    it('returns null for invalid URLs', () => {
      expect(provider.parseUrl('https://example.com')).toBeNull();
      expect(provider.parseUrl('invalid')).toBeNull();
    });
  });

  describe('provider properties', () => {
    it('has correct name', () => {
      expect(provider.name).toBe('apple_music');
    });

    it('has correct displayName', () => {
      expect(provider.displayName).toBe('Apple Music');
    });

    it('has correct priority', () => {
      expect(provider.priority).toBe(70);
    });
  });

  describe('developer token authentication', () => {
    it('sends a signed ES256 developer token as a Bearer header', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      await provider.lookupTrackByIsrc('USUM71703861');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain(
        '/v1/catalog/us/songs?filter%5Bisrc%5D=USUM71703861'
      );

      const authHeader = (init.headers as Record<string, string>)[
        'Authorization'
      ];
      expect(authHeader).toBeDefined();
      expect(authHeader).toMatch(/^Bearer /);
      const token = authHeader!.replace('Bearer ', '');
      // JWT: header.payload.signature
      const segments = token.split('.');
      expect(segments).toHaveLength(3);

      const header = JSON.parse(
        Buffer.from(segments[0]!, 'base64url').toString('utf8')
      );
      const payload = JSON.parse(
        Buffer.from(segments[1]!, 'base64url').toString('utf8')
      );
      expect(header).toMatchObject({ alg: 'ES256', kid: 'KEY1234567' });
      expect(payload).toMatchObject({ iss: 'ABCDE12345' });
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('reuses the cached developer token across requests', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ data: [] }));

      await provider.lookupTrackByIsrc('USUM71703861');
      await provider.lookupTrackByIsrc('USUM71703862');

      const firstAuth = (mockFetch.mock.calls[0]![1] as RequestInit)
        .headers as Record<string, string>;
      const secondAuth = (mockFetch.mock.calls[1]![1] as RequestInit)
        .headers as Record<string, string>;
      expect(firstAuth['Authorization']).toBe(secondAuth['Authorization']);
    });
  });

  describe('lookupTrackByIsrc', () => {
    it('transforms an Apple Music song into a harmonized track', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: '1440783625',
              type: 'songs',
              attributes: {
                name: 'Delicate',
                artistName: 'Taylor Swift',
                isrc: 'USUM71703861',
                durationInMillis: 232253,
                trackNumber: 5,
                discNumber: 1,
                contentRating: 'clean',
                url: 'https://music.apple.com/us/album/delicate/1440783617?i=1440783625',
              },
            },
          ],
        })
      );

      const track = await provider.lookupTrackByIsrc('USUM71703861');
      expect(track).not.toBeNull();
      expect(track?.title).toBe('Delicate');
      expect(track?.isrc).toBe('USUM71703861');
      expect(track?.duration).toBe(232253);
      expect(track?.position).toBe(5);
      expect(track?.explicit).toBe(false);
      expect(track?.externalIds).toEqual({ apple_music: '1440783625' });
      expect(track?.artists).toEqual([{ name: 'Taylor Swift' }]);
    });

    it('returns null when no song matches the ISRC', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));
      expect(await provider.lookupTrackByIsrc('UNKNOWN0000')).toBeNull();
    });
  });

  describe('lookupReleaseByGtin', () => {
    it('looks up an album by UPC then fetches full details by id', async () => {
      // First call: filter[upc] search returns a stub album with an id.
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: [{ id: '1440783617', type: 'albums' }] })
      );
      // Second call: /albums/{id} returns full album with tracks + artists.
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: '1440783617',
              type: 'albums',
              attributes: {
                name: 'reputation',
                artistName: 'Taylor Swift',
                upc: '00602557890329',
                releaseDate: '2017-11-10',
                recordLabel: 'Big Machine Records',
                genreNames: ['Pop'],
                artwork: {
                  url: 'https://example.com/{w}x{h}bb.jpg',
                  width: 3000,
                  height: 3000,
                },
              },
              relationships: {
                artists: {
                  data: [
                    {
                      id: '159260351',
                      type: 'artists',
                      attributes: { name: 'Taylor Swift' },
                    },
                  ],
                },
                tracks: {
                  data: [
                    {
                      id: '1440783625',
                      type: 'songs',
                      attributes: {
                        name: 'Delicate',
                        artistName: 'Taylor Swift',
                        isrc: 'USUM71703861',
                        trackNumber: 5,
                        discNumber: 1,
                      },
                    },
                  ],
                },
              },
            },
          ],
        })
      );

      const release = await provider.lookupReleaseByGtin('00602557890329');
      expect(release).not.toBeNull();
      expect(release?.title).toBe('reputation');
      expect(release?.gtin).toBe('00602557890329');
      expect(release?.releaseType).toBe('album');
      expect(release?.labels).toEqual([{ name: 'Big Machine Records' }]);
      expect(release?.artwork?.[0]?.url).toBe(
        'https://example.com/3000x3000bb.jpg'
      );
      expect(release?.artists).toEqual([
        { name: 'Taylor Swift', externalIds: { apple_music: '159260351' } },
      ]);
      expect(release?.media[0]?.tracks[0]?.title).toBe('Delicate');
      expect(release?.externalIds).toEqual({ apple_music: '1440783617' });
    });
  });

  describe('searchTracks', () => {
    it('transforms the search results payload', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          results: {
            songs: {
              data: [
                {
                  id: '1',
                  type: 'songs',
                  attributes: {
                    name: 'Song One',
                    artistName: 'Artist',
                    trackNumber: 1,
                  },
                },
              ],
            },
          },
        })
      );

      const tracks = await provider.searchTracks('song one', 10);
      expect(tracks).toHaveLength(1);
      expect(tracks[0]?.title).toBe('Song One');

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain('/v1/catalog/us/search');
      expect(url).toContain('types=songs');
    });
  });

  describe('lookupTrackById', () => {
    it('fetches a song by id from the catalog', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: '1440783625',
              type: 'songs',
              attributes: {
                name: 'Delicate',
                artistName: 'Taylor Swift',
                isrc: 'USUM71703861',
                trackNumber: 5,
                discNumber: 1,
              },
            },
          ],
        })
      );

      const track = await provider.lookupTrackById('1440783625');
      expect(track?.title).toBe('Delicate');
      expect(track?.externalIds).toEqual({ apple_music: '1440783625' });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain('/v1/catalog/us/songs/1440783625');
    });

    it('returns null when the song is not found', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));
      expect(await provider.lookupTrackById('missing')).toBeNull();
    });
  });

  describe('lookupTrackByUrl', () => {
    it('resolves a song URL expressed via the ?i= param', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: '1440783625',
              type: 'songs',
              attributes: {
                name: 'Delicate',
                artistName: 'Taylor Swift',
                trackNumber: 5,
              },
            },
          ],
        })
      );

      const track = await provider.lookupTrackByUrl(
        'https://music.apple.com/us/album/some-album/1440783617?i=1440783625'
      );
      expect(track?.title).toBe('Delicate');

      const [url] = mockFetch.mock.calls[0] as [string];
      // Resolves the song id from the ?i= param, not the album id in the path.
      expect(url).toContain('/v1/catalog/us/songs/1440783625');
    });

    it('resolves a standalone /song/ URL', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: '987',
              type: 'songs',
              attributes: { name: 'Standalone', artistName: 'Artist' },
            },
          ],
        })
      );

      const track = await provider.lookupTrackByUrl(
        'https://music.apple.com/us/song/standalone/987'
      );
      expect(track?.title).toBe('Standalone');
      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain('/v1/catalog/us/songs/987');
    });

    it('returns null for a non-track URL without making a request', async () => {
      const track = await provider.lookupTrackByUrl(
        'https://music.apple.com/us/artist/taylor-swift/159260351'
      );
      expect(track).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('user authentication', () => {
    it('reports that it supports user auth', () => {
      expect(provider.supportsUserAuth).toBe(true);
    });

    it('getCurrentUser returns the storefront as the profile', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: 'us',
              type: 'storefronts',
              attributes: {
                name: 'United States',
                defaultLanguageTag: 'en-US',
              },
            },
          ],
        })
      );

      const profile = await provider.getCurrentUser('music-user-token-123');

      expect(profile.id).toBe('us');
      expect(profile.displayName).toBe('United States');
      expect(profile.country).toBe('US');
      expect(profile.provider).toBe('apple_music');

      // Verify both the developer token and the Music User Token are sent.
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/v1/me/storefront');
      const headers = init.headers as Record<string, string>;
      expect(headers['Authorization']).toMatch(/^Bearer /);
      expect(headers['Music-User-Token']).toBe('music-user-token-123');
    });

    it('getFollowedArtists returns library artists, preferring catalog data', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: 'r.abc',
              type: 'library-artists',
              attributes: { name: 'Library Name' },
              relationships: {
                catalog: {
                  data: [
                    {
                      id: '159260351',
                      type: 'artists',
                      attributes: {
                        name: 'Taylor Swift',
                        url: 'https://music.apple.com/us/artist/taylor-swift/159260351',
                      },
                    },
                  ],
                },
              },
            },
            {
              id: 'r.def',
              type: 'library-artists',
              attributes: { name: 'Local Only Artist' },
            },
          ],
          meta: { total: 42 },
          next: '/v1/me/library/artists?offset=25',
        })
      );

      const result = await provider.getFollowedArtists('music-user-token-123', {
        limit: 25,
      });

      expect(result.items).toHaveLength(2);
      // Prefers the catalog artist (stable catalog id) when present.
      expect(result.items[0]?.name).toBe('Taylor Swift');
      expect(result.items[0]?.externalIds).toEqual({
        apple_music: '159260351',
      });
      // Falls back to the library entry when no catalog link exists.
      expect(result.items[1]?.name).toBe('Local Only Artist');
      expect(result.items[1]?.externalIds).toEqual({ apple_music: 'r.def' });

      expect(result.total).toBe(42);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('25');

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/v1/me/library/artists');
      expect(url).toContain('include=catalog');
      const headers = init.headers as Record<string, string>;
      expect(headers['Music-User-Token']).toBe('music-user-token-123');
    });

    it('getFollowedArtists returns an empty collection when the library is empty', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      const result = await provider.getFollowedArtists('music-user-token-123');
      expect(result.items).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
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
      expect(providers[1]?.name).toBe('spotify'); // priority 80
      expect(providers[2]?.name).toBe('tidal'); // priority 75
    });

    it('finds provider by URL', () => {
      const registry = new ProviderRegistry(registryConfig);

      const spotifyProvider = registry.findByUrl(
        'https://open.spotify.com/album/123'
      );
      expect(spotifyProvider?.name).toBe('spotify');

      const tidalProvider = registry.findByUrl(
        'https://tidal.com/browse/album/123'
      );
      expect(tidalProvider?.name).toBe('tidal');

      const mbProvider = registry.findByUrl(
        'https://musicbrainz.org/release/abc-123'
      );
      expect(mbProvider?.name).toBe('musicbrainz');
    });

    it('returns default providers', () => {
      const registry = new ProviderRegistry(registryConfig);
      const defaults = registry.getDefaults();

      expect(defaults.length).toBe(2);
      expect(defaults.map((p) => p.name)).toEqual(['musicbrainz', 'spotify']);
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

  describe('with Apple Music enabled', () => {
    const registryConfig: ProviderRegistryConfig = {
      providers: {
        apple_music: {
          enabled: true,
          priority: 70,
          rateLimit: { requests: 10, windowMs: 1000 },
          cache: { ttlSeconds: 3600 },
          retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
          teamId: 'ABCDE12345',
          keyId: 'KEY1234567',
          privateKey: appleTestPrivateKey as string,
          storefront: 'us',
        },
      },
    };

    it('initializes the apple_music provider', () => {
      const registry = new ProviderRegistry(registryConfig);
      expect(registry.get('apple_music')).toBeDefined();
    });

    it('finds the provider by an Apple Music URL', () => {
      const registry = new ProviderRegistry(registryConfig);
      const provider = registry.findByUrl(
        'https://music.apple.com/us/album/x/1440783617'
      );
      expect(provider?.name).toBe('apple_music');
    });
  });
});
