import { describe, it, expect, vi, beforeEach } from 'vitest';

const followFindMany = vi.fn();
const postFindMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    follow: {
      findMany: (...args: unknown[]) => followFindMany(...args),
    },
    post: {
      findMany: (...args: unknown[]) => postFindMany(...args),
    },
  },
}));

const { getHomeFeed } = await import('../home-feed');

describe('getHomeFeed', () => {
  beforeEach(() => {
    followFindMany.mockReset();
    postFindMany.mockReset();
  });

  it('includes followed users and the user themselves in the author filter', async () => {
    followFindMany.mockResolvedValue([
      { followingId: 'author-1' },
      { followingId: 'author-2' },
    ]);
    postFindMany.mockResolvedValue([]);

    await getHomeFeed('user-1', { limit: 20 });

    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { authorId: { in: ['author-1', 'author-2', 'user-1'] } },
      })
    );
  });

  it('transforms posts, marking isLiked/isReposted and comment isLiked flags', async () => {
    followFindMany.mockResolvedValue([]);
    postFindMany.mockResolvedValue([
      {
        id: 'post-1',
        likes: [{ id: 'like-1' }],
        reposts: [],
        comments: [
          {
            id: 'comment-1',
            likes: [{ id: 'like-2' }],
            _count: { likes: 1, replies: 0 },
          },
        ],
      },
    ]);

    const result = await getHomeFeed('user-1');

    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.items[0]?.isReposted).toBe(false);
    expect(result.items[0]?.comments?.[0]).toMatchObject({
      isLiked: true,
      likesCount: 1,
      repliesCount: 0,
    });
  });

  it('paginates using the provided cursor', async () => {
    followFindMany.mockResolvedValue([]);
    postFindMany.mockResolvedValue([]);

    await getHomeFeed('user-1', { cursor: 'cursor-1', limit: 5 });

    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: 'cursor-1' }, skip: 1 })
    );
  });
});
