import { describe, it, expect } from 'vitest';
import {
  SIZE_PRESETS,
  PROVIDER_BRAND_COLORS,
  resolveSize,
  resolveFillColor,
} from '../types';

describe('resolveSize', () => {
  it('returns md preset when size is undefined', () => {
    expect(resolveSize(undefined)).toBe(SIZE_PRESETS.md);
  });

  it('returns numeric size as-is', () => {
    expect(resolveSize(42)).toBe(42);
    expect(resolveSize(0)).toBe(0);
  });

  it('resolves named size presets', () => {
    expect(resolveSize('xs')).toBe(16);
    expect(resolveSize('sm')).toBe(20);
    expect(resolveSize('md')).toBe(24);
    expect(resolveSize('lg')).toBe(32);
    expect(resolveSize('xl')).toBe(48);
  });
});

describe('resolveFillColor', () => {
  it('returns provider brand color for brand', () => {
    expect(resolveFillColor('brand', 'spotify')).toBe(
      PROVIDER_BRAND_COLORS.spotify
    );
    expect(resolveFillColor('brand', 'apple_music')).toBe(
      PROVIDER_BRAND_COLORS.apple_music
    );
    expect(resolveFillColor('brand', 'tidal')).toBe(
      PROVIDER_BRAND_COLORS.tidal
    );
  });

  it('returns fixed colors for black and white', () => {
    expect(resolveFillColor('black', 'spotify')).toBe('#000000');
    expect(resolveFillColor('white', 'tidal')).toBe('#FFFFFF');
  });

  it('returns currentColor for current and auto', () => {
    expect(resolveFillColor('current', 'spotify')).toBe('currentColor');
    expect(resolveFillColor('auto', 'apple_music')).toBe('currentColor');
  });

  it('defaults to provider brand color when color is undefined', () => {
    expect(resolveFillColor(undefined, 'spotify')).toBe(
      PROVIDER_BRAND_COLORS.spotify
    );
  });
});
