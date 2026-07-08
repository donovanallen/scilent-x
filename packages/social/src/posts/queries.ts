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
import { NotFoundError } from '../utils/errors';

import {
  authorSelect,
  reviewSubjectSelect,
  mapPostWithAuthor,
} from './includes';

export async function getPostById(
  postId: string,
  currentUserId?: string
): Promise<PostWithAuthor> {
  const post = await db.post.findUnique({
    where: { id: postId },
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
  });

  if (!post) {
    throw new NotFoundError('Post');
  }

  return mapPostWithAuthor(post, currentUserId) as PostWithAuthor;
}

export async function getPostsByAuthor(
  authorId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<PostWithAuthor>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const posts = await db.post.findMany({
    where: { authorId },
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
