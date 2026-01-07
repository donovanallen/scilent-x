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
   * Root margin for the intersection observer
   * @default '0px'
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
  rootMargin = '0px',
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

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
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, threshold, rootMargin]);

  return { sentinelRef };
}
