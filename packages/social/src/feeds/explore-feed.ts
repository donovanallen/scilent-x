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
import { getPostInclude, mapPostWithAuthor } from '../posts/includes';

/**
 * Get the explore feed - all public posts, sorted by recency
 * Can be enhanced later to include popularity scoring
 */
export async function getExploreFeed(
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const posts = await db.post.findMany({
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
 * Get trending posts - posts with most engagement in recent period
 */
export async function getTrendingPosts(
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  // Get posts from last 7 days, ordered by engagement
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const posts = await db.post.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    include: getPostInclude(currentUserId),
    orderBy: [
      {
        likes: {
          _count: 'desc',
        },
      },
      {
        comments: {
          _count: 'desc',
        },
      },
      { createdAt: 'desc' },
    ],
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
