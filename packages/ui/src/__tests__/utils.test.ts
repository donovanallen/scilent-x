import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  describe('basic functionality', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles single class', () => {
      expect(cn('foo')).toBe('foo');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('handles undefined and null', () => {
      expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
    });

    it('handles false values', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar');
    });
  });

  describe('conditional classes', () => {
    it('handles conditional classes with objects', () => {
      expect(cn('base', { active: true, disabled: false })).toBe('base active');
    });

    it('handles all false conditions', () => {
      expect(cn({ foo: false, bar: false })).toBe('');
    });

    it('handles all true conditions', () => {
      expect(cn({ foo: true, bar: true })).toBe('foo bar');
    });

    it('handles mixed conditions', () => {
      const isActive = true;
      const isDisabled = false;
      expect(
        cn('btn', { 'btn-active': isActive, 'btn-disabled': isDisabled })
      ).toBe('btn btn-active');
    });
  });

  describe('array handling', () => {
    it('handles arrays of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('handles nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
    });

    it('handles arrays with conditionals', () => {
      expect(cn(['foo', { bar: true, baz: false }])).toBe('foo bar');
    });
  });

  describe('tailwind merge functionality', () => {
    it('merges conflicting padding classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('merges conflicting margin classes', () => {
      expect(cn('m-4', 'm-8')).toBe('m-8');
    });

    it('merges conflicting text color classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('merges conflicting background classes', () => {
      expect(cn('bg-white', 'bg-black')).toBe('bg-black');
    });

    it('preserves non-conflicting classes', () => {
      expect(cn('p-4', 'm-2', 'text-red-500')).toBe('p-4 m-2 text-red-500');
    });

    it('merges conflicting width classes', () => {
      expect(cn('w-full', 'w-auto')).toBe('w-auto');
    });

    it('merges conflicting display classes', () => {
      expect(cn('flex', 'block')).toBe('block');
    });

    it('handles responsive prefixes correctly', () => {
      expect(cn('p-4', 'md:p-4', 'lg:p-8')).toBe('p-4 md:p-4 lg:p-8');
    });

    it('merges same responsive prefix correctly', () => {
      expect(cn('md:p-4', 'md:p-8')).toBe('md:p-8');
    });
  });

  describe('real-world usage patterns', () => {
    it('handles component variant pattern', () => {
      const variant = 'primary';
      const size = 'lg';
      const result = cn('btn', {
        'btn-primary': variant === 'primary',
        'btn-lg': size === 'lg',
      });
      expect(result).toBe('btn btn-primary btn-lg');
    });

    it('handles className override pattern', () => {
      const baseClasses = 'p-4 bg-white text-black';
      const className = 'p-8 text-red-500';
      expect(cn(baseClasses, className)).toBe('bg-white p-8 text-red-500');
    });

    it('handles disabled state pattern', () => {
      const isDisabled = true;
      const result = cn(
        'btn btn-primary',
        isDisabled && 'opacity-50 cursor-not-allowed'
      );
      expect(result).toBe('btn btn-primary opacity-50 cursor-not-allowed');
    });

    it('handles hover state classes', () => {
      expect(cn('bg-white', 'hover:bg-gray-100', 'focus:ring-2')).toBe(
        'bg-white hover:bg-gray-100 focus:ring-2'
      );
    });
  });
});
