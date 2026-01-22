'use client';

import * as React from 'react';

export interface UseInfiniteScrollOptions {
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  /**
   * Whether currently loading
   */
  isLoading: boolean;
  /**
   * Function to call when reaching the threshold
   */
  onLoadMore: () => void;
  /**
   * Threshold in pixels before the end to trigger loading
   * @default 200
   */
  threshold?: number;
  /**
   * Root margin for the intersection observer. When omitted, the threshold
   * value is used to compute a pixel-based root margin.
   */
  rootMargin?: string;
}

export interface UseInfiniteScrollReturn {
  /**
   * Ref to attach to the sentinel element at the end of the list
   */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  rootMargin,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const resolvedRootMargin = rootMargin ?? `${threshold}px`;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        rootMargin: resolvedRootMargin,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, resolvedRootMargin]);

  return { sentinelRef };
}
