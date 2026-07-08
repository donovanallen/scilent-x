import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors';

const postCreate = vi.fn();
const postUpdate = vi.fn();
const postDelete = vi.fn();
const postFindUnique = vi.fn();
const followFindMany = vi.fn();
const activityCreateMany = vi.fn();
const mentionDeleteMany = vi.fn();

const sanitizeHtml = vi.fn();
const parseMentions = vi.fn();
const parseHtmlMentions = vi.fn();
const createMentions = vi.fn();
const createMentionsFromUsernames = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    post: {
      create: (...args: unknown[]) => postCreate(...args),
      update: (...args: unknown[]) => postUpdate(...args),
      delete: (...args: unknown[]) => postDelete(...args),
      findUnique: (...args: unknown[]) => postFindUnique(...args),
    },
    follow: {
      findMany: (...args: unknown[]) => followFindMany(...args),
    },
    activity: {
      createMany: (...args: unknown[]) => activityCreateMany(...args),
    },
    mention: {
      deleteMany: (...args: unknown[]) => mentionDeleteMany(...args),
    },
  },
}));

vi.mock('../../utils/sanitize', () => ({
  sanitizeHtml: (...args: unknown[]) => sanitizeHtml(...args),
}));

vi.mock('../../mentions/parser', () => ({
  parseMentions: (...args: unknown[]) => parseMentions(...args),
  parseHtmlMentions: (...args: unknown[]) => parseHtmlMentions(...args),
  createMentions: (...args: unknown[]) => createMentions(...args),
  createMentionsFromUsernames: (...args: unknown[]) =>
    createMentionsFromUsernames(...args),
}));

const { createPost, updatePost, deletePost } = await import('../mutations');

describe('createPost', () => {
  beforeEach(() => {
    postCreate.mockReset();
    followFindMany.mockReset().mockResolvedValue([]);
    activityCreateMany.mockReset();
    sanitizeHtml.mockReset().mockReturnValue(null);
    parseMentions.mockReset().mockReturnValue([]);
    parseHtmlMentions.mockReset().mockReturnValue([]);
    createMentions.mockReset();
    createMentionsFromUsernames.mockReset();
  });

  it('throws ValidationError when content is empty', async () => {
    await expect(createPost('user-1', { content: '   ' })).rejects.toThrow(
      ValidationError
    );
    expect(postCreate).not.toHaveBeenCalled();
  });

  it('throws ValidationError when content exceeds 5000 characters', async () => {
    await expect(
      createPost('user-1', { content: 'a'.repeat(5001) })
    ).rejects.toThrow(ValidationError);
  });

  it('creates a post with sanitized HTML content', async () => {
    sanitizeHtml.mockReturnValue('<p>clean</p>');
    postCreate.mockResolvedValue({
      id: 'post-1',
      author: { id: 'user-1' },
      _count: { likes: 0, comments: 0, reposts: 0 },
    });

    const result = await createPost('user-1', {
      content: 'hello',
      contentHtml: '<script>bad</script><p>clean</p>',
    });

    expect(sanitizeHtml).toHaveBeenCalledWith(
      '<script>bad</script><p>clean</p>'
    );
    expect(postCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: 'hello',
          contentHtml: '<p>clean</p>',
          authorId: 'user-1',
        }),
      })
    );
    expect(result.isLiked).toBe(false);
    expect(result.isReposted).toBe(false);
  });

  it('notifies followers with a POST_CREATED activity for each', async () => {
    postCreate.mockResolvedValue({
      id: 'post-1',
      author: { id: 'user-1' },
      _count: { likes: 0, comments: 0, reposts: 0 },
    });
    followFindMany.mockResolvedValue([
      { followerId: 'f1' },
      { followerId: 'f2' },
    ]);

    await createPost('user-1', { content: 'hello' });

    expect(activityCreateMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'POST_CREATED',
          userId: 'f1',
          actorId: 'user-1',
          postId: 'post-1',
        },
        {
          type: 'POST_CREATED',
          userId: 'f2',
          actorId: 'user-1',
          postId: 'post-1',
        },
      ],
    });
  });

  it('does not call activity.createMany when there are no followers', async () => {
    postCreate.mockResolvedValue({
      id: 'post-1',
      author: { id: 'user-1' },
      _count: { likes: 0, comments: 0, reposts: 0 },
    });
    followFindMany.mockResolvedValue([]);

    await createPost('user-1', { content: 'hello' });

    expect(activityCreateMany).not.toHaveBeenCalled();
  });

  it('creates mentions from sanitized HTML when present', async () => {
    sanitizeHtml.mockReturnValue('<p>hi @bob</p>');
    parseHtmlMentions.mockReturnValue([
      { type: 'USER', entityId: 'u2', label: 'bob' },
    ]);
    postCreate.mockResolvedValue({
      id: 'post-1',
      author: { id: 'user-1' },
      _count: { likes: 0, comments: 0, reposts: 0 },
    });

    await createPost('user-1', {
      content: 'hi @bob',
      contentHtml: '<p>hi @bob</p>',
    });

    expect(createMentions).toHaveBeenCalledWith(
      [{ type: 'USER', entityId: 'u2', label: 'bob' }],
      { postId: 'post-1' }
    );
  });

  it('falls back to plain-text mention parsing without contentHtml', async () => {
    parseMentions.mockReturnValue([
      { username: 'bob', startIndex: 0, endIndex: 4 },
    ]);
    postCreate.mockResolvedValue({
      id: 'post-1',
      author: { id: 'user-1' },
      _count: { likes: 0, comments: 0, reposts: 0 },
    });

    await createPost('user-1', { content: 'hi @bob' });

    expect(createMentionsFromUsernames).toHaveBeenCalledWith(
      [{ username: 'bob', startIndex: 0, endIndex: 4 }],
      { postId: 'post-1' }
    );
  });
});

describe('updatePost', () => {
  beforeEach(() => {
    postFindUnique.mockReset();
    postUpdate.mockReset();
    mentionDeleteMany.mockReset();
    sanitizeHtml.mockReset().mockReturnValue(null);
    parseMentions.mockReset().mockReturnValue([]);
    parseHtmlMentions.mockReset().mockReturnValue([]);
    createMentions.mockReset();
    createMentionsFromUsernames.mockReset();
  });

  it('throws NotFoundError when the post does not exist', async () => {
    postFindUnique.mockResolvedValue(null);

    await expect(
      updatePost('user-1', 'post-1', { content: 'edit' })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when editing another user post', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'other-user' });

    await expect(
      updatePost('user-1', 'post-1', { content: 'edit' })
    ).rejects.toThrow(ForbiddenError);
  });

  it('throws ValidationError when content is empty', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });

    await expect(
      updatePost('user-1', 'post-1', { content: '   ' })
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when content exceeds 5000 characters', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });

    await expect(
      updatePost('user-1', 'post-1', { content: 'a'.repeat(5001) })
    ).rejects.toThrow(ValidationError);
  });

  it('updates the post, clears old mentions, and reports like/repost state', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });
    postUpdate.mockResolvedValue({
      id: 'post-1',
      author: { id: 'user-1' },
      _count: { likes: 1, comments: 0, reposts: 1 },
      likes: [{ id: 'like-1' }],
      reposts: [{ id: 'repost-1' }],
    });

    const result = await updatePost('user-1', 'post-1', { content: 'updated' });

    expect(mentionDeleteMany).toHaveBeenCalledWith({
      where: { postId: 'post-1' },
    });
    expect(result.isLiked).toBe(true);
    expect(result.isReposted).toBe(true);
  });

  it('reports false like/repost state when absent', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });
    postUpdate.mockResolvedValue({
      id: 'post-1',
      author: { id: 'user-1' },
      _count: { likes: 0, comments: 0, reposts: 0 },
      likes: [],
      reposts: [],
    });

    const result = await updatePost('user-1', 'post-1', { content: 'updated' });

    expect(result.isLiked).toBe(false);
    expect(result.isReposted).toBe(false);
  });
});

describe('deletePost', () => {
  beforeEach(() => {
    postFindUnique.mockReset();
    postDelete.mockReset();
  });

  it('throws NotFoundError when the post does not exist', async () => {
    postFindUnique.mockResolvedValue(null);

    await expect(deletePost('user-1', 'post-1')).rejects.toThrow(NotFoundError);
    expect(postDelete).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when deleting another user post', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'other-user' });

    await expect(deletePost('user-1', 'post-1')).rejects.toThrow(
      ForbiddenError
    );
    expect(postDelete).not.toHaveBeenCalled();
  });

  it('deletes the post when owned by the user', async () => {
    postFindUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });

    await deletePost('user-1', 'post-1');

    expect(postDelete).toHaveBeenCalledWith({ where: { id: 'post-1' } });
  });
});
