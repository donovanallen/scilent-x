import { db } from '@scilent-one/db';
import type {
  PaginationParams,
  PostWithAuthor,
  PaginatedResult,
} from '../types';
import {
  getPaginationParams,
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
} from '../utils/pagination';

import {
  getPostInclude,
  mapPostWithAuthor,
  authorSelect,
  visibilityWhere,
} from '../posts/includes';

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
    where: { authorId: userId, ...visibilityWhere(currentUserId) },
    include: getPostInclude(currentUserId),
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = posts.map((post) =>
    mapPostWithAuthor(post, currentUserId)
  ) as PostWithAuthor[];

  return createPaginatedResult(items, limit);
}

/**
 * Get posts that a user has liked, most recently liked first.
 *
 * Pagination is keyset-based on the underlying `Like` row (since likes, not
 * posts, are what's being paginated - the same post could theoretically be
 * revisited if unliked/reliked, and a user's likes are ordered by like time,
 * not post creation time). The `Like.id` is used as the opaque page cursor,
 * but the returned items always carry the real `Post.id` so downstream
 * consumers (like/unlike, edit, delete, links to `/post/:id`) work correctly.
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
      post: visibilityWhere(currentUserId),
    },
    include: {
      post: {
        include: {
          author: { select: authorSelect },
          _count: {
            select: {
              likes: true,
              comments: true,
              reposts: true,
            },
          },
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                take: 1,
              }
            : false,
          reposts: currentUserId
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

  const hasMore = likes.length > limit;
  const resultLikes = hasMore ? likes.slice(0, limit) : likes;
  const nextCursor = hasMore
    ? (resultLikes[resultLikes.length - 1]?.id ?? null)
    : null;

  const items = resultLikes
    .filter((like) => like.post !== null)
    .map((like) => ({
      ...like.post!,
      isLiked: currentUserId ? like.post!.likes.length > 0 : false,
      isReposted: currentUserId ? like.post!.reposts.length > 0 : false,
      likes: undefined as unknown as never,
      reposts: undefined as unknown as never,
    })) as PostWithAuthor[];

  return { items, nextCursor, hasMore };
}

/**
 * Get posts that a user has reposted, most recently reposted first.
 *
 * Mirrors `getLikedPosts`: pagination is keyset-based on the underlying
 * `Repost` row, but returned items always carry the real `Post.id`.
 */
export async function getUserReposts(
  userId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const reposts = await db.repost.findMany({
    where: { userId, post: visibilityWhere(currentUserId) },
    include: {
      post: {
        include: {
          author: { select: authorSelect },
          _count: {
            select: {
              likes: true,
              comments: true,
              reposts: true,
            },
          },
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                take: 1,
              }
            : false,
          reposts: currentUserId
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

  const hasMore = reposts.length > limit;
  const resultReposts = hasMore ? reposts.slice(0, limit) : reposts;
  const nextCursor = hasMore
    ? (resultReposts[resultReposts.length - 1]?.id ?? null)
    : null;

  const items = resultReposts
    .filter((repost) => repost.post !== null)
    .map((repost) => ({
      ...repost.post,
      isLiked: currentUserId ? repost.post.likes.length > 0 : false,
      isReposted: currentUserId ? repost.post.reposts.length > 0 : false,
      likes: undefined as unknown as never,
      reposts: undefined as unknown as never,
    })) as PostWithAuthor[];

  return { items, nextCursor, hasMore };
}
