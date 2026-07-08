import { db } from '@scilent-one/db';
import type {
  CreatePostInput,
  UpdatePostInput,
  PostWithAuthor,
} from '../types';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors';
import { sanitizeHtml } from '../utils/sanitize';
import {
  parseMentions,
  parseHtmlMentions,
  createMentions,
  createMentionsFromUsernames,
} from '../mentions/parser';

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
} as const;

/**
 * Parse and persist mentions for a post. Prefers the HTML-based parser (which
 * reads Tiptap's `data-mention-*` spans directly and supports both USER and
 * ARTIST mentions) when `contentHtml` is available, falling back to the
 * legacy plain-text `@username` parser otherwise. This mirrors the comment
 * mutations so posts and comments behave consistently.
 */
async function createPostMentions(
  content: string,
  contentHtml: string | null | undefined,
  context: { postId: string }
): Promise<void> {
  if (contentHtml) {
    const mentions = parseHtmlMentions(contentHtml);
    if (mentions.length > 0) {
      await createMentions(mentions, context);
    }
    return;
  }

  const mentions = parseMentions(content);
  if (mentions.length > 0) {
    await createMentionsFromUsernames(mentions, context);
  }
}

export async function createPost(
  userId: string,
  input: CreatePostInput
): Promise<PostWithAuthor> {
  if (!input.content.trim()) {
    throw new ValidationError('Post content cannot be empty');
  }

  if (input.content.length > 5000) {
    throw new ValidationError('Post content cannot exceed 5000 characters');
  }

  // Sanitize HTML content to prevent XSS and other attacks
  const sanitizedHtml = sanitizeHtml(input.contentHtml);

  const post = await db.post.create({
    data: {
      content: input.content,
      contentHtml: sanitizedHtml,
      authorId: userId,
    },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          comments: true,
          reposts: true,
        },
      },
    },
  });

  await createPostMentions(input.content, sanitizedHtml, { postId: post.id });

  // Notify followers that the author published a new post
  const followers = await db.follow.findMany({
    where: { followingId: userId },
    select: { followerId: true },
  });

  if (followers.length > 0) {
    await db.activity.createMany({
      data: followers.map((follower) => ({
        type: 'POST_CREATED' as const,
        userId: follower.followerId,
        actorId: userId,
        postId: post.id,
      })),
    });
  }

  return {
    ...post,
    isLiked: false,
    isReposted: false,
  };
}

export async function updatePost(
  userId: string,
  postId: string,
  input: UpdatePostInput
): Promise<PostWithAuthor> {
  const existingPost = await db.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new NotFoundError('Post');
  }

  if (existingPost.authorId !== userId) {
    throw new ForbiddenError('You can only edit your own posts');
  }

  if (!input.content.trim()) {
    throw new ValidationError('Post content cannot be empty');
  }

  if (input.content.length > 5000) {
    throw new ValidationError('Post content cannot exceed 5000 characters');
  }

  // Delete existing mentions
  await db.mention.deleteMany({
    where: { postId },
  });

  // Sanitize HTML content to prevent XSS and other attacks
  const sanitizedHtml = sanitizeHtml(input.contentHtml);

  const post = await db.post.update({
    where: { id: postId },
    data: {
      content: input.content,
      contentHtml: sanitizedHtml,
    },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          comments: true,
          reposts: true,
        },
      },
      likes: {
        where: { userId },
        take: 1,
      },
      reposts: {
        where: { userId },
        take: 1,
      },
    },
  });

  await createPostMentions(input.content, sanitizedHtml, { postId: post.id });

  return {
    ...post,
    isLiked: post.likes.length > 0,
    isReposted: post.reposts.length > 0,
    likes: undefined as unknown as never,
    reposts: undefined as unknown as never,
  } as PostWithAuthor;
}

export async function deletePost(
  userId: string,
  postId: string
): Promise<void> {
  const existingPost = await db.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new NotFoundError('Post');
  }

  if (existingPost.authorId !== userId) {
    throw new ForbiddenError('You can only delete your own posts');
  }

  await db.post.delete({
    where: { id: postId },
  });
}
