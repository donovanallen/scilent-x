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
 * Get the home feed for a user - posts from users they follow
 */
export async function getHomeFeed(
  userId: string,
  params: PaginationParams = {}
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  // Get IDs of users the current user follows
  const following = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  // Include user's own posts in their feed
  const authorIds = [...followingIds, userId];

  const posts = await db.post.findMany({
    where: {
      authorId: { in: authorIds },
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
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = posts.map((post) => ({
    ...post,
    isLiked: post.likes.length > 0,
    likes: undefined as unknown as never,
  })) as PostWithAuthor[];

  return createPaginatedResult(items, limit);
}
