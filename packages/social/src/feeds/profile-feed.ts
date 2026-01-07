import { db } from '@scilent-one/db';
import type { PaginationParams, PostWithAuthor, PaginatedResult } from '../types';
import { getPaginationParams, createPaginatedResult, DEFAULT_PAGE_SIZE } from '../utils/pagination';

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
} as const;

/**
 * Get posts for a user's profile page
 */
export async function getProfileFeed(
  userId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const posts = await db.post.findMany({
    where: { authorId: userId },
    include: {
      author: { select: authorSelect },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: currentUserId
        ? {
            where: { userId: currentUserId },
            take: 1,
          }
        : false,
    },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = posts.map((post) => ({
    ...post,
    isLiked: currentUserId ? post.likes.length > 0 : false,
    likes: undefined as unknown as never,
  })) as PostWithAuthor[];

  return createPaginatedResult(items, limit);
}

/**
 * Get posts that a user has liked
 */
export async function getLikedPosts(
  userId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const likes = await db.like.findMany({
    where: {
      userId,
      postId: { not: null },
    },
    include: {
      post: {
        include: {
          author: { select: authorSelect },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                take: 1,
              }
            : false,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = likes
    .filter((like) => like.post !== null)
    .map((like) => ({
      ...like.post!,
      isLiked: currentUserId ? like.post!.likes.length > 0 : false,
      likes: undefined as unknown as never,
    })) as PostWithAuthor[];

  return createPaginatedResult(
    items.map((item, index) => ({ ...item, id: likes[index]!.id })),
    limit
  );
}
