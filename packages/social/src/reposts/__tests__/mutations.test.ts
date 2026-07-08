import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, ConflictError } from '../../utils/errors';

const postFindUnique = vi.fn();
const repostFindUnique = vi.fn();
const repostCreate = vi.fn();
const repostDelete = vi.fn();
const activityCreate = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    post: {
      findUnique: (...args: unknown[]) => postFindUnique(...args),
    },
    repost: {
      findUnique: (...args: unknown[]) => repostFindUnique(...args),
      create: (...args: unknown[]) => repostCreate(...args),
      delete: (...args: unknown[]) => repostDelete(...args),
    },
    activity: {
      create: (...args: unknown[]) => activityCreate(...args),
    },
  },
}));

const { repostPost, unrepostPost } = await import('../mutations');

describe('repostPost', () => {
  beforeEach(() => {
    postFindUnique.mockReset();
    repostFindUnique.mockReset();
    repostCreate.mockReset();
    activityCreate.mockReset();
  });

  it('throws NotFoundError when the post does not exist', async () => {
    postFindUnique.mockResolvedValue(null);

    await expect(repostPost('user-1', 'post-1')).rejects.toThrow(NotFoundError);
    expect(repostCreate).not.toHaveBeenCalled();
  });

  it('throws ConflictError when the post is already reposted by the user', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    repostFindUnique.mockResolvedValue({ id: 'repost-1' });

    await expect(repostPost('user-1', 'post-1')).rejects.toThrow(ConflictError);
    expect(repostCreate).not.toHaveBeenCalled();
  });

  it('creates a repost and a POST_REPOSTED activity for the post author', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    repostFindUnique.mockResolvedValue(null);

    await repostPost('user-1', 'post-1');

    expect(repostCreate).toHaveBeenCalledWith({
      data: { userId: 'user-1', postId: 'post-1' },
    });
    expect(activityCreate).toHaveBeenCalledWith({
      data: {
        type: 'POST_REPOSTED',
        userId: 'author-1',
        actorId: 'user-1',
        postId: 'post-1',
      },
    });
  });

  it('does not create an activity when reposting your own post', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });
    repostFindUnique.mockResolvedValue(null);

    await repostPost('user-1', 'post-1');

    expect(repostCreate).toHaveBeenCalled();
    expect(activityCreate).not.toHaveBeenCalled();
  });
});

describe('unrepostPost', () => {
  beforeEach(() => {
    repostFindUnique.mockReset();
    repostDelete.mockReset();
  });

  it('throws NotFoundError when no repost exists', async () => {
    repostFindUnique.mockResolvedValue(null);

    await expect(unrepostPost('user-1', 'post-1')).rejects.toThrow(
      NotFoundError
    );
    expect(repostDelete).not.toHaveBeenCalled();
  });

  it('deletes the existing repost', async () => {
    repostFindUnique.mockResolvedValue({ id: 'repost-1' });

    await unrepostPost('user-1', 'post-1');

    expect(repostDelete).toHaveBeenCalledWith({
      where: { userId_postId: { userId: 'user-1', postId: 'post-1' } },
    });
  });
});
