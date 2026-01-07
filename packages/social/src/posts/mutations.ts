import { db } from '@scilent-one/db';
import type { CreatePostInput, UpdatePostInput, PostWithAuthor } from '../types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import { parseMentions, createMentions } from '../mentions/parser';

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
} as const;

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

  const post = await db.post.create({
    data: {
      content: input.content,
      contentHtml: input.contentHtml ?? null,
      authorId: userId,
    },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  // Parse and create mentions
  const mentions = parseMentions(input.content);
  if (mentions.length > 0) {
    await createMentions(mentions, { postId: post.id });
  }

  // Create activity for followers
  await db.activity.create({
    data: {
      type: 'POST_CREATED',
      userId,
      postId: post.id,
    },
  });

  return {
    ...post,
    isLiked: false,
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

  const post = await db.post.update({
    where: { id: postId },
    data: {
      content: input.content,
      contentHtml: input.contentHtml ?? null,
    },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: {
        where: { userId },
        take: 1,
      },
    },
  });

  // Parse and create new mentions
  const mentions = parseMentions(input.content);
  if (mentions.length > 0) {
    await createMentions(mentions, { postId: post.id });
  }

  return {
    ...post,
    isLiked: post.likes.length > 0,
    likes: undefined as unknown as never,
  } as PostWithAuthor;
}

export async function deletePost(userId: string, postId: string): Promise<void> {
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
