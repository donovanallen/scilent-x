import { describe, it, expect } from 'vitest';
import {
  PROVIDER_BRAND_COLORS,
  PROVIDER_LABELS,
  SIZE_PRESETS,
  resolveFillColor,
  resolveSize,
} from '../types';

describe('SIZE_PRESETS', () => {
  it('defines the expected pixel values', () => {
    expect(SIZE_PRESETS.xs).toBe(16);
    expect(SIZE_PRESETS.sm).toBe(20);
    expect(SIZE_PRESETS.md).toBe(24);
    expect(SIZE_PRESETS.lg).toBe(32);
    expect(SIZE_PRESETS.xl).toBe(48);
  });
});

describe('PROVIDER_LABELS', () => {
  it('maps providers to display labels', () => {
    expect(PROVIDER_LABELS.spotify).toBe('Spotify');
    expect(PROVIDER_LABELS.apple_music).toBe('Apple Music');
    expect(PROVIDER_LABELS.tidal).toBe('Tidal');
  });
});

describe('PROVIDER_BRAND_COLORS', () => {
  it('maps providers to brand colors', () => {
    expect(PROVIDER_BRAND_COLORS.spotify).toBe('#1DB954');
    expect(PROVIDER_BRAND_COLORS.apple_music).toBe('#FA233B');
    expect(PROVIDER_BRAND_COLORS.tidal).toBe('#000000');
  });
});

describe('resolveSize', () => {
  it('returns the default medium size when undefined', () => {
    expect(resolveSize(undefined)).toBe(SIZE_PRESETS.md);
  });

  it('returns numeric values untouched', () => {
    expect(resolveSize(40)).toBe(40);
  });

  it('resolves size presets by name', () => {
    expect(resolveSize('lg')).toBe(SIZE_PRESETS.lg);
  });
});

describe('resolveFillColor', () => {
  it('returns the provider brand color for brand and default', () => {
    expect(resolveFillColor('brand', 'spotify')).toBe(PROVIDER_BRAND_COLORS.spotify);
    expect(resolveFillColor(undefined, 'apple_music')).toBe(
      PROVIDER_BRAND_COLORS.apple_music
    );
  });

  it('returns fixed colors for black, white, and current', () => {
    expect(resolveFillColor('black', 'tidal')).toBe('#000000');
    expect(resolveFillColor('white', 'spotify')).toBe('#FFFFFF');
    expect(resolveFillColor('current', 'spotify')).toBe('currentColor');
  });
});
