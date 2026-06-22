import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createComment, deleteComment, getCommentById, getCommentReplies, getCommentsByPost, updateComment } from '../comments';
import { getExploreFeed, getHomeFeed, getLikedPosts, getProfileFeed, getTrendingPosts } from '../feeds';
import { followUser, getFollowers, getFollowing, isFollowing, unfollowUser } from '../follows';
import { likeComment, likePost, unlikeComment, unlikePost } from '../likes';
import { convertLegacyMentions, createMentions, createMentionsFromUsernames } from '../mentions/parser';
import { deleteMentionsByComment, deleteMentionsByPost } from '../mentions/mutations';
import { createPost, deletePost, getPostById, getPostsByAuthor, updatePost } from '../posts';
import { checkUsernameAvailability, getSuggestedUsers, getUserById, getUserByUsername, searchUsers, updateProfile } from '../users';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';

const db = vi.hoisted(() => ({
  post: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  comment: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  like: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  follow: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  mention: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  activity: {
    create: vi.fn(),
    createMany: vi.fn(),
  },
}));

vi.mock('@scilent-one/db', () => ({ db }));

const baseDate = new Date('2026-01-21T00:00:00.000Z');

const makeAuthor = (overrides = {}) => ({
  id: 'author-1',
  name: 'Alice',
  username: 'alice',
  avatarUrl: null,
  image: null,
  ...overrides,
});

const makePost = (overrides = {}) => ({
  id: 'post-1',
  content: 'Post content',
  contentHtml: null,
  authorId: 'author-1',
  createdAt: baseDate,
  author: makeAuthor(),
  _count: { likes: 0, comments: 0 },
  likes: [],
  comments: [],
  ...overrides,
});

const makeComment = (overrides = {}) => ({
  id: 'comment-1',
  content: 'Comment content',
  contentHtml: null,
  authorId: 'author-1',
  postId: 'post-1',
  parentId: null,
  createdAt: baseDate,
  author: makeAuthor(),
  _count: { likes: 0, replies: 0 },
  likes: [],
  replies: [],
  ...overrides,
});

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'user@example.com',
  name: 'User One',
  username: 'userone',
  bio: null,
  avatarUrl: null,
  image: null,
  createdAt: baseDate,
  _count: { posts: 1, followers: 2, following: 3 },
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('posts queries', () => {
  it('getPostById throws when missing', async () => {
    db.post.findUnique.mockResolvedValue(null);

    await expect(getPostById('post-1')).rejects.toThrow(NotFoundError);
  });

  it('getPostById returns isLiked and strips likes', async () => {
    const post = makePost({ likes: [{ id: 'like-1' }] });
    db.post.findUnique.mockResolvedValue(post);

    const result = await getPostById('post-1', 'user-1');

    expect(result.isLiked).toBe(true);
    expect(result.likes).toBeUndefined();
  });

  it('getPostsByAuthor paginates and maps likes', async () => {
    db.post.findMany.mockResolvedValue([
      makePost({ id: 'post-1', likes: [] }),
      makePost({ id: 'post-2', likes: [{ id: 'like-1' }] }),
    ]);

    const result = await getPostsByAuthor('author-1', { limit: 1 }, 'user-1');

    expect(result.items).toHaveLength(1);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('post-1');
    expect(result.items[0]?.likes).toBeUndefined();
  });
});

describe('posts mutations', () => {
  it('createPost validates content', async () => {
    await expect(createPost('user-1', { content: '   ' })).rejects.toThrow(ValidationError);
  });

  it('createPost rejects overly long content', async () => {
    await expect(createPost('user-1', { content: 'a'.repeat(5001) })).rejects.toThrow(
      ValidationError
    );
  });

  it('createPost creates mentions and activity', async () => {
    db.post.create.mockResolvedValue(makePost({ id: 'post-1', authorId: 'user-1' }));
    db.user.findMany.mockResolvedValue([{ id: 'user-2', username: 'alice' }]);

    const result = await createPost('user-1', {
      content: 'Hello @alice',
      contentHtml: '<p>Hello @alice</p>',
    });

    const createArgs = db.post.create.mock.calls[0]?.[0];
    expect(createArgs?.data?.content).toBe('Hello @alice');
    expect(createArgs?.data?.authorId).toBe('user-1');
    expect(createArgs?.data?.contentHtml).toBeDefined();

    expect(db.mention.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-2', postId: 'post-1', commentId: null }],
    });
    expect(db.activity.createMany).toHaveBeenCalledWith({
      data: [{ type: 'USER_MENTIONED', userId: 'user-2', postId: 'post-1', commentId: null }],
    });
    expect(db.activity.create).toHaveBeenCalledWith({
      data: { type: 'POST_CREATED', userId: 'user-1', postId: 'post-1' },
    });
    expect(result.isLiked).toBe(false);
  });

  it('updatePost throws when missing', async () => {
    db.post.findUnique.mockResolvedValue(null);

    await expect(updatePost('user-1', 'post-1', { content: 'Update' })).rejects.toThrow(
      NotFoundError
    );
  });

  it('updatePost throws when not author', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ authorId: 'someone-else' }));

    await expect(updatePost('user-1', 'post-1', { content: 'Update' })).rejects.toThrow(
      ForbiddenError
    );
  });

  it('updatePost validates content', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ authorId: 'user-1' }));

    await expect(updatePost('user-1', 'post-1', { content: '   ' })).rejects.toThrow(
      ValidationError
    );
  });

  it('updatePost updates post and mentions', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ id: 'post-1', authorId: 'user-1' }));
    db.mention.deleteMany.mockResolvedValue({ count: 1 });
    db.user.findMany.mockResolvedValue([{ id: 'user-2', username: 'alice' }]);
    db.post.update.mockResolvedValue(makePost({ id: 'post-1', likes: [{ id: 'like-1' }] }));

    const result = await updatePost('user-1', 'post-1', {
      content: 'Updated @alice',
      contentHtml: '<p>Updated</p>',
    });

    expect(db.mention.deleteMany).toHaveBeenCalledWith({ where: { postId: 'post-1' } });
    expect(db.mention.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-2', postId: 'post-1', commentId: null }],
    });
    expect(result.isLiked).toBe(true);
    expect(result.likes).toBeUndefined();
  });

  it('deletePost throws when missing', async () => {
    db.post.findUnique.mockResolvedValue(null);

    await expect(deletePost('user-1', 'post-1')).rejects.toThrow(NotFoundError);
  });

  it('deletePost throws when not author', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ authorId: 'someone-else' }));

    await expect(deletePost('user-1', 'post-1')).rejects.toThrow(ForbiddenError);
  });

  it('deletePost removes post', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ authorId: 'user-1' }));

    await deletePost('user-1', 'post-1');

    expect(db.post.delete).toHaveBeenCalledWith({ where: { id: 'post-1' } });
  });
});

describe('comments queries', () => {
  it('getCommentById throws when missing', async () => {
    db.comment.findUnique.mockResolvedValue(null);

    await expect(getCommentById('comment-1')).rejects.toThrow(NotFoundError);
  });

  it('getCommentById returns isLiked and strips likes', async () => {
    const comment = makeComment({ likes: [{ id: 'like-1' }] });
    db.comment.findUnique.mockResolvedValue(comment);

    const result = await getCommentById('comment-1', 'user-1');

    expect(result.isLiked).toBe(true);
    expect(result.likes).toBeUndefined();
  });

  it('getCommentsByPost maps replies and likes', async () => {
    const reply = makeComment({
      id: 'reply-1',
      parentId: 'comment-1',
      likes: [],
      _count: { likes: 0, replies: 0 },
    });
    const comment = makeComment({
      id: 'comment-1',
      likes: [{ id: 'like-1' }],
      replies: [reply],
    });
    db.comment.findMany.mockResolvedValue([comment]);

    const result = await getCommentsByPost('post-1', { limit: 1 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(true);
    expect(result.items[0]?.replies?.[0]?.isLiked).toBe(false);
  });

  it('getCommentReplies maps likes', async () => {
    const reply = makeComment({ id: 'reply-1', likes: [{ id: 'like-1' }] });
    db.comment.findMany.mockResolvedValue([reply]);

    const result = await getCommentReplies('comment-1', { limit: 1 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(true);
  });
});

describe('comments mutations', () => {
  it('createComment validates content', async () => {
    await expect(
      createComment('user-1', { content: '   ', postId: 'post-1' })
    ).rejects.toThrow(ValidationError);
  });

  it('createComment throws when post missing', async () => {
    db.post.findUnique.mockResolvedValue(null);

    await expect(
      createComment('user-1', { content: 'Hello', postId: 'post-1' })
    ).rejects.toThrow(NotFoundError);
  });

  it('createComment throws when parent missing', async () => {
    db.post.findUnique.mockResolvedValue(makePost());
    db.comment.findUnique.mockResolvedValue(null);

    await expect(
      createComment('user-1', { content: 'Reply', postId: 'post-1', parentId: 'parent-1' })
    ).rejects.toThrow(NotFoundError);
  });

  it('createComment rejects parent from different post', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ id: 'post-1' }));
    db.comment.findUnique.mockResolvedValue(makeComment({ id: 'parent-1', postId: 'post-2' }));

    await expect(
      createComment('user-1', { content: 'Reply', postId: 'post-1', parentId: 'parent-1' })
    ).rejects.toThrow(ValidationError);
  });

  it('createComment parses HTML mentions and creates activity', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ authorId: 'post-author' }));
    db.comment.create.mockResolvedValue(makeComment({ id: 'comment-1', authorId: 'commenter' }));

    const contentHtml =
      '<p>Hey <span data-mention-type="USER" data-mention-id="user-2" data-mention-label="bob">@bob</span></p>';

    const result = await createComment('commenter', {
      content: 'Hey @bob',
      contentHtml,
      postId: 'post-1',
    });

    expect(db.mention.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-2', postId: null, commentId: 'comment-1' }],
    });
    expect(db.activity.createMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'USER_MENTIONED',
          userId: 'user-2',
          postId: null,
          commentId: 'comment-1',
        },
      ],
    });
    expect(db.activity.create).toHaveBeenCalledWith({
      data: {
        type: 'COMMENT_CREATED',
        userId: 'post-author',
        actorId: 'commenter',
        postId: 'post-1',
        commentId: 'comment-1',
      },
    });
    expect(result.isLiked).toBe(false);
  });

  it('createComment parses plain mentions without creating post activity', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ authorId: 'user-1' }));
    db.comment.create.mockResolvedValue(makeComment({ id: 'comment-2', authorId: 'user-1' }));
    db.user.findMany.mockResolvedValue([{ id: 'user-2', username: 'alice' }]);

    await createComment('user-1', { content: 'Hi @alice', postId: 'post-1' });

    expect(db.user.findMany).toHaveBeenCalled();
    expect(db.mention.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-2', postId: null, commentId: 'comment-2' }],
    });
    expect(db.activity.create).not.toHaveBeenCalled();
  });

  it('updateComment throws when missing', async () => {
    db.comment.findUnique.mockResolvedValue(null);

    await expect(
      updateComment('user-1', 'comment-1', { content: 'Update' })
    ).rejects.toThrow(NotFoundError);
  });

  it('updateComment throws when not author', async () => {
    db.comment.findUnique.mockResolvedValue(makeComment({ authorId: 'someone-else' }));

    await expect(
      updateComment('user-1', 'comment-1', { content: 'Update' })
    ).rejects.toThrow(ForbiddenError);
  });

  it('updateComment validates content', async () => {
    db.comment.findUnique.mockResolvedValue(makeComment({ authorId: 'user-1' }));

    await expect(
      updateComment('user-1', 'comment-1', { content: '   ' })
    ).rejects.toThrow(ValidationError);
  });

  it('updateComment updates mentions and returns like status', async () => {
    db.comment.findUnique.mockResolvedValue(makeComment({ id: 'comment-1', authorId: 'user-1' }));
    db.comment.update.mockResolvedValue(
      makeComment({ id: 'comment-1', likes: [{ id: 'like-1' }] })
    );

    const contentHtml =
      '<p>Hi <span data-mention-type="USER" data-mention-id="user-2" data-mention-label="bob">@bob</span></p>';

    const result = await updateComment('user-1', 'comment-1', {
      content: 'Hi @bob',
      contentHtml,
    });

    expect(db.mention.deleteMany).toHaveBeenCalledWith({ where: { commentId: 'comment-1' } });
    expect(db.mention.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-2', postId: null, commentId: 'comment-1' }],
    });
    expect(result.isLiked).toBe(true);
    expect(result.likes).toBeUndefined();
  });

  it('deleteComment throws when missing', async () => {
    db.comment.findUnique.mockResolvedValue(null);

    await expect(deleteComment('user-1', 'comment-1')).rejects.toThrow(NotFoundError);
  });

  it('deleteComment throws when not author', async () => {
    db.comment.findUnique.mockResolvedValue(makeComment({ authorId: 'someone-else' }));

    await expect(deleteComment('user-1', 'comment-1')).rejects.toThrow(ForbiddenError);
  });

  it('deleteComment removes comment', async () => {
    db.comment.findUnique.mockResolvedValue(makeComment({ authorId: 'user-1' }));

    await deleteComment('user-1', 'comment-1');

    expect(db.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
  });
});

describe('mentions', () => {
  it('convertLegacyMentions returns empty for no mentions', async () => {
    const result = await convertLegacyMentions([]);

    expect(result).toEqual([]);
    expect(db.user.findMany).not.toHaveBeenCalled();
  });

  it('convertLegacyMentions maps usernames to ids', async () => {
    db.user.findMany.mockResolvedValue([
      { id: 'user-2', username: 'alice' },
      { id: 'user-3', username: null },
    ]);

    const result = await convertLegacyMentions([
      { username: 'Alice', startIndex: 0, endIndex: 6 },
      { username: 'Missing', startIndex: 10, endIndex: 18 },
    ]);

    expect(result).toEqual([
      { type: 'USER', entityId: 'user-2', label: 'Alice', startIndex: 0, endIndex: 6 },
    ]);
  });

  it('createMentions skips empty inputs', async () => {
    await createMentions([], { postId: 'post-1' });

    expect(db.mention.createMany).not.toHaveBeenCalled();
    expect(db.activity.createMany).not.toHaveBeenCalled();
  });

  it('createMentions skips non-user mentions', async () => {
    await createMentions([{ type: 'ARTIST', entityId: 'artist-1', label: 'Artist' }], {
      postId: 'post-1',
    });

    expect(db.mention.createMany).not.toHaveBeenCalled();
    expect(db.activity.createMany).not.toHaveBeenCalled();
  });

  it('createMentions creates mention and activity records', async () => {
    await createMentions([{ type: 'USER', entityId: 'user-2', label: 'Alice' }], {
      postId: 'post-1',
    });

    expect(db.mention.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-2', postId: 'post-1', commentId: null }],
    });
    expect(db.activity.createMany).toHaveBeenCalledWith({
      data: [{ type: 'USER_MENTIONED', userId: 'user-2', postId: 'post-1', commentId: null }],
    });
  });

  it('createMentionsFromUsernames converts mentions', async () => {
    db.user.findMany.mockResolvedValue([{ id: 'user-2', username: 'alice' }]);

    await createMentionsFromUsernames([{ username: 'alice', startIndex: 0, endIndex: 6 }], {
      commentId: 'comment-1',
    });

    expect(db.mention.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-2', postId: null, commentId: 'comment-1' }],
    });
  });

  it('deleteMentionsByPost and deleteMentionsByComment remove mentions', async () => {
    await deleteMentionsByPost('post-1');
    await deleteMentionsByComment('comment-1');

    expect(db.mention.deleteMany).toHaveBeenCalledWith({ where: { postId: 'post-1' } });
    expect(db.mention.deleteMany).toHaveBeenCalledWith({ where: { commentId: 'comment-1' } });
  });
});

describe('likes', () => {
  it('likePost throws when post missing', async () => {
    db.post.findUnique.mockResolvedValue(null);

    await expect(likePost('user-1', 'post-1')).rejects.toThrow(NotFoundError);
  });

  it('likePost throws when already liked', async () => {
    db.post.findUnique.mockResolvedValue(makePost());
    db.like.findUnique.mockResolvedValue({ id: 'like-1' });

    await expect(likePost('user-1', 'post-1')).rejects.toThrow(ConflictError);
  });

  it('likePost creates activity for other users', async () => {
    db.post.findUnique.mockResolvedValue(makePost({ authorId: 'author-1' }));
    db.like.findUnique.mockResolvedValue(null);

    await likePost('user-2', 'post-1');

    expect(db.like.create).toHaveBeenCalledWith({ data: { userId: 'user-2', postId: 'post-1' } });
    expect(db.activity.create).toHaveBeenCalledWith({
      data: { type: 'POST_LIKED', userId: 'author-1', actorId: 'user-2', postId: 'post-1' },
    });
  });

  it('unlikePost throws when like missing', async () => {
    db.like.findUnique.mockResolvedValue(null);

    await expect(unlikePost('user-1', 'post-1')).rejects.toThrow(NotFoundError);
  });

  it('unlikePost deletes like', async () => {
    db.like.findUnique.mockResolvedValue({ id: 'like-1' });

    await unlikePost('user-1', 'post-1');

    expect(db.like.delete).toHaveBeenCalledWith({
      where: { userId_postId: { userId: 'user-1', postId: 'post-1' } },
    });
  });

  it('likeComment throws when comment missing', async () => {
    db.comment.findUnique.mockResolvedValue(null);

    await expect(likeComment('user-1', 'comment-1')).rejects.toThrow(NotFoundError);
  });

  it('likeComment throws when already liked', async () => {
    db.comment.findUnique.mockResolvedValue(makeComment());
    db.like.findUnique.mockResolvedValue({ id: 'like-1' });

    await expect(likeComment('user-1', 'comment-1')).rejects.toThrow(ConflictError);
  });

  it('likeComment skips activity when liking own comment', async () => {
    db.comment.findUnique.mockResolvedValue(makeComment({ authorId: 'user-1' }));
    db.like.findUnique.mockResolvedValue(null);

    await likeComment('user-1', 'comment-1');

    expect(db.like.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', commentId: 'comment-1' },
    });
    expect(db.activity.create).not.toHaveBeenCalled();
  });

  it('unlikeComment throws when like missing', async () => {
    db.like.findUnique.mockResolvedValue(null);

    await expect(unlikeComment('user-1', 'comment-1')).rejects.toThrow(NotFoundError);
  });

  it('unlikeComment deletes like', async () => {
    db.like.findUnique.mockResolvedValue({ id: 'like-1' });

    await unlikeComment('user-1', 'comment-1');

    expect(db.like.delete).toHaveBeenCalledWith({
      where: { userId_commentId: { userId: 'user-1', commentId: 'comment-1' } },
    });
  });
});

describe('follows', () => {
  it('getFollowers maps follow records', async () => {
    const follower = makeUser({
      id: 'user-2',
      username: 'follower',
      followers: [{ followerId: 'current-user' }],
    });
    db.follow.findMany.mockResolvedValue([{ id: 'follow-1', follower }]);

    const result = await getFollowers('user-1', { limit: 1 }, 'current-user');

    expect(result.items[0]?.id).toBe('follow-1');
    expect(result.items[0]?.isFollowing).toBe(true);
    expect(result.items[0]?.followers).toBeUndefined();
  });

  it('getFollowing maps follow records', async () => {
    const following = makeUser({
      id: 'user-3',
      username: 'following',
      followers: [{ followerId: 'current-user' }],
    });
    db.follow.findMany.mockResolvedValue([{ id: 'follow-2', following }]);

    const result = await getFollowing('user-1', { limit: 1 }, 'current-user');

    expect(result.items[0]?.id).toBe('follow-2');
    expect(result.items[0]?.isFollowing).toBe(true);
  });

  it('isFollowing returns true when follow exists', async () => {
    db.follow.findUnique.mockResolvedValue({ id: 'follow-1' });

    await expect(isFollowing('user-1', 'user-2')).resolves.toBe(true);
  });

  it('isFollowing returns false when missing', async () => {
    db.follow.findUnique.mockResolvedValue(null);

    await expect(isFollowing('user-1', 'user-2')).resolves.toBe(false);
  });

  it('followUser rejects self-follow', async () => {
    await expect(followUser('user-1', 'user-1')).rejects.toThrow(ValidationError);
  });

  it('followUser throws when user missing', async () => {
    db.user.findUnique.mockResolvedValue(null);

    await expect(followUser('user-1', 'user-2')).rejects.toThrow(NotFoundError);
  });

  it('followUser throws when already following', async () => {
    db.user.findUnique.mockResolvedValue(makeUser({ id: 'user-2' }));
    db.follow.findUnique.mockResolvedValue({ id: 'follow-1' });

    await expect(followUser('user-1', 'user-2')).rejects.toThrow(ConflictError);
  });

  it('followUser creates follow and activity', async () => {
    db.user.findUnique.mockResolvedValue(makeUser({ id: 'user-2' }));
    db.follow.findUnique.mockResolvedValue(null);

    await followUser('user-1', 'user-2');

    expect(db.follow.create).toHaveBeenCalledWith({
      data: { followerId: 'user-1', followingId: 'user-2' },
    });
    expect(db.activity.create).toHaveBeenCalledWith({
      data: { type: 'USER_FOLLOWED', userId: 'user-2', actorId: 'user-1' },
    });
  });

  it('unfollowUser throws when missing', async () => {
    db.follow.findUnique.mockResolvedValue(null);

    await expect(unfollowUser('user-1', 'user-2')).rejects.toThrow(NotFoundError);
  });

  it('unfollowUser deletes follow', async () => {
    db.follow.findUnique.mockResolvedValue({ id: 'follow-1' });

    await unfollowUser('user-1', 'user-2');

    expect(db.follow.delete).toHaveBeenCalledWith({
      where: { followerId_followingId: { followerId: 'user-1', followingId: 'user-2' } },
    });
  });
});

describe('feeds', () => {
  it('getHomeFeed maps inline comments', async () => {
    db.follow.findMany.mockResolvedValue([{ followingId: 'user-2' }]);
    const comment = makeComment({
      id: 'comment-1',
      likes: [{ id: 'like-1' }],
      _count: { likes: 1, replies: 2 },
    });
    const post = makePost({
      id: 'post-1',
      authorId: 'user-2',
      likes: [{ id: 'like-1' }],
      comments: [comment],
    });
    db.post.findMany.mockResolvedValue([post]);

    const result = await getHomeFeed('user-1', { limit: 1 });

    const feedPost = result.items[0];
    expect(feedPost?.isLiked).toBe(true);
    expect(feedPost?.comments?.[0]?.isLiked).toBe(true);
    expect(feedPost?.comments?.[0]?.likesCount).toBe(1);
    expect(feedPost?.comments?.[0]?.repliesCount).toBe(2);
  });

  it('getExploreFeed maps like status', async () => {
    db.post.findMany.mockResolvedValue([makePost({ id: 'post-1', likes: [] })]);

    const result = await getExploreFeed({ limit: 1 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(false);
  });

  it('getTrendingPosts maps like status', async () => {
    db.post.findMany.mockResolvedValue([makePost({ id: 'post-1', likes: [{ id: 'like-1' }] })]);

    const result = await getTrendingPosts({ limit: 1 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(true);
  });

  it('getProfileFeed maps like status', async () => {
    db.post.findMany.mockResolvedValue([makePost({ id: 'post-1', likes: [] })]);

    const result = await getProfileFeed('user-1', { limit: 1 }, 'user-1');

    expect(result.items[0]?.isLiked).toBe(false);
  });

  it('getLikedPosts maps liked posts', async () => {
    const likedPost = makePost({ id: 'post-1', likes: [{ id: 'like-1' }] });
    db.like.findMany.mockResolvedValue([{ id: 'like-1', post: likedPost }]);

    const result = await getLikedPosts('user-1', { limit: 1 }, 'user-1');

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.isLiked).toBe(true);
  });
});

describe('users', () => {
  it('getUserById throws when missing', async () => {
    db.user.findUnique.mockResolvedValue(null);

    await expect(getUserById('user-1')).rejects.toThrow(NotFoundError);
  });

  it('getUserById includes connected accounts', async () => {
    db.user.findUnique.mockResolvedValue(
      makeUser({
        id: 'user-1',
        followers: [{ followerId: 'current-user' }],
        accounts: [{ providerId: 'spotify', createdAt: baseDate }],
      })
    );

    const result = await getUserById('user-1', 'current-user', {
      includeConnectedAccounts: true,
    });

    expect(result.isFollowing).toBe(true);
    expect(result.connectedPlatforms).toEqual([
      { providerId: 'spotify', connectedAt: baseDate },
    ]);
  });

  it('getUserByUsername returns profile data', async () => {
    db.user.findUnique.mockResolvedValue(makeUser({ id: 'user-2', followers: [] }));

    const result = await getUserByUsername('user-2', 'current-user');

    expect(result.id).toBe('user-2');
    expect(result.isFollowing).toBe(false);
  });

  it('searchUsers maps following status', async () => {
    db.user.findMany.mockResolvedValue([
      makeUser({ id: 'user-2', followers: [{ followerId: 'current-user' }] }),
      makeUser({ id: 'user-3', followers: [] }),
    ]);

    const result = await searchUsers('user', { limit: 2 }, 'current-user');

    expect(result.items[0]?.isFollowing).toBe(true);
    expect(result.items[1]?.isFollowing).toBe(false);
  });

  it('getSuggestedUsers returns non-followed users', async () => {
    db.follow.findMany.mockResolvedValue([{ followingId: 'user-2' }]);
    db.user.findMany.mockResolvedValue([makeUser({ id: 'user-3', username: 'fresh' })]);

    const result = await getSuggestedUsers('user-1', 1);

    expect(result).toHaveLength(1);
    expect(result[0]?.isFollowing).toBe(false);
  });

  it('updateProfile validates username format', async () => {
    await expect(updateProfile('user-1', { username: '1bad' })).rejects.toThrow(ValidationError);
  });

  it('updateProfile rejects reserved usernames', async () => {
    await expect(updateProfile('user-1', { username: 'Admin' })).rejects.toThrow(ValidationError);
  });

  it('updateProfile rejects taken usernames', async () => {
    db.user.findUnique.mockResolvedValue(makeUser({ id: 'other-user' }));

    await expect(updateProfile('user-1', { username: 'taken' })).rejects.toThrow(ConflictError);
  });

  it('updateProfile rejects long bios', async () => {
    await expect(updateProfile('user-1', { bio: 'a'.repeat(501) })).rejects.toThrow(
      ValidationError
    );
  });

  it('updateProfile updates user profile', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.update.mockResolvedValue(makeUser({ username: 'new_user', bio: 'Hello' }));

    const result = await updateProfile('user-1', { username: 'new_user', bio: 'Hello' });

    expect(result.username).toBe('new_user');
    expect(result.bio).toBe('Hello');
  });

  it('checkUsernameAvailability flags invalid usernames', async () => {
    const result = await checkUsernameAvailability('!bad');

    expect(result.available).toBe(false);
    expect(result.reason).toContain('Username must be 3-30 characters');
  });

  it('checkUsernameAvailability flags reserved usernames', async () => {
    const result = await checkUsernameAvailability('Admin');

    expect(result.available).toBe(false);
    expect(result.reason).toBe('This username is reserved');
  });

  it('checkUsernameAvailability flags taken usernames', async () => {
    db.user.findUnique.mockResolvedValue(makeUser({ id: 'other-user' }));

    const result = await checkUsernameAvailability('taken');

    expect(result.available).toBe(false);
    expect(result.reason).toBe('Username is already taken');
  });

  it('checkUsernameAvailability returns available', async () => {
    db.user.findUnique.mockResolvedValue(null);

    const result = await checkUsernameAvailability('available_user');

    expect(result.available).toBe(true);
  });
});
