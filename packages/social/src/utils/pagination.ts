import type { PaginationParams, PaginatedResult } from '../types';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function getPaginationParams(params: PaginationParams): {
  cursor: string | undefined;
  take: number;
} {
  const limit = Math.min(params.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  return {
    cursor: params.cursor,
    take: limit + 1, // Fetch one extra to determine if there are more
  };
}

export function createPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const resultItems = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? (resultItems[resultItems.length - 1]?.id ?? null) : null;

  return {
    items: resultItems,
    nextCursor,
    hasMore,
  };
}
