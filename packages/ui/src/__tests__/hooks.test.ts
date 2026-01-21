/** @vitest-environment jsdom */
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, waitFor } from '@testing-library/react';

import { useEditPost } from '../hooks/use-edit-post';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';
import {
  useFollow,
  useLike,
  useOptimisticAction,
} from '../hooks/use-optimistic-action';

type Post = {
  id: string;
  content: string;
  contentHtml?: string | null;
};

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const createPosts = (): Post[] => [
  { id: 'post-1', content: 'Hello', contentHtml: '<p>Hello</p>' },
  { id: 'post-2', content: 'World', contentHtml: '<p>World</p>' },
];

describe('useEditPost', () => {
  it('tracks editing state', () => {
    const { result } = renderHook(() => {
      const [posts, setPosts] = React.useState<Post[]>(createPosts());
      return { ...useEditPost({ posts, setPosts, onSave: vi.fn() }), posts };
    });

    expect(result.current.editingPostId).toBeNull();

    act(() => {
      result.current.startEditing('post-1');
    });
    expect(result.current.editingPostId).toBe('post-1');

    act(() => {
      result.current.cancelEditing();
    });
    expect(result.current.editingPostId).toBeNull();
  });

  it('applies optimistic updates and resets on success', async () => {
    const onSuccess = vi.fn();
    const deferred = createDeferred<void>();
    const onSave = vi.fn().mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => {
      const [posts, setPosts] = React.useState<Post[]>(createPosts());
      return {
        ...useEditPost({ posts, setPosts, onSave, onSuccess }),
        posts,
      };
    });

    act(() => {
      result.current.startEditing('post-1');
    });

    let savePromise: Promise<void>;
    act(() => {
      savePromise = result.current.saveEdit(
        'post-1',
        'Updated',
        '<p>Updated</p>'
      );
    });

    expect(onSave).toHaveBeenCalledWith(
      'post-1',
      'Updated',
      '<p>Updated</p>'
    );
    expect(result.current.isSavingEdit).toBe(true);
    expect(result.current.posts[0]?.content).toBe('Updated');
    expect(result.current.posts[0]?.contentHtml).toBe('<p>Updated</p>');

    deferred.resolve();
    await act(async () => {
      await savePromise;
    });

    expect(result.current.isSavingEdit).toBe(false);
    expect(result.current.editingPostId).toBeNull();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('rolls back on error and reports failures', async () => {
    const onError = vi.fn();
    const onSave = vi.fn().mockRejectedValueOnce('network');
    const basePosts = createPosts();

    const { result } = renderHook(() => {
      const [posts, setPosts] = React.useState<Post[]>(basePosts);
      return {
        ...useEditPost({ posts, setPosts, onSave, onError }),
        posts,
      };
    });

    act(() => {
      result.current.startEditing('post-1');
    });

    await act(async () => {
      await result.current.saveEdit(
        'post-1',
        'Updated',
        '<p>Updated</p>'
      );
    });

    expect(result.current.posts).toEqual(basePosts);
    expect(onError).toHaveBeenCalledTimes(1);
    const [error] = onError.mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('network');
    expect(result.current.editingPostId).toBe('post-1');
    expect(result.current.isSavingEdit).toBe(false);
  });

  it('ignores save requests while saving', async () => {
    const deferred = createDeferred<void>();
    const onSave = vi.fn().mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => {
      const [posts, setPosts] = React.useState<Post[]>(createPosts());
      return { ...useEditPost({ posts, setPosts, onSave }), posts };
    });

    let savePromise: Promise<void>;
    act(() => {
      savePromise = result.current.saveEdit(
        'post-1',
        'Updated',
        '<p>Updated</p>'
      );
    });

    await waitFor(() => {
      expect(result.current.isSavingEdit).toBe(true);
    });

    act(() => {
      void result.current.saveEdit('post-1', 'Again', '<p>Again</p>');
    });

    expect(onSave).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await act(async () => {
      await savePromise;
    });
  });
});

describe('useOptimisticAction', () => {
  it('uses optimistic value while pending', async () => {
    const deferred = createDeferred<void>();
    const action = vi.fn().mockReturnValueOnce(deferred.promise);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useOptimisticAction({
        value: 1,
        optimisticValue: 2,
        action,
        onSuccess,
      })
    );

    let executePromise: Promise<void>;
    act(() => {
      executePromise = result.current.execute();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.value).toBe(2);

    deferred.resolve();
    await act(async () => {
      await executePromise;
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);
    expect(result.current.value).toBe(1);
  });

  it('resets optimistic value on error', async () => {
    const onError = vi.fn();
    const action = vi.fn().mockRejectedValueOnce('boom');

    const { result } = renderHook(() =>
      useOptimisticAction({
        value: 'stable',
        optimisticValue: 'optimistic',
        action,
        onError,
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    const [error] = onError.mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('boom');
    expect(result.current.isPending).toBe(false);
    expect(result.current.value).toBe('stable');
  });

  it('does not execute when already pending', async () => {
    const deferred = createDeferred<void>();
    const action = vi.fn().mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() =>
      useOptimisticAction({
        value: 0,
        optimisticValue: 1,
        action,
      })
    );

    let executePromise: Promise<void>;
    act(() => {
      executePromise = result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    act(() => {
      void result.current.execute();
    });

    expect(action).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await act(async () => {
      await executePromise;
    });
  });
});

describe('useLike', () => {
  it('optimistically likes and resets after success', async () => {
    const deferred = createDeferred<void>();
    const onLike = vi.fn().mockReturnValueOnce(deferred.promise);
    const onUnlike = vi.fn();

    const { result } = renderHook(() =>
      useLike({
        isLiked: false,
        likesCount: 5,
        onLike,
        onUnlike,
      })
    );

    let togglePromise: Promise<void>;
    act(() => {
      togglePromise = result.current.toggle();
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likesCount).toBe(6);
    expect(onLike).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await act(async () => {
      await togglePromise;
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isLiked).toBe(false);
    expect(result.current.likesCount).toBe(5);
  });

  it('routes to unlike when already liked', async () => {
    const deferred = createDeferred<void>();
    const onUnlike = vi.fn().mockReturnValueOnce(deferred.promise);
    const onLike = vi.fn();

    const { result } = renderHook(() =>
      useLike({
        isLiked: true,
        likesCount: 10,
        onLike,
        onUnlike,
      })
    );

    let togglePromise: Promise<void>;
    act(() => {
      togglePromise = result.current.toggle();
    });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likesCount).toBe(9);
    expect(onUnlike).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await act(async () => {
      await togglePromise;
    });

    expect(result.current.isPending).toBe(false);
  });

  it('clears optimistic state on error', async () => {
    const onError = vi.fn();
    const onLike = vi.fn().mockRejectedValueOnce('nope');
    const onUnlike = vi.fn();

    const { result } = renderHook(() =>
      useLike({
        isLiked: false,
        likesCount: 1,
        onLike,
        onUnlike,
        onError,
      })
    );

    await act(async () => {
      await result.current.toggle();
    });

    const [error] = onError.mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('nope');
    expect(result.current.isLiked).toBe(false);
    expect(result.current.likesCount).toBe(1);
  });
});

describe('useFollow', () => {
  it('optimistically follows and resets after success', async () => {
    const deferred = createDeferred<void>();
    const onFollow = vi.fn().mockReturnValueOnce(deferred.promise);
    const onUnfollow = vi.fn();

    const { result } = renderHook(() =>
      useFollow({
        isFollowing: false,
        onFollow,
        onUnfollow,
      })
    );

    let togglePromise: Promise<void>;
    act(() => {
      togglePromise = result.current.toggle();
    });

    expect(result.current.isFollowing).toBe(true);
    expect(onFollow).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await act(async () => {
      await togglePromise;
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isFollowing).toBe(false);
  });

  it('clears optimistic state on error', async () => {
    const onError = vi.fn();
    const onFollow = vi.fn().mockRejectedValueOnce('fail');
    const onUnfollow = vi.fn();

    const { result } = renderHook(() =>
      useFollow({
        isFollowing: false,
        onFollow,
        onUnfollow,
        onError,
      })
    );

    await act(async () => {
      await result.current.toggle();
    });

    const [error] = onError.mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('fail');
    expect(result.current.isFollowing).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  it('does not toggle while pending', async () => {
    const deferred = createDeferred<void>();
    const onFollow = vi.fn().mockReturnValueOnce(deferred.promise);
    const onUnfollow = vi.fn();

    const { result } = renderHook(() =>
      useFollow({
        isFollowing: false,
        onFollow,
        onUnfollow,
      })
    );

    let togglePromise: Promise<void>;
    act(() => {
      togglePromise = result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    act(() => {
      void result.current.toggle();
    });

    expect(onFollow).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await act(async () => {
      await togglePromise;
    });
  });
});

describe('useInfiniteScroll', () => {
  let observerCallback: IntersectionObserverCallback | null = null;
  let observerOptions: IntersectionObserverInit | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();

  class MockIntersectionObserver {
    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      observerCallback = callback;
      observerOptions = options;
    }

    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = vi.fn();
  }

  const InfiniteScrollHarness = (props: {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    threshold?: number;
    rootMargin?: string;
  }) => {
    const { sentinelRef } = useInfiniteScroll(props);
    return React.createElement('div', { ref: sentinelRef });
  };

  beforeEach(() => {
    observerCallback = null;
    observerOptions = undefined;
    observe.mockClear();
    disconnect.mockClear();
    vi.stubGlobal(
      'IntersectionObserver',
      MockIntersectionObserver as unknown as typeof IntersectionObserver
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls onLoadMore when intersecting with more data', () => {
    const onLoadMore = vi.fn();
    render(
      React.createElement(InfiniteScrollHarness, {
        hasMore: true,
        isLoading: false,
        onLoadMore,
        threshold: 150,
      })
    );

    expect(observe).toHaveBeenCalledTimes(1);
    expect(observerOptions?.rootMargin).toBe('150px');

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('does not load when no more items are available', () => {
    const onLoadMore = vi.fn();
    render(
      React.createElement(InfiniteScrollHarness, {
        hasMore: false,
        isLoading: false,
        onLoadMore,
      })
    );

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not load while already loading', () => {
    const onLoadMore = vi.fn();
    render(
      React.createElement(InfiniteScrollHarness, {
        hasMore: true,
        isLoading: true,
        onLoadMore,
      })
    );

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('disconnects the observer on unmount', () => {
    const onLoadMore = vi.fn();
    const { unmount } = render(
      React.createElement(InfiniteScrollHarness, {
        hasMore: true,
        isLoading: false,
        onLoadMore,
      })
    );

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
