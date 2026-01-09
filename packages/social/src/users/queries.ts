import { db } from '@scilent-one/db';
import type { PaginationParams, UserProfile, PaginatedResult } from '../types';
import { getPaginationParams, createPaginatedResult, DEFAULT_PAGE_SIZE } from '../utils/pagination';
import { NotFoundError } from '../utils/errors';

export async function getUserById(
  userId: string,
  currentUserId?: string
): Promise<UserProfile> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      image: true,
      createdAt: true,
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
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return {
    ...user,
    isFollowing: currentUserId ? user.followers.length > 0 : false,
    followers: undefined as unknown as never,
  } as UserProfile;
}

export async function getUserByUsername(
  username: string,
  currentUserId?: string
): Promise<UserProfile> {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      image: true,
      createdAt: true,
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
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return {
    ...user,
    isFollowing: currentUserId ? user.followers.length > 0 : false,
    followers: undefined as unknown as never,
  } as UserProfile;
}

export async function searchUsers(
  query: string,
  params: PaginationParams = {},
  currentUserId?: string
): Promise<PaginatedResult<UserProfile>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const users = await db.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { id: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      image: true,
      createdAt: true,
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
    orderBy: { username: 'asc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = users.map((user) => ({
    ...user,
    isFollowing: currentUserId ? user.followers.length > 0 : false,
    followers: undefined as unknown as never,
  })) as UserProfile[];

  return createPaginatedResult(items, limit);
}

export async function getSuggestedUsers(
  userId: string,
  limit: number = 5
): Promise<UserProfile[]> {
  // Get users that the current user doesn't follow
  const following = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  const users = await db.user.findMany({
    where: {
      id: {
        notIn: [...followingIds, userId],
      },
      username: { not: null }, // Only users with usernames
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
    orderBy: {
      followers: {
        _count: 'desc',
      },
    },
    take: limit,
  });

  return users.map((user) => ({
    ...user,
    isFollowing: false,
  }));
}
