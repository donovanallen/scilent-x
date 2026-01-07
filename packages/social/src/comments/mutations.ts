import { db } from '@scilent-one/db';
import type { CreateCommentInput, UpdateCommentInput, CommentWithAuthor } from '../types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import { parseMentions, createMentions } from '../mentions/parser';

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
} as const;

export async function createComment(
  userId: string,
  input: CreateCommentInput
): Promise<CommentWithAuthor> {
  if (!input.content.trim()) {
    throw new ValidationError('Comment content cannot be empty');
  }

  if (input.content.length > 2000) {
    throw new ValidationError('Comment content cannot exceed 2000 characters');
  }

  // Verify post exists
  const post = await db.post.findUnique({
    where: { id: input.postId },
  });

  if (!post) {
    throw new NotFoundError('Post');
  }

  // Verify parent comment exists if provided
  if (input.parentId) {
    const parentComment = await db.comment.findUnique({
      where: { id: input.parentId },
    });

    if (!parentComment) {
      throw new NotFoundError('Parent comment');
    }

    if (parentComment.postId !== input.postId) {
      throw new ValidationError('Parent comment must belong to the same post');
    }
  }

  const comment = await db.comment.create({
    data: {
      content: input.content,
      authorId: userId,
      postId: input.postId,
      parentId: input.parentId ?? null,
    },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
    },
  });

  // Parse and create mentions
  const mentions = parseMentions(input.content);
  if (mentions.length > 0) {
    await createMentions(mentions, { commentId: comment.id });
  }

  // Create activity for post author if different from commenter
  if (post.authorId !== userId) {
    await db.activity.create({
      data: {
        type: 'COMMENT_CREATED',
        userId: post.authorId,
        actorId: userId,
        postId: input.postId,
        commentId: comment.id,
      },
    });
  }

  return {
    ...comment,
    isLiked: false,
  } as CommentWithAuthor;
}

export async function updateComment(
  userId: string,
  commentId: string,
  input: UpdateCommentInput
): Promise<CommentWithAuthor> {
  const existingComment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new NotFoundError('Comment');
  }

  if (existingComment.authorId !== userId) {
    throw new ForbiddenError('You can only edit your own comments');
  }

  if (!input.content.trim()) {
    throw new ValidationError('Comment content cannot be empty');
  }

  if (input.content.length > 2000) {
    throw new ValidationError('Comment content cannot exceed 2000 characters');
  }

  // Delete existing mentions
  await db.mention.deleteMany({
    where: { commentId },
  });

  const comment = await db.comment.update({
    where: { id: commentId },
    data: { content: input.content },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          replies: true,
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
    await createMentions(mentions, { commentId: comment.id });
  }

  return {
    ...comment,
    isLiked: comment.likes.length > 0,
    likes: undefined as unknown as never,
  } as CommentWithAuthor;
}

export async function deleteComment(userId: string, commentId: string): Promise<void> {
  const existingComment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new NotFoundError('Comment');
  }

  if (existingComment.authorId !== userId) {
    throw new ForbiddenError('You can only delete your own comments');
  }

  await db.comment.delete({
    where: { id: commentId },
  });
}
