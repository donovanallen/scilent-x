import { describe, it, expect } from 'vitest';
import {
  HarmonizedReleaseSchema,
  HarmonizedTrackSchema,
  HarmonizedArtistSchema,
  HarmonizedPlaylistSchema,
  HarmonizedListenHistoryItemSchema,
  ProviderSourceSchema,
} from '../types/harmonized.types';

describe('Zod schemas', () => {
  describe('ProviderSourceSchema', () => {
    it('validates valid provider source', () => {
      const source = {
        provider: 'musicbrainz',
        id: 'abc-123',
        url: 'https://musicbrainz.org/release/abc-123',
        fetchedAt: new Date(),
      };

      const result = ProviderSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });

    it('allows optional url and snapshotId', () => {
      const source = {
        provider: 'test',
        id: '123',
        fetchedAt: new Date(),
      };

      const result = ProviderSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });

    it('coerces date strings', () => {
      const source = {
        provider: 'test',
        id: '123',
        fetchedAt: '2024-01-01T00:00:00Z',
      };

      const result = ProviderSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fetchedAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('HarmonizedTrackSchema', () => {
    it('validates valid track', () => {
      const track = {
        title: 'Test Track',
        position: 1,
        artists: [{ name: 'Artist' }],
        externalIds: { musicbrainz: 'track-id' },
        sources: [
          { provider: 'musicbrainz', id: 'track-id', fetchedAt: new Date() },
        ],
      };

      const result = HarmonizedTrackSchema.safeParse(track);
      expect(result.success).toBe(true);
    });

    it('rejects invalid position', () => {
      const track = {
        title: 'Test Track',
        position: 0, // Must be positive
        artists: [],
        externalIds: {},
        sources: [],
      };

      const result = HarmonizedTrackSchema.safeParse(track);
      expect(result.success).toBe(false);
    });
  });

  describe('HarmonizedReleaseSchema', () => {
    it('validates valid release', () => {
      const release = {
        title: 'Test Album',
        artists: [{ name: 'Artist' }],
        releaseType: 'album',
        media: [
          {
            position: 1,
            tracks: [
              {
                title: 'Track 1',
                position: 1,
                artists: [{ name: 'Artist' }],
                externalIds: {},
                sources: [],
              },
            ],
          },
        ],
        externalIds: { musicbrainz: 'release-id' },
        sources: [
          { provider: 'musicbrainz', id: 'release-id', fetchedAt: new Date() },
        ],
        mergedAt: new Date(),
        confidence: 0.95,
      };

      const result = HarmonizedReleaseSchema.safeParse(release);
      expect(result.success).toBe(true);
    });

    it('validates all release types', () => {
      const releaseTypes = [
        'album',
        'single',
        'ep',
        'compilation',
        'soundtrack',
        'live',
        'remix',
        'other',
      ];

      for (const type of releaseTypes) {
        const release = {
          title: 'Test',
          artists: [],
          releaseType: type,
          media: [],
          externalIds: {},
          sources: [],
          mergedAt: new Date(),
          confidence: 1,
        };

        const result = HarmonizedReleaseSchema.safeParse(release);
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid confidence', () => {
      const release = {
        title: 'Test',
        artists: [],
        releaseType: 'album',
        media: [],
        externalIds: {},
        sources: [],
        mergedAt: new Date(),
        confidence: 1.5, // Must be 0-1
      };

      const result = HarmonizedReleaseSchema.safeParse(release);
      expect(result.success).toBe(false);
    });
  });

  describe('HarmonizedArtistSchema', () => {
    it('validates valid artist', () => {
      const artist = {
        name: 'Test Artist',
        type: 'person',
        country: 'US',
        aliases: ['Alias 1'],
        genres: ['rock'],
        externalIds: { musicbrainz: 'artist-id' },
        sources: [
          { provider: 'musicbrainz', id: 'artist-id', fetchedAt: new Date() },
        ],
        mergedAt: new Date(),
        confidence: 1.0,
      };

      const result = HarmonizedArtistSchema.safeParse(artist);
      expect(result.success).toBe(true);
    });

    it('validates all artist types', () => {
      const artistTypes = [
        'person',
        'group',
        'orchestra',
        'choir',
        'character',
        'other',
      ];

      for (const type of artistTypes) {
        const artist = {
          name: 'Test',
          type,
          externalIds: {},
          sources: [],
          mergedAt: new Date(),
          confidence: 1,
        };

        const result = HarmonizedArtistSchema.safeParse(artist);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('HarmonizedPlaylistSchema', () => {
    it('validates a valid playlist', () => {
      const playlist = {
        name: 'Chill Vibes',
        isPublic: true,
        trackCount: 42,
        externalIds: { apple_music: 'p.abc123' },
        sources: [
          { provider: 'apple_music', id: 'p.abc123', fetchedAt: new Date() },
        ],
        mergedAt: new Date(),
        confidence: 0.8,
      };

      const result = HarmonizedPlaylistSchema.safeParse(playlist);
      expect(result.success).toBe(true);
    });

    it('allows optional description, ownerName, and artwork', () => {
      const playlist = {
        name: 'Chill Vibes',
        description: 'Relaxing tracks',
        ownerName: 'Alex',
        isPublic: false,
        artwork: [
          {
            url: 'https://example.com/art.jpg',
            type: 'front',
            provider: 'apple_music',
          },
        ],
        externalIds: {},
        sources: [],
        mergedAt: new Date(),
        confidence: 0.5,
      };

      const result = HarmonizedPlaylistSchema.safeParse(playlist);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid trackCount', () => {
      const playlist = {
        name: 'Chill Vibes',
        trackCount: -1,
        externalIds: {},
        sources: [],
        mergedAt: new Date(),
        confidence: 0.5,
      };

      const result = HarmonizedPlaylistSchema.safeParse(playlist);
      expect(result.success).toBe(false);
    });
  });

  describe('HarmonizedListenHistoryItemSchema', () => {
    it('validates an item without a playedAt timestamp (e.g. Apple Music)', () => {
      const item = {
        track: {
          title: 'Test Track',
          position: 1,
          artists: [{ name: 'Artist' }],
          externalIds: { apple_music: 'track-id' },
          sources: [],
        },
        provider: 'apple_music',
      };

      const result = HarmonizedListenHistoryItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('coerces a playedAt timestamp when present', () => {
      const item = {
        track: {
          title: 'Test Track',
          position: 1,
          artists: [{ name: 'Artist' }],
          externalIds: {},
          sources: [],
        },
        playedAt: '2024-01-01T00:00:00Z',
        provider: 'spotify',
      };

      const result = HarmonizedListenHistoryItemSchema.safeParse(item);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.playedAt).toBeInstanceOf(Date);
      }
    });
  });
});
