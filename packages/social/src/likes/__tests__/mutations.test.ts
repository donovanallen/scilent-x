import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, ConflictError } from '../../utils/errors';

const postFindUnique = vi.fn();
const commentFindUnique = vi.fn();
const likeFindUnique = vi.fn();
const likeCreate = vi.fn();
const likeDelete = vi.fn();
const activityCreate = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    post: {
      findUnique: (...args: unknown[]) => postFindUnique(...args),
    },
    comment: {
      findUnique: (...args: unknown[]) => commentFindUnique(...args),
    },
    like: {
      findUnique: (...args: unknown[]) => likeFindUnique(...args),
      create: (...args: unknown[]) => likeCreate(...args),
      delete: (...args: unknown[]) => likeDelete(...args),
    },
    activity: {
      create: (...args: unknown[]) => activityCreate(...args),
    },
  },
}));

const { likePost, unlikePost, likeComment, unlikeComment } =
  await import('../mutations');

describe('likePost', () => {
  beforeEach(() => {
    postFindUnique.mockReset();
    likeFindUnique.mockReset();
    likeCreate.mockReset();
    activityCreate.mockReset();
  });

  it('throws NotFoundError when the post does not exist', async () => {
    postFindUnique.mockResolvedValue(null);

    await expect(likePost('user-1', 'post-1')).rejects.toThrow(NotFoundError);
    expect(likeCreate).not.toHaveBeenCalled();
  });

  it('throws ConflictError when already liked', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    likeFindUnique.mockResolvedValue({ id: 'like-1' });

    await expect(likePost('user-1', 'post-1')).rejects.toThrow(ConflictError);
    expect(likeCreate).not.toHaveBeenCalled();
  });

  it('creates the like and a POST_LIKED activity for the post author', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    likeFindUnique.mockResolvedValue(null);

    await likePost('user-1', 'post-1');

    expect(likeCreate).toHaveBeenCalledWith({
      data: { userId: 'user-1', postId: 'post-1' },
    });
    expect(activityCreate).toHaveBeenCalledWith({
      data: {
        type: 'POST_LIKED',
        userId: 'author-1',
        actorId: 'user-1',
        postId: 'post-1',
      },
    });
  });

  it('does not create an activity when liking your own post', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });
    likeFindUnique.mockResolvedValue(null);

    await likePost('user-1', 'post-1');

    expect(activityCreate).not.toHaveBeenCalled();
  });
});

describe('unlikePost', () => {
  beforeEach(() => {
    likeFindUnique.mockReset();
    likeDelete.mockReset();
  });

  it('throws NotFoundError when no like exists', async () => {
    likeFindUnique.mockResolvedValue(null);

    await expect(unlikePost('user-1', 'post-1')).rejects.toThrow(NotFoundError);
    expect(likeDelete).not.toHaveBeenCalled();
  });

  it('deletes the existing like', async () => {
    likeFindUnique.mockResolvedValue({ id: 'like-1' });

    await unlikePost('user-1', 'post-1');

    expect(likeDelete).toHaveBeenCalledWith({
      where: { userId_postId: { userId: 'user-1', postId: 'post-1' } },
    });
  });
});

describe('likeComment', () => {
  beforeEach(() => {
    commentFindUnique.mockReset();
    likeFindUnique.mockReset();
    likeCreate.mockReset();
    activityCreate.mockReset();
  });

  it('throws NotFoundError when the comment does not exist', async () => {
    commentFindUnique.mockResolvedValue(null);

    await expect(likeComment('user-1', 'comment-1')).rejects.toThrow(
      NotFoundError
    );
    expect(likeCreate).not.toHaveBeenCalled();
  });

  it('throws ConflictError when already liked', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'author-1',
    });
    likeFindUnique.mockResolvedValue({ id: 'like-1' });

    await expect(likeComment('user-1', 'comment-1')).rejects.toThrow(
      ConflictError
    );
    expect(likeCreate).not.toHaveBeenCalled();
  });

  it('creates the like and a COMMENT_LIKED activity for the comment author', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'author-1',
    });
    likeFindUnique.mockResolvedValue(null);

    await likeComment('user-1', 'comment-1');

    expect(likeCreate).toHaveBeenCalledWith({
      data: { userId: 'user-1', commentId: 'comment-1' },
    });
    expect(activityCreate).toHaveBeenCalledWith({
      data: {
        type: 'COMMENT_LIKED',
        userId: 'author-1',
        actorId: 'user-1',
        commentId: 'comment-1',
      },
    });
  });

  it('does not create an activity when liking your own comment', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });
    likeFindUnique.mockResolvedValue(null);

    await likeComment('user-1', 'comment-1');

    expect(activityCreate).not.toHaveBeenCalled();
  });
});

describe('unlikeComment', () => {
  beforeEach(() => {
    likeFindUnique.mockReset();
    likeDelete.mockReset();
  });

  it('throws NotFoundError when no like exists', async () => {
    likeFindUnique.mockResolvedValue(null);

    await expect(unlikeComment('user-1', 'comment-1')).rejects.toThrow(
      NotFoundError
    );
    expect(likeDelete).not.toHaveBeenCalled();
  });

  it('deletes the existing like', async () => {
    likeFindUnique.mockResolvedValue({ id: 'like-1' });

    await unlikeComment('user-1', 'comment-1');

    expect(likeDelete).toHaveBeenCalledWith({
      where: { userId_commentId: { userId: 'user-1', commentId: 'comment-1' } },
    });
  });
});
