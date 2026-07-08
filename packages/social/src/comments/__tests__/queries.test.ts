import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

const commentFindUnique = vi.fn();
const commentFindMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    comment: {
      findUnique: (...args: unknown[]) => commentFindUnique(...args),
      findMany: (...args: unknown[]) => commentFindMany(...args),
    },
  },
}));

const { getCommentById, getCommentsByPost, getCommentReplies } =
  await import('../queries');

describe('getCommentById', () => {
  beforeEach(() => {
    commentFindUnique.mockReset();
  });

  it('throws NotFoundError when the comment does not exist', async () => {
    commentFindUnique.mockResolvedValue(null);

    await expect(getCommentById('comment-1')).rejects.toThrow(NotFoundError);
  });

  it('returns the comment with isLiked false when no current user is given', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      likes: [],
    });

    const result = await getCommentById('comment-1');

    expect(result.isLiked).toBe(false);
    expect(commentFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ likes: false }),
      })
    );
  });

  it('returns isLiked true when the current user has liked the comment', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      likes: [{ id: 'like-1' }],
    });

    const result = await getCommentById('comment-1', 'user-1');

    expect(result.isLiked).toBe(true);
    expect(commentFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          likes: { where: { userId: 'user-1' }, take: 1 },
        }),
      })
    );
  });
});

describe('getCommentsByPost', () => {
  beforeEach(() => {
    commentFindMany.mockReset();
  });

  it('returns top-level comments with transformed replies', async () => {
    commentFindMany.mockResolvedValue([
      {
        id: 'comment-1',
        likes: [{ id: 'like-1' }],
        replies: [
          { id: 'reply-1', likes: [{ id: 'like-2' }] },
          { id: 'reply-2', likes: [] },
        ],
      },
    ]);

    const result = await getCommentsByPost('post-1', { limit: 20 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.items[0]?.replies?.[0]?.isLiked).toBe(true);
    expect(result.items[0]?.replies?.[1]?.isLiked).toBe(false);
    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { postId: 'post-1', parentId: null },
      })
    );
  });

  it('defaults isLiked to false without a current user', async () => {
    commentFindMany.mockResolvedValue([
      { id: 'comment-1', likes: [], replies: [] },
    ]);

    const result = await getCommentsByPost('post-1');

    expect(result.items[0]?.isLiked).toBe(false);
  });

  it('paginates using the provided cursor', async () => {
    commentFindMany.mockResolvedValue([]);

    await getCommentsByPost('post-1', { cursor: 'cursor-1', limit: 5 });

    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: 'cursor-1' },
        skip: 1,
      })
    );
  });
});

describe('getCommentReplies', () => {
  beforeEach(() => {
    commentFindMany.mockReset();
  });

  it('returns replies with isLiked flags', async () => {
    commentFindMany.mockResolvedValue([
      { id: 'reply-1', likes: [{ id: 'like-1' }] },
      { id: 'reply-2', likes: [] },
    ]);

    const result = await getCommentReplies('comment-1', {}, 'user-1');

    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.items[1]?.isLiked).toBe(false);
    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { parentId: 'comment-1' } })
    );
  });

  it('defaults isLiked to false without a current user', async () => {
    commentFindMany.mockResolvedValue([{ id: 'reply-1', likes: [] }]);

    const result = await getCommentReplies('comment-1');

    expect(result.items[0]?.isLiked).toBe(false);
  });
});
