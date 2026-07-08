import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors';

const postFindUnique = vi.fn();
const commentFindUnique = vi.fn();
const commentCreate = vi.fn();
const commentUpdate = vi.fn();
const commentDelete = vi.fn();
const mentionDeleteMany = vi.fn();
const activityCreate = vi.fn();

const parseMentions = vi.fn();
const parseHtmlMentions = vi.fn();
const createMentionsFromUsernames = vi.fn();
const createMentions = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    post: {
      findUnique: (...args: unknown[]) => postFindUnique(...args),
    },
    comment: {
      findUnique: (...args: unknown[]) => commentFindUnique(...args),
      create: (...args: unknown[]) => commentCreate(...args),
      update: (...args: unknown[]) => commentUpdate(...args),
      delete: (...args: unknown[]) => commentDelete(...args),
    },
    mention: {
      deleteMany: (...args: unknown[]) => mentionDeleteMany(...args),
    },
    activity: {
      create: (...args: unknown[]) => activityCreate(...args),
    },
  },
}));

vi.mock('../../mentions/parser', () => ({
  parseMentions: (...args: unknown[]) => parseMentions(...args),
  parseHtmlMentions: (...args: unknown[]) => parseHtmlMentions(...args),
  createMentionsFromUsernames: (...args: unknown[]) =>
    createMentionsFromUsernames(...args),
  createMentions: (...args: unknown[]) => createMentions(...args),
}));

const { createComment, updateComment, deleteComment } =
  await import('../mutations');

describe('createComment', () => {
  beforeEach(() => {
    postFindUnique.mockReset();
    commentFindUnique.mockReset();
    commentCreate.mockReset();
    mentionDeleteMany.mockReset();
    activityCreate.mockReset();
    parseMentions.mockReset().mockReturnValue([]);
    parseHtmlMentions.mockReset().mockReturnValue([]);
    createMentionsFromUsernames.mockReset();
    createMentions.mockReset();
  });

  it('throws ValidationError when content is empty', async () => {
    await expect(
      createComment('user-1', { content: '   ', postId: 'post-1' })
    ).rejects.toThrow(ValidationError);
    expect(postFindUnique).not.toHaveBeenCalled();
  });

  it('throws ValidationError when content exceeds 2000 characters', async () => {
    await expect(
      createComment('user-1', { content: 'a'.repeat(2001), postId: 'post-1' })
    ).rejects.toThrow(ValidationError);
  });

  it('throws NotFoundError when the post does not exist', async () => {
    postFindUnique.mockResolvedValue(null);

    await expect(
      createComment('user-1', { content: 'hello', postId: 'post-1' })
    ).rejects.toThrow(NotFoundError);
    expect(commentCreate).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when the parent comment does not exist', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    commentFindUnique.mockResolvedValue(null);

    await expect(
      createComment('user-1', {
        content: 'hello',
        postId: 'post-1',
        parentId: 'parent-1',
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError when parent comment belongs to a different post', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    commentFindUnique.mockResolvedValue({
      id: 'parent-1',
      postId: 'other-post',
    });

    await expect(
      createComment('user-1', {
        content: 'hello',
        postId: 'post-1',
        parentId: 'parent-1',
      })
    ).rejects.toThrow(ValidationError);
  });

  it('creates a top-level comment and an activity for the post author', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    commentCreate.mockResolvedValue({
      id: 'comment-1',
      author: { id: 'user-1' },
      _count: { likes: 0, replies: 0 },
    });

    const result = await createComment('user-1', {
      content: 'hello',
      postId: 'post-1',
    });

    expect(commentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: 'hello',
          authorId: 'user-1',
          postId: 'post-1',
          parentId: null,
        }),
      })
    );
    expect(activityCreate).toHaveBeenCalledWith({
      data: {
        type: 'COMMENT_CREATED',
        userId: 'author-1',
        actorId: 'user-1',
        postId: 'post-1',
        commentId: 'comment-1',
      },
    });
    expect(result.isLiked).toBe(false);
  });

  it('does not create an activity when commenting on your own post', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });
    commentCreate.mockResolvedValue({
      id: 'comment-1',
      author: { id: 'user-1' },
      _count: { likes: 0, replies: 0 },
    });

    await createComment('user-1', { content: 'hello', postId: 'post-1' });

    expect(activityCreate).not.toHaveBeenCalled();
  });

  it('creates a valid reply comment', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'author-1' });
    commentFindUnique.mockResolvedValue({ id: 'parent-1', postId: 'post-1' });
    commentCreate.mockResolvedValue({
      id: 'comment-2',
      author: { id: 'user-1' },
      _count: { likes: 0, replies: 0 },
    });

    await createComment('user-1', {
      content: 'a reply',
      postId: 'post-1',
      parentId: 'parent-1',
    });

    expect(commentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ parentId: 'parent-1' }),
      })
    );
  });

  it('creates mentions from contentHtml when provided', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });
    commentCreate.mockResolvedValue({
      id: 'comment-1',
      author: { id: 'user-1' },
      _count: { likes: 0, replies: 0 },
    });
    parseHtmlMentions.mockReturnValue([
      { type: 'USER', entityId: 'u2', label: 'bob' },
    ]);

    await createComment('user-1', {
      content: 'hi @bob',
      contentHtml: '<p>hi <span data-mention>bob</span></p>',
      postId: 'post-1',
    });

    expect(parseHtmlMentions).toHaveBeenCalled();
    expect(createMentions).toHaveBeenCalledWith(
      [{ type: 'USER', entityId: 'u2', label: 'bob' }],
      { commentId: 'comment-1' }
    );
    expect(parseMentions).not.toHaveBeenCalled();
  });

  it('creates mentions from plain text when contentHtml is not provided', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });
    commentCreate.mockResolvedValue({
      id: 'comment-1',
      author: { id: 'user-1' },
      _count: { likes: 0, replies: 0 },
    });
    parseMentions.mockReturnValue([
      { username: 'bob', startIndex: 0, endIndex: 4 },
    ]);

    await createComment('user-1', { content: 'hi @bob', postId: 'post-1' });

    expect(createMentionsFromUsernames).toHaveBeenCalledWith(
      [{ username: 'bob', startIndex: 0, endIndex: 4 }],
      { commentId: 'comment-1' }
    );
  });
});

describe('updateComment', () => {
  beforeEach(() => {
    commentFindUnique.mockReset();
    commentUpdate.mockReset();
    mentionDeleteMany.mockReset();
    parseMentions.mockReset().mockReturnValue([]);
    parseHtmlMentions.mockReset().mockReturnValue([]);
    createMentionsFromUsernames.mockReset();
    createMentions.mockReset();
  });

  it('throws NotFoundError when the comment does not exist', async () => {
    commentFindUnique.mockResolvedValue(null);

    await expect(
      updateComment('user-1', 'comment-1', { content: 'edit' })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when editing another user comment', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'other-user',
    });

    await expect(
      updateComment('user-1', 'comment-1', { content: 'edit' })
    ).rejects.toThrow(ForbiddenError);
  });

  it('throws ValidationError when content is empty', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });

    await expect(
      updateComment('user-1', 'comment-1', { content: '   ' })
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when content exceeds 2000 characters', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });

    await expect(
      updateComment('user-1', 'comment-1', { content: 'a'.repeat(2001) })
    ).rejects.toThrow(ValidationError);
  });

  it('updates the comment, clears old mentions, and reports isLiked', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });
    commentUpdate.mockResolvedValue({
      id: 'comment-1',
      author: { id: 'user-1' },
      _count: { likes: 1, replies: 0 },
      likes: [{ id: 'like-1' }],
    });

    const result = await updateComment('user-1', 'comment-1', {
      content: 'updated',
    });

    expect(mentionDeleteMany).toHaveBeenCalledWith({
      where: { commentId: 'comment-1' },
    });
    expect(result.isLiked).toBe(true);
  });

  it('reports isLiked false when there are no likes', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });
    commentUpdate.mockResolvedValue({
      id: 'comment-1',
      author: { id: 'user-1' },
      _count: { likes: 0, replies: 0 },
      likes: [],
    });

    const result = await updateComment('user-1', 'comment-1', {
      content: 'updated',
    });

    expect(result.isLiked).toBe(false);
  });

  it('recreates mentions from updated contentHtml', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });
    commentUpdate.mockResolvedValue({
      id: 'comment-1',
      author: { id: 'user-1' },
      _count: { likes: 0, replies: 0 },
      likes: [],
    });
    parseHtmlMentions.mockReturnValue([
      { type: 'USER', entityId: 'u2', label: 'bob' },
    ]);

    await updateComment('user-1', 'comment-1', {
      content: 'hi @bob',
      contentHtml: '<p>hi bob</p>',
    });

    expect(createMentions).toHaveBeenCalledWith(
      [{ type: 'USER', entityId: 'u2', label: 'bob' }],
      { commentId: 'comment-1' }
    );
  });
});

describe('deleteComment', () => {
  beforeEach(() => {
    commentFindUnique.mockReset();
    commentDelete.mockReset();
  });

  it('throws NotFoundError when the comment does not exist', async () => {
    commentFindUnique.mockResolvedValue(null);

    await expect(deleteComment('user-1', 'comment-1')).rejects.toThrow(
      NotFoundError
    );
    expect(commentDelete).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when deleting another user comment', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'other-user',
    });

    await expect(deleteComment('user-1', 'comment-1')).rejects.toThrow(
      ForbiddenError
    );
    expect(commentDelete).not.toHaveBeenCalled();
  });

  it('deletes the comment when owned by the user', async () => {
    commentFindUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });

    await deleteComment('user-1', 'comment-1');

    expect(commentDelete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
  });
});
