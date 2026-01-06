import { describe, it, expect } from 'vitest';
import {
  isValidGtin,
  isValidIsrc,
  normalizeGtin,
  normalizeIsrc,
  normalizeString,
} from '../utils/validation';

describe('validation utilities', () => {
  describe('isValidGtin', () => {
    it('validates correct GTIN-13 (EAN)', () => {
      expect(isValidGtin('5099902895529')).toBe(true);
    });

    it('validates correct GTIN-12 (UPC)', () => {
      expect(isValidGtin('602445790920')).toBe(true);
    });

    it('validates correct GTIN-14', () => {
      expect(isValidGtin('00602445790920')).toBe(true);
    });

    it('rejects invalid check digit', () => {
      expect(isValidGtin('5099902895528')).toBe(false);
    });

    it('rejects non-numeric characters', () => {
      expect(isValidGtin('509990289552A')).toBe(false);
    });

    it('rejects wrong length', () => {
      expect(isValidGtin('12345')).toBe(false);
    });
  });

  describe('isValidIsrc', () => {
    it('validates correct ISRC format', () => {
      expect(isValidIsrc('USRC17607839')).toBe(true);
    });

    it('validates ISRC with dashes', () => {
      expect(isValidIsrc('US-RC1-76-07839')).toBe(true);
    });

    it('validates lowercase ISRC', () => {
      expect(isValidIsrc('usrc17607839')).toBe(true);
    });

    it('rejects too short ISRC', () => {
      expect(isValidIsrc('USRC1760783')).toBe(false);
    });

    it('rejects invalid format', () => {
      expect(isValidIsrc('12RC17607839')).toBe(false);
    });
  });

  describe('normalizeGtin', () => {
    it('pads short GTIN to 14 digits', () => {
      expect(normalizeGtin('602445790920')).toBe('00602445790920');
    });

    it('removes spaces and dashes', () => {
      expect(normalizeGtin('602-445-790920')).toBe('00602445790920');
    });

    it('preserves 14-digit GTIN', () => {
      expect(normalizeGtin('00602445790920')).toBe('00602445790920');
    });
  });

  describe('normalizeIsrc', () => {
    it('removes dashes and uppercases', () => {
      expect(normalizeIsrc('us-rc1-76-07839')).toBe('USRC17607839');
    });

    it('removes spaces', () => {
      expect(normalizeIsrc('USRC1 76 07839')).toBe('USRC17607839');
    });
  });

  describe('normalizeString', () => {
    it('lowercases string', () => {
      expect(normalizeString('HELLO')).toBe('hello');
    });

    it('removes diacritics', () => {
      expect(normalizeString('Björk')).toBe('bjork');
      expect(normalizeString('café')).toBe('cafe');
    });

    it('removes special characters', () => {
      expect(normalizeString('Hello, World!')).toBe('hello world');
    });

    it('collapses whitespace', () => {
      expect(normalizeString('hello   world')).toBe('hello world');
    });

    it('trims whitespace', () => {
      expect(normalizeString('  hello  ')).toBe('hello');
    });
  });
});
