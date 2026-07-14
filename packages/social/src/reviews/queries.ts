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
  authorSelect,
  reviewSubjectSelect,
  mapPostWithAuthor,
  visibilityWhere,
} from '../posts/includes';

export interface GetReviewsParams extends PaginationParams {
  gtin?: string;
  isrc?: string;
  userId?: string;
  authorId?: string;
  trending?: boolean;
}

export async function getReviews(
  params: GetReviewsParams = {},
  currentUserId?: string
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const reviewSubjectFilter =
    params.gtin || params.isrc
      ? {
          reviewSubject: {
            ...(params.gtin ? { gtin: params.gtin } : {}),
            ...(params.isrc ? { isrc: params.isrc } : {}),
          },
        }
      : {};

  const trendingFilter = params.trending
    ? (() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return { createdAt: { gte: sevenDaysAgo } };
      })()
    : {};

  const orderBy = params.trending
    ? [
        { likes: { _count: 'desc' as const } },
        { comments: { _count: 'desc' as const } },
        { createdAt: 'desc' as const },
      ]
    : { createdAt: 'desc' as const };

  const posts = await db.post.findMany({
    where: {
      type: 'REVIEW',
      ...(params.authorId ? { authorId: params.authorId } : {}),
      ...(params.userId ? { authorId: params.userId } : {}),
      ...reviewSubjectFilter,
      ...trendingFilter,
      ...visibilityWhere(currentUserId),
    },
    include: {
      author: { select: authorSelect },
      reviewSubject: { select: reviewSubjectSelect },
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
    orderBy,
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
