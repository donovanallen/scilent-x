import { db } from '@scilent-one/db';
import type { PaginationParams, PaginatedResult, UserProfile } from '../types';
import { getPaginationParams, createPaginatedResult, DEFAULT_PAGE_SIZE } from '../utils/pagination';
import { NotFoundError } from '../utils/errors';

const userSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
  bio: true,
  email: true,
  createdAt: true,
} as const;

export async function getFollowers(
  userId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<UserProfile>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const follows = await db.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          ...userSelect,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
          followers: currentUserId
            ? {
                where: { followerId: currentUserId },
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

  const items = follows.map((follow) => ({
    ...follow.follower,
    isFollowing: currentUserId ? follow.follower.followers.length > 0 : false,
    followers: undefined as unknown as never,
  })) as UserProfile[];

  return createPaginatedResult(
    items.map((item, index) => ({ ...item, id: follows[index]!.id })),
    limit
  );
}

export async function getFollowing(
  userId: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<UserProfile>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const follows = await db.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          ...userSelect,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
          followers: currentUserId
            ? {
                where: { followerId: currentUserId },
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

  const items = follows.map((follow) => ({
    ...follow.following,
    isFollowing: currentUserId ? follow.following.followers.length > 0 : false,
    followers: undefined as unknown as never,
  })) as UserProfile[];

  return createPaginatedResult(
    items.map((item, index) => ({ ...item, id: follows[index]!.id })),
    limit
  );
}

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const follow = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  return !!follow;
}
