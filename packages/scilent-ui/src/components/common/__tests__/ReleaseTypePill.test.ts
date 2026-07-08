import { describe, it, expect } from 'vitest';
import {
  getReleaseTypeLabel,
  getReleaseTypePluralLabel,
  releaseTypeLabels,
  releaseTypePluralLabels,
} from '../ReleaseTypePill';

describe('getReleaseTypeLabel', () => {
  it('returns labels for known release types', () => {
    expect(getReleaseTypeLabel('album')).toBe('Album');
    expect(getReleaseTypeLabel('single')).toBe('Single');
    expect(getReleaseTypeLabel('ep')).toBe('EP');
    expect(getReleaseTypeLabel('compilation')).toBe('Compilation');
  });

  it('returns the input for unknown release types', () => {
    expect(getReleaseTypeLabel('bootleg')).toBe('bootleg');
  });
});

describe('getReleaseTypePluralLabel', () => {
  it('returns plural labels for known release types', () => {
    expect(getReleaseTypePluralLabel('album')).toBe('Albums');
    expect(getReleaseTypePluralLabel('single')).toBe('Singles');
    expect(getReleaseTypePluralLabel('all')).toBe('All');
  });

  it('returns the input for unknown release types', () => {
    expect(getReleaseTypePluralLabel('bootleg')).toBe('bootleg');
  });
});

describe('release type label maps', () => {
  it('covers every release type in both maps', () => {
    const types = Object.keys(releaseTypeLabels);
    for (const type of types) {
      expect(
        releaseTypePluralLabels[type as keyof typeof releaseTypePluralLabels]
      ).toBeDefined();
    }
  });
});
