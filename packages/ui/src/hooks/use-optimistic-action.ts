'use client';

import * as React from 'react';

export interface UseOptimisticActionOptions<T> {
  /**
   * The current value
   */
  value: T;
  /**
   * The async action to perform
   */
  action: () => Promise<void>;
  /**
   * The optimistic value to set immediately
   */
  optimisticValue: T;
  /**
   * Callback when action succeeds
   */
  onSuccess?: () => void;
  /**
   * Callback when action fails
   */
  onError?: (error: Error) => void;
}

export interface UseOptimisticActionReturn<T> {
  /**
   * The current value (optimistic or actual)
   */
  value: T;
  /**
   * Whether the action is pending
   */
  isPending: boolean;
  /**
   * Execute the action with optimistic update
   */
  execute: () => Promise<void>;
}

export function useOptimisticAction<T>({
  value,
  action,
  optimisticValue,
  onSuccess,
  onError,
}: UseOptimisticActionOptions<T>): UseOptimisticActionReturn<T> {
  const [isPending, setIsPending] = React.useState(false);
  const [optimistic, setOptimistic] = React.useState<T | null>(null);

  const execute = React.useCallback(async () => {
    if (isPending) return;

    setIsPending(true);
    setOptimistic(optimisticValue);

    try {
      await action();
      onSuccess?.();
    } catch (error) {
      setOptimistic(null);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsPending(false);
      setOptimistic(null);
    }
  }, [action, optimisticValue, isPending, onSuccess, onError]);

  return {
    value: optimistic ?? value,
    isPending,
    execute,
  };
}

// Specialized hook for like/unlike actions
export interface UseLikeOptions {
  isLiked: boolean;
  likesCount: number;
  onLike: () => Promise<void>;
  onUnlike: () => Promise<void>;
  onError?: (error: Error) => void;
}

export interface UseLikeReturn {
  isLiked: boolean;
  likesCount: number;
  isPending: boolean;
  toggle: () => Promise<void>;
}

export function useLike({
  isLiked,
  likesCount,
  onLike,
  onUnlike,
  onError,
}: UseLikeOptions): UseLikeReturn {
  const [isPending, setIsPending] = React.useState(false);
  const [optimisticLiked, setOptimisticLiked] = React.useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = React.useState<number | null>(null);

  const toggle = React.useCallback(async () => {
    if (isPending) return;

    const willLike = !(optimisticLiked ?? isLiked);

    setIsPending(true);
    setOptimisticLiked(willLike);
    setOptimisticCount((optimisticCount ?? likesCount) + (willLike ? 1 : -1));

    try {
      if (willLike) {
        await onLike();
      } else {
        await onUnlike();
      }
    } catch (error) {
      setOptimisticLiked(null);
      setOptimisticCount(null);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsPending(false);
      setOptimisticLiked(null);
      setOptimisticCount(null);
    }
  }, [isLiked, likesCount, onLike, onUnlike, isPending, onError, optimisticLiked, optimisticCount]);

  return {
    isLiked: optimisticLiked ?? isLiked,
    likesCount: optimisticCount ?? likesCount,
    isPending,
    toggle,
  };
}

// Specialized hook for follow/unfollow actions
export interface UseFollowOptions {
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  onError?: (error: Error) => void;
}

export interface UseFollowReturn {
  isFollowing: boolean;
  isPending: boolean;
  toggle: () => Promise<void>;
}

export function useFollow({
  isFollowing,
  onFollow,
  onUnfollow,
  onError,
}: UseFollowOptions): UseFollowReturn {
  const [isPending, setIsPending] = React.useState(false);
  const [optimisticFollowing, setOptimisticFollowing] = React.useState<boolean | null>(null);

  const toggle = React.useCallback(async () => {
    if (isPending) return;

    const willFollow = !(optimisticFollowing ?? isFollowing);

    setIsPending(true);
    setOptimisticFollowing(willFollow);

    try {
      if (willFollow) {
        await onFollow();
      } else {
        await onUnfollow();
      }
    } catch (error) {
      setOptimisticFollowing(null);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsPending(false);
      setOptimisticFollowing(null);
    }
  }, [isFollowing, onFollow, onUnfollow, isPending, onError, optimisticFollowing]);

  return {
    isFollowing: optimisticFollowing ?? isFollowing,
    isPending,
    toggle,
  };
}
