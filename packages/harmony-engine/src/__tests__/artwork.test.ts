import { describe, expect, it } from 'vitest';

import {
  getArtistImageUrl,
  getCoverArtArchiveUrl,
  getHarmonizedArtworkUrl,
} from '../utils/artwork.js';

describe('artwork utils', () => {
  it('returns front artwork from harmonized array', () => {
    expect(
      getHarmonizedArtworkUrl([
        { url: 'https://example.com/back.jpg', type: 'back' },
        { url: 'https://example.com/front.jpg', type: 'front' },
      ])
    ).toBe('https://example.com/front.jpg');
  });

  it('builds cover art archive URL from release MBID', () => {
    expect(getCoverArtArchiveUrl('mbid-123')).toBe(
      'https://coverartarchive.org/release/mbid-123/front-500'
    );
  });
});

describe('getArtistImageUrl', () => {
  it('returns undefined for empty or missing images', () => {
    expect(getArtistImageUrl(undefined)).toBeUndefined();
    expect(getArtistImageUrl([])).toBeUndefined();
  });

  it('prefers the largest image by pixel area', () => {
    expect(
      getArtistImageUrl([
        { url: 'https://example.com/small.jpg', width: 64, height: 64 },
        { url: 'https://example.com/large.jpg', width: 640, height: 640 },
        { url: 'https://example.com/medium.jpg', width: 320, height: 320 },
      ])
    ).toBe('https://example.com/large.jpg');
  });

  it('falls back to the first entry when dimensions are unknown', () => {
    expect(
      getArtistImageUrl([
        { url: 'https://example.com/first.jpg' },
        { url: 'https://example.com/second.jpg' },
      ])
    ).toBe('https://example.com/first.jpg');
  });
});
