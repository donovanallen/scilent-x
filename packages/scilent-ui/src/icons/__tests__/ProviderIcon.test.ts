import { describe, it, expect } from 'vitest';
import {
  getSupportedProviders,
  isProviderSupported,
  getProviderIconMetadata,
  PROVIDER_METADATA,
} from '../ProviderIcon';

describe('getSupportedProviders', () => {
  it('returns all supported provider keys', () => {
    expect(getSupportedProviders()).toEqual([
      'spotify',
      'apple_music',
      'tidal',
    ]);
  });
});

describe('isProviderSupported', () => {
  it('returns true for known providers', () => {
    expect(isProviderSupported('spotify')).toBe(true);
    expect(isProviderSupported('apple_music')).toBe(true);
    expect(isProviderSupported('tidal')).toBe(true);
  });

  it('returns false for unknown providers', () => {
    expect(isProviderSupported('deezer')).toBe(false);
    expect(isProviderSupported('')).toBe(false);
  });
});

describe('getProviderIconMetadata', () => {
  it('returns metadata for each supported provider', () => {
    expect(getProviderIconMetadata('spotify')).toBe(PROVIDER_METADATA.spotify);
    expect(getProviderIconMetadata('apple_music')).toBe(
      PROVIDER_METADATA.apple_music
    );
    expect(getProviderIconMetadata('tidal')).toBe(PROVIDER_METADATA.tidal);
  });
});
