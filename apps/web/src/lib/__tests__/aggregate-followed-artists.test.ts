import type { HarmonizedArtist } from '@scilent-one/harmony-engine';
import { describe, expect, it } from 'vitest';

import {
  aggregateFollowedArtists,
  mergeFollowedArtistPages,
  normalizeArtistKey,
} from '../aggregate-followed-artists';

function createArtist(
  overrides: Partial<HarmonizedArtist> & { name: string }
): HarmonizedArtist {
  const { name, ...rest } = overrides;
  return {
    name,
    externalIds: {},
    sources: [
      {
        provider: 'test',
        id: name,
        fetchedAt: new Date(),
      },
    ],
    confidence: 1.0,
    mergedAt: new Date(),
    ...rest,
  };
}

describe('normalizeArtistKey', () => {
  it('uses nameNormalized when present', () => {
    const artist = createArtist({
      name: 'The Beatles',
      nameNormalized: 'beatles',
    });
    expect(normalizeArtistKey(artist)).toBe('beatles');
  });

  it('falls back to lowercased name', () => {
    const artist = createArtist({ name: '  Daft  Punk  ' });
    expect(normalizeArtistKey(artist)).toBe('daft punk');
  });
});

describe('aggregateFollowedArtists', () => {
  it('returns empty array for empty input', () => {
    expect(aggregateFollowedArtists([])).toEqual([]);
  });

  it('returns single artist unchanged', () => {
    const artist = createArtist({
      name: 'Radiohead',
      externalIds: { spotify: 'sp-1' },
      sources: [{ provider: 'spotify', id: 'sp-1', fetchedAt: new Date() }],
    });
    const result = aggregateFollowedArtists([artist]);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Radiohead');
  });

  it('merges artists with the same normalized name across providers', () => {
    const spotifyArtist = createArtist({
      name: 'Björk',
      nameNormalized: 'bjork',
      externalIds: { spotify: 'sp-bjork' },
      sources: [{ provider: 'spotify', id: 'sp-bjork', fetchedAt: new Date() }],
    });
    const tidalArtist = createArtist({
      name: 'Bjork',
      nameNormalized: 'bjork',
      externalIds: { tidal: 'td-bjork' },
      sources: [{ provider: 'tidal', id: 'td-bjork', fetchedAt: new Date() }],
    });

    const result = aggregateFollowedArtists([spotifyArtist, tidalArtist]);

    expect(result).toHaveLength(1);
    expect(result[0]?.externalIds).toEqual({
      spotify: 'sp-bjork',
      tidal: 'td-bjork',
    });
    expect(result[0]?.sources).toHaveLength(2);
  });

  it('keeps distinct artists with different names', () => {
    const a = createArtist({ name: 'Artist A', nameNormalized: 'artist a' });
    const b = createArtist({ name: 'Artist B', nameNormalized: 'artist b' });

    const result = aggregateFollowedArtists([a, b]);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['Artist A', 'Artist B']);
  });

  it('sorts results alphabetically by name', () => {
    const z = createArtist({ name: 'Zebra', nameNormalized: 'zebra' });
    const a = createArtist({ name: 'Alpha', nameNormalized: 'alpha' });

    const result = aggregateFollowedArtists([z, a]);

    expect(result.map((r) => r.name)).toEqual(['Alpha', 'Zebra']);
  });
});

describe('mergeFollowedArtistPages', () => {
  it('merges incoming page into existing list', () => {
    const existing = [
      createArtist({
        name: 'Björk',
        nameNormalized: 'bjork',
        externalIds: { spotify: 'sp-bjork' },
        sources: [
          { provider: 'spotify', id: 'sp-bjork', fetchedAt: new Date() },
        ],
      }),
    ];
    const incoming = [
      createArtist({
        name: 'Bjork',
        nameNormalized: 'bjork',
        externalIds: { tidal: 'td-bjork' },
        sources: [{ provider: 'tidal', id: 'td-bjork', fetchedAt: new Date() }],
      }),
      createArtist({
        name: 'New Artist',
        nameNormalized: 'new artist',
        externalIds: { spotify: 'sp-new' },
        sources: [{ provider: 'spotify', id: 'sp-new', fetchedAt: new Date() }],
      }),
    ];

    const result = mergeFollowedArtistPages(existing, incoming);

    expect(result).toHaveLength(2);
    const bjork = result.find((a) => a.name === 'Björk');
    expect(bjork?.externalIds).toEqual({
      spotify: 'sp-bjork',
      tidal: 'td-bjork',
    });
  });
});
