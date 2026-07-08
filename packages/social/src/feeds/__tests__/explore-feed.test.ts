import { describe, it, expect, vi, beforeEach } from 'vitest';

const postFindMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    post: {
      findMany: (...args: unknown[]) => postFindMany(...args),
    },
  },
}));

const { getExploreFeed, getTrendingPosts } = await import('../explore-feed');

describe('getExploreFeed', () => {
  beforeEach(() => {
    postFindMany.mockReset();
  });

  it('marks posts as liked/reposted for the current user', async () => {
    postFindMany.mockResolvedValue([
      { id: 'post-1', likes: [{ id: 'like-1' }], reposts: [] },
      { id: 'post-2', likes: [], reposts: [{ id: 'repost-1' }] },
    ]);

    const result = await getExploreFeed({ limit: 20 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.items[0]?.isReposted).toBe(false);
    expect(result.items[1]?.isLiked).toBe(false);
    expect(result.items[1]?.isReposted).toBe(true);
  });

  it('defaults isLiked/isReposted to false without a current user', async () => {
    postFindMany.mockResolvedValue([{ id: 'post-1' }]);

    const result = await getExploreFeed();

    expect(result.items[0]?.isLiked).toBe(false);
    expect(result.items[0]?.isReposted).toBe(false);
    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ likes: false, reposts: false }),
      })
    );
  });

  it('paginates using the provided cursor', async () => {
    postFindMany.mockResolvedValue([]);

    await getExploreFeed({ cursor: 'cursor-1', limit: 10 });

    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: 'cursor-1' }, skip: 1 })
    );
  });
});

describe('getTrendingPosts', () => {
  beforeEach(() => {
    postFindMany.mockReset();
  });

  it('queries posts from the last 7 days ordered by engagement', async () => {
    postFindMany.mockResolvedValue([
      {
        id: 'post-1',
        likes: [{ id: 'like-1' }],
        reposts: [{ id: 'repost-1' }],
      },
    ]);

    const result = await getTrendingPosts({ limit: 20 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.items[0]?.isReposted).toBe(true);

    const callArgs = postFindMany.mock.calls[0]?.[0];
    expect(callArgs.where.createdAt.gte).toBeInstanceOf(Date);
    expect(callArgs.orderBy).toEqual([
      { likes: { _count: 'desc' } },
      { comments: { _count: 'desc' } },
      { createdAt: 'desc' },
    ]);
  });

  it('defaults isLiked/isReposted to false without a current user', async () => {
    postFindMany.mockResolvedValue([{ id: 'post-1' }]);

    const result = await getTrendingPosts();

    expect(result.items[0]?.isLiked).toBe(false);
    expect(result.items[0]?.isReposted).toBe(false);
  });
});
