import { describe, it, expect } from 'vitest';
import {
  getPaginationParams,
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../pagination';

describe('getPaginationParams', () => {
  describe('limit handling', () => {
    it('uses default page size when limit not provided', () => {
      const result = getPaginationParams({});

      expect(result.take).toBe(DEFAULT_PAGE_SIZE + 1);
    });

    it('uses provided limit when within bounds', () => {
      const result = getPaginationParams({ limit: 10 });

      expect(result.take).toBe(11); // limit + 1
    });

    it('clamps limit to max page size', () => {
      const result = getPaginationParams({ limit: 500 });

      expect(result.take).toBe(MAX_PAGE_SIZE + 1);
    });

    it('handles limit at exactly max page size', () => {
      const result = getPaginationParams({ limit: MAX_PAGE_SIZE });

      expect(result.take).toBe(MAX_PAGE_SIZE + 1);
    });

    it('handles limit of 1', () => {
      const result = getPaginationParams({ limit: 1 });

      expect(result.take).toBe(2);
    });

    it('handles zero limit (uses 0 since nullish coalescing)', () => {
      const result = getPaginationParams({ limit: 0 });

      // 0 is not nullish, so it's treated as valid limit
      // Math.min(0, 100) = 0, then 0 + 1 = 1
      expect(result.take).toBe(1);
    });
  });

  describe('cursor handling', () => {
    it('passes through cursor when provided', () => {
      const result = getPaginationParams({ cursor: 'abc123' });

      expect(result.cursor).toBe('abc123');
    });

    it('returns undefined cursor when not provided', () => {
      const result = getPaginationParams({});

      expect(result.cursor).toBeUndefined();
    });

    it('handles empty string cursor', () => {
      const result = getPaginationParams({ cursor: '' });

      expect(result.cursor).toBe('');
    });
  });

  describe('combined params', () => {
    it('handles both cursor and limit', () => {
      const result = getPaginationParams({ cursor: 'xyz', limit: 50 });

      expect(result.cursor).toBe('xyz');
      expect(result.take).toBe(51);
    });
  });
});

describe('createPaginatedResult', () => {
  describe('hasMore logic', () => {
    it('sets hasMore to true when items exceed limit', () => {
      const items = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ];
      const result = createPaginatedResult(items, 2);

      expect(result.hasMore).toBe(true);
    });

    it('sets hasMore to false when items equal limit', () => {
      const items = [
        { id: '1' },
        { id: '2' },
      ];
      const result = createPaginatedResult(items, 2);

      expect(result.hasMore).toBe(false);
    });

    it('sets hasMore to false when items less than limit', () => {
      const items = [
        { id: '1' },
      ];
      const result = createPaginatedResult(items, 5);

      expect(result.hasMore).toBe(false);
    });
  });

  describe('items slicing', () => {
    it('slices items to limit when hasMore is true', () => {
      const items = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ];
      const result = createPaginatedResult(items, 2);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.id).toBe('1');
      expect(result.items[1]?.id).toBe('2');
    });

    it('returns all items when hasMore is false', () => {
      const items = [
        { id: '1' },
        { id: '2' },
      ];
      const result = createPaginatedResult(items, 5);

      expect(result.items).toHaveLength(2);
    });
  });

  describe('nextCursor calculation', () => {
    it('returns last item id as nextCursor when hasMore', () => {
      const items = [
        { id: 'first' },
        { id: 'second' },
        { id: 'third' },
      ];
      const result = createPaginatedResult(items, 2);

      expect(result.nextCursor).toBe('second');
    });

    it('returns null nextCursor when no more items', () => {
      const items = [
        { id: '1' },
        { id: '2' },
      ];
      const result = createPaginatedResult(items, 5);

      expect(result.nextCursor).toBeNull();
    });
  });

  describe('empty array handling', () => {
    it('handles empty array', () => {
      const result = createPaginatedResult([], 10);

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles limit of 1 with 2 items', () => {
      const items = [
        { id: 'first' },
        { id: 'second' },
      ];
      const result = createPaginatedResult(items, 1);

      expect(result.items).toHaveLength(1);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('first');
    });

    it('handles items with complex ids', () => {
      const items = [
        { id: 'cm1234567890abcdef' },
        { id: 'cm0987654321fedcba' },
      ];
      const result = createPaginatedResult(items, 1);

      expect(result.nextCursor).toBe('cm1234567890abcdef');
    });

    it('preserves additional item properties', () => {
      const items = [
        { id: '1', name: 'Alice', email: 'alice@test.com' },
        { id: '2', name: 'Bob', email: 'bob@test.com' },
      ];
      const result = createPaginatedResult(items, 5);

      expect(result.items[0]).toEqual({ id: '1', name: 'Alice', email: 'alice@test.com' });
    });
  });
});

describe('constants', () => {
  it('exports DEFAULT_PAGE_SIZE as 20', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('exports MAX_PAGE_SIZE as 100', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });
});
