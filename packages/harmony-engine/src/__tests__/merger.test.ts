import { describe, it, expect } from 'vitest';
import { ReleaseMerger, ArtistMerger } from '../harmonizer/merger';
import type { HarmonizedRelease, HarmonizedArtist } from '../types/index';

describe('ReleaseMerger', () => {
  const merger = new ReleaseMerger();

  const createRelease = (
    overrides: Partial<HarmonizedRelease>
  ): HarmonizedRelease => ({
    title: 'Test Album',
    artists: [{ name: 'Test Artist' }],
    releaseType: 'album',
    media: [{ position: 1, tracks: [] }],
    externalIds: {},
    sources: [
      {
        provider: 'test',
        id: '123',
        fetchedAt: new Date(),
      },
    ],
    confidence: 1.0,
    mergedAt: new Date(),
    ...overrides,
  });

  it('returns single release unchanged', () => {
    const release = createRelease({ title: 'Solo Album' });
    const result = merger.merge([release]);
    expect(result.title).toBe('Solo Album');
  });

  it('merges external IDs from multiple sources', () => {
    const release1 = createRelease({
      externalIds: { musicbrainz: 'mb-id' },
      sources: [
        { provider: 'musicbrainz', id: 'mb-id', fetchedAt: new Date() },
      ],
    });
    const release2 = createRelease({
      externalIds: { spotify: 'sp-id' },
      sources: [{ provider: 'spotify', id: 'sp-id', fetchedAt: new Date() }],
    });

    const result = merger.merge([release1, release2]);

    expect(result.externalIds).toEqual({
      musicbrainz: 'mb-id',
      spotify: 'sp-id',
    });
  });

  it('combines sources from all releases', () => {
    const release1 = createRelease({
      sources: [{ provider: 'provider1', id: 'id1', fetchedAt: new Date() }],
    });
    const release2 = createRelease({
      sources: [{ provider: 'provider2', id: 'id2', fetchedAt: new Date() }],
    });

    const result = merger.merge([release1, release2]);

    expect(result.sources).toHaveLength(2);
    expect(result.sources.map((s) => s.provider)).toContain('provider1');
    expect(result.sources.map((s) => s.provider)).toContain('provider2');
  });

  it('deduplicates genres across releases', () => {
    const release1 = createRelease({ genres: ['rock', 'indie'] });
    const release2 = createRelease({ genres: ['Rock', 'alternative'] });

    const result = merger.merge([release1, release2]);

    expect(result.genres).toContain('rock');
    expect(result.genres).toContain('indie');
    expect(result.genres).toContain('alternative');
    expect(result.genres?.filter((g) => g === 'rock')).toHaveLength(1);
  });

  it('prefers higher confidence releases', () => {
    const lowConfidence = createRelease({
      title: 'Low Confidence',
      confidence: 0.5,
    });
    const highConfidence = createRelease({
      title: 'High Confidence',
      confidence: 0.9,
    });

    const result = merger.merge([lowConfidence, highConfidence]);

    expect(result.title).toBe('High Confidence');
  });

  it('preserves artwork from a lower-confidence provider when the primary has none', () => {
    // Mirrors the real bug: MusicBrainz wins on confidence but ships no covers,
    // while Spotify (lower confidence) has the artwork.
    const musicbrainz = createRelease({
      confidence: 1.0,
      externalIds: { musicbrainz: 'mb-id' },
      sources: [
        { provider: 'musicbrainz', id: 'mb-id', fetchedAt: new Date() },
      ],
    });
    const spotify = createRelease({
      confidence: 0.9,
      externalIds: { spotify: 'sp-id' },
      sources: [{ provider: 'spotify', id: 'sp-id', fetchedAt: new Date() }],
      artwork: [
        {
          url: 'https://i.scdn.co/image/front.jpg',
          type: 'front',
          provider: 'spotify',
        },
      ],
    });

    const result = merger.merge([musicbrainz, spotify]);

    expect(result.artwork).toBeDefined();
    expect(result.artwork?.[0]?.url).toBe('https://i.scdn.co/image/front.jpg');
  });

  it('deduplicates artwork across providers', () => {
    const shared = {
      url: 'https://example.com/front.jpg',
      type: 'front' as const,
      provider: 'spotify',
    };
    const release1 = createRelease({ artwork: [shared], confidence: 0.9 });
    const release2 = createRelease({ artwork: [shared], confidence: 0.8 });

    const result = merger.merge([release1, release2]);

    expect(result.artwork).toHaveLength(1);
  });

  it('throws error for empty array', () => {
    expect(() => merger.merge([])).toThrow('Cannot merge empty release array');
  });
});

describe('ArtistMerger', () => {
  const merger = new ArtistMerger();

  const createArtist = (
    overrides: Partial<HarmonizedArtist>
  ): HarmonizedArtist => ({
    name: 'Test Artist',
    externalIds: {},
    sources: [
      {
        provider: 'test',
        id: '123',
        fetchedAt: new Date(),
      },
    ],
    confidence: 1.0,
    mergedAt: new Date(),
    ...overrides,
  });

  it('merges aliases from multiple sources', () => {
    const artist1 = createArtist({ aliases: ['Alias 1', 'Alias 2'] });
    const artist2 = createArtist({ aliases: ['Alias 2', 'Alias 3'] });

    const result = merger.merge([artist1, artist2]);

    expect(result.aliases).toContain('Alias 1');
    expect(result.aliases).toContain('Alias 2');
    expect(result.aliases).toContain('Alias 3');
  });

  it('merges genres from multiple sources', () => {
    const artist1 = createArtist({ genres: ['rock'] });
    const artist2 = createArtist({ genres: ['indie'] });

    const result = merger.merge([artist1, artist2]);

    expect(result.genres).toContain('rock');
    expect(result.genres).toContain('indie');
  });

  it('preserves images from a provider that has them', () => {
    const musicbrainz = createArtist({
      confidence: 1.0,
      sources: [{ provider: 'musicbrainz', id: 'mb', fetchedAt: new Date() }],
    });
    const spotify = createArtist({
      confidence: 0.9,
      sources: [{ provider: 'spotify', id: 'sp', fetchedAt: new Date() }],
      images: [
        {
          url: 'https://i.scdn.co/image/artist.jpg',
          width: 640,
          height: 640,
          provider: 'spotify',
        },
      ],
    });

    const result = merger.merge([musicbrainz, spotify]);

    expect(result.images).toBeDefined();
    expect(result.images?.[0]?.url).toBe('https://i.scdn.co/image/artist.jpg');
  });

  it('throws error for empty array', () => {
    expect(() => merger.merge([])).toThrow('Cannot merge empty artist array');
  });
});
