import { db } from '@scilent-one/db';
import type { PaginationParams, CommentWithAuthor, PaginatedResult } from '../types';
import { getPaginationParams, createPaginatedResult, DEFAULT_PAGE_SIZE } from '../utils/pagination';
import { NotFoundError } from '../utils/errors';

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
} as const;

export async function getCommentById(
  commentId: string,
  currentUserId?: string
): Promise<CommentWithAuthor> {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
      likes: currentUserId
        ? {
            where: { userId: currentUserId },
            take: 1,
          }
        : false,
    },
  });

  if (!comment) {
    throw new NotFoundError('Comment');
  }

  return {
    ...comment,
    isLiked: currentUserId ? comment.likes.length > 0 : false,
    likes: undefined as unknown as never,
  } as CommentWithAuthor;
}

export async function getCommentsByPost(
  postId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<CommentWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const comments = await db.comment.findMany({
    where: {
      postId,
      parentId: null, // Only top-level comments
    },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
      likes: currentUserId
        ? {
            where: { userId: currentUserId },
            take: 1,
          }
        : false,
      replies: {
        take: 3, // Show first 3 replies
        include: {
          author: { select: authorSelect },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                take: 1,
              }
            : false,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = comments.map((comment) => ({
    ...comment,
    isLiked: currentUserId ? comment.likes.length > 0 : false,
    likes: undefined as unknown as never,
    replies: comment.replies.map((reply) => ({
      ...reply,
      isLiked: currentUserId ? reply.likes.length > 0 : false,
      likes: undefined as unknown as never,
    })),
  })) as CommentWithAuthor[];

  return createPaginatedResult(items, limit);
}

export async function getCommentReplies(
  commentId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<CommentWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const replies = await db.comment.findMany({
    where: { parentId: commentId },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
      likes: currentUserId
        ? {
            where: { userId: currentUserId },
            take: 1,
          }
        : false,
    },
    orderBy: { createdAt: 'asc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = replies.map((reply) => ({
    ...reply,
    isLiked: currentUserId ? reply.likes.length > 0 : false,
    likes: undefined as unknown as never,
  })) as CommentWithAuthor[];

  return createPaginatedResult(items, limit);
}
