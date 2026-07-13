import { describe, expect, it } from 'vitest';

import {
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
