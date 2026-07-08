import { describe, it, expect, vi, beforeEach } from 'vitest';

const postFindMany = vi.fn();
const likeFindMany = vi.fn();
const repostFindMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    post: {
      findMany: (...args: unknown[]) => postFindMany(...args),
    },
    like: {
      findMany: (...args: unknown[]) => likeFindMany(...args),
    },
    repost: {
      findMany: (...args: unknown[]) => repostFindMany(...args),
    },
  },
}));

const { getProfileFeed, getLikedPosts, getUserReposts } =
  await import('../profile-feed');

describe('getProfileFeed', () => {
  beforeEach(() => {
    postFindMany.mockReset();
  });

  it('filters posts by author and marks isLiked/isReposted', async () => {
    postFindMany.mockResolvedValue([
      { id: 'post-1', likes: [{ id: 'like-1' }], reposts: [] },
    ]);

    const result = await getProfileFeed('author-1', { limit: 20 }, 'user-1');

    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { authorId: 'author-1' } })
    );
    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.items[0]?.isReposted).toBe(false);
  });

  it('defaults isLiked/isReposted to false without current user', async () => {
    postFindMany.mockResolvedValue([{ id: 'post-1' }]);

    const result = await getProfileFeed('author-1');

    expect(result.items[0]?.isLiked).toBe(false);
    expect(result.items[0]?.isReposted).toBe(false);
  });
});

describe('getLikedPosts', () => {
  beforeEach(() => {
    likeFindMany.mockReset();
  });

  it('returns liked posts, filtering out likes without a post', async () => {
    likeFindMany.mockResolvedValue([
      {
        id: 'like-1',
        post: { id: 'post-1', likes: [{ id: 'like-a' }], reposts: [] },
      },
      { id: 'like-2', post: null },
    ]);

    const result = await getLikedPosts('user-1', { limit: 20 }, 'user-1');

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('post-1');
    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('computes hasMore/nextCursor from the like id when exceeding the limit', async () => {
    likeFindMany.mockResolvedValue([
      { id: 'like-1', post: { id: 'post-1', likes: [], reposts: [] } },
      { id: 'like-2', post: { id: 'post-2', likes: [], reposts: [] } },
      { id: 'like-3', post: { id: 'post-3', likes: [], reposts: [] } },
    ]);

    const result = await getLikedPosts('user-1', { limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('like-2');
  });

  it('defaults isLiked/isReposted to false without a current user', async () => {
    likeFindMany.mockResolvedValue([
      { id: 'like-1', post: { id: 'post-1', likes: [], reposts: [] } },
    ]);

    const result = await getLikedPosts('user-1');

    expect(result.items[0]?.isLiked).toBe(false);
    expect(result.items[0]?.isReposted).toBe(false);
  });
});

describe('getUserReposts', () => {
  beforeEach(() => {
    repostFindMany.mockReset();
  });

  it('returns reposted posts, filtering out reposts without a post', async () => {
    repostFindMany.mockResolvedValue([
      {
        id: 'repost-1',
        post: { id: 'post-1', likes: [], reposts: [{ id: 'r1' }] },
      },
      { id: 'repost-2', post: null },
    ]);

    const result = await getUserReposts('user-1', { limit: 20 }, 'user-1');

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('post-1');
    expect(result.items[0]?.isReposted).toBe(true);
  });

  it('computes hasMore/nextCursor from the repost id when exceeding the limit', async () => {
    repostFindMany.mockResolvedValue([
      { id: 'repost-1', post: { id: 'post-1', likes: [], reposts: [] } },
      { id: 'repost-2', post: { id: 'post-2', likes: [], reposts: [] } },
    ]);

    const result = await getUserReposts('user-1', { limit: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('repost-1');
  });

  it('defaults isLiked/isReposted to false without a current user', async () => {
    repostFindMany.mockResolvedValue([
      { id: 'repost-1', post: { id: 'post-1', likes: [], reposts: [] } },
    ]);

    const result = await getUserReposts('user-1');

    expect(result.items[0]?.isLiked).toBe(false);
    expect(result.items[0]?.isReposted).toBe(false);
  });
});
