import { describe, it, expect } from 'vitest';
import { getSpotifyIconUrl } from '../SpotifyIcon';
import { getAppleMusicIconUrl } from '../AppleMusicIcon';
import { getTidalIconUrl } from '../TidalIcon';

describe('getSpotifyIconUrl', () => {
  it('returns icon PNG path by default', () => {
    expect(getSpotifyIconUrl()).toBe('/spotify/icon-brand.png');
  });

  it('returns wordmark PNG path', () => {
    expect(getSpotifyIconUrl('wordmark', 'white')).toBe(
      '/spotify/wordmark-white.png'
    );
  });

  it('returns null for unsupported wordmark-vertical variant', () => {
    expect(getSpotifyIconUrl('wordmark-vertical', 'black')).toBeNull();
  });
});

describe('getAppleMusicIconUrl', () => {
  it('returns icon SVG path by default', () => {
    expect(getAppleMusicIconUrl()).toBe('/apple/icon-brand.svg');
  });

  it('returns null for non-icon variants', () => {
    expect(getAppleMusicIconUrl('wordmark', 'black')).toBeNull();
    expect(getAppleMusicIconUrl('wordmark-vertical', 'white')).toBeNull();
  });
});

describe('getTidalIconUrl', () => {
  it('returns icon PNG path by default', () => {
    expect(getTidalIconUrl()).toBe('/tidal/icon-black.png');
  });

  it('returns wordmark paths', () => {
    expect(getTidalIconUrl('wordmark', 'white')).toBe(
      '/tidal/wordmark-white.png'
    );
  });

  it('returns vertical wordmark paths', () => {
    expect(getTidalIconUrl('wordmark-vertical', 'black')).toBe(
      '/tidal/wordmark-vertical-black.png'
    );
  });

  it('falls back to black for unsupported color values', () => {
    expect(getTidalIconUrl('icon', 'auto')).toBe('/tidal/icon-black.png');
  });
});
