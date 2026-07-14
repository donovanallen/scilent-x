import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

const postFindUnique = vi.fn();
const postFindMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    post: {
      findUnique: (...args: unknown[]) => postFindUnique(...args),
      findMany: (...args: unknown[]) => postFindMany(...args),
    },
  },
}));

const { getPostById, getPostsByAuthor } = await import('../queries');

describe('getPostById', () => {
  beforeEach(() => {
    postFindUnique.mockReset();
  });

  it('throws NotFoundError when the post does not exist', async () => {
    postFindUnique.mockResolvedValue(null);

    await expect(getPostById('post-1')).rejects.toThrow(NotFoundError);
  });

  it('returns the post with isLiked/isReposted computed for the current user', async () => {
    postFindUnique.mockResolvedValue({
      id: 'post-1',
      likes: [{ id: 'like-1' }],
      reposts: [],
    });

    const result = await getPostById('post-1', 'user-1');

    expect(result.isLiked).toBe(true);
    expect(result.isReposted).toBe(false);
  });

  it('defaults isLiked/isReposted to false without a current user', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1' });

    const result = await getPostById('post-1');

    expect(result.isLiked).toBe(false);
    expect(result.isReposted).toBe(false);
    expect(postFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ likes: false, reposts: false }),
      })
    );
  });
});

describe('getPostsByAuthor', () => {
  beforeEach(() => {
    postFindMany.mockReset();
  });

  it('filters posts by author and marks isLiked/isReposted', async () => {
    postFindMany.mockResolvedValue([
      { id: 'post-1', likes: [], reposts: [{ id: 'repost-1' }] },
    ]);

    const result = await getPostsByAuthor('author-1', { limit: 20 }, 'user-1');

    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          authorId: 'author-1',
          OR: [{ visibility: 'PUBLIC' }, { authorId: 'user-1' }],
        },
      })
    );
    expect(result.items[0]?.isLiked).toBe(false);
    expect(result.items[0]?.isReposted).toBe(true);
  });

  it('paginates using the provided cursor', async () => {
    postFindMany.mockResolvedValue([]);

    await getPostsByAuthor('author-1', { cursor: 'cursor-1', limit: 5 });

    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: 'cursor-1' }, skip: 1 })
    );
  });

  it('defaults isLiked/isReposted to false without a current user', async () => {
    postFindMany.mockResolvedValue([{ id: 'post-1' }]);

    const result = await getPostsByAuthor('author-1');

    expect(result.items[0]?.isLiked).toBe(false);
    expect(result.items[0]?.isReposted).toBe(false);
  });
});
