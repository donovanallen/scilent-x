import { db } from '@scilent-one/db';
import type { PaginationParams, UserProfile, PaginatedResult } from '../types';
import { getPaginationParams, createPaginatedResult, DEFAULT_PAGE_SIZE } from '../utils/pagination';
import { NotFoundError } from '../utils/errors';

export async function getUserById(
  userId: string,
  currentUserId?: string,
  options?: { includeConnectedAccounts?: boolean }
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
      accounts: options?.includeConnectedAccounts
        ? {
            where: { providerId: { not: 'credential' } },
            select: { providerId: true, createdAt: true },
          }
        : false,
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  const typedUser = user as typeof user & {
    accounts?: { providerId: string; createdAt: Date }[];
  };

  const result: UserProfile & {
    connectedPlatforms?: { providerId: string; connectedAt: Date }[];
  } = {
    id: typedUser.id,
    email: typedUser.email,
    name: typedUser.name,
    username: typedUser.username,
    bio: typedUser.bio,
    avatarUrl: typedUser.avatarUrl,
    image: typedUser.image,
    createdAt: typedUser.createdAt,
    _count: typedUser._count,
    isFollowing: currentUserId
      ? (typedUser.followers as { followerId: string }[]).length > 0
      : false,
  };

  // Add connected platforms if requested
  if (options?.includeConnectedAccounts && typedUser.accounts) {
    result.connectedPlatforms = typedUser.accounts.map((a) => ({
      providerId: a.providerId,
      connectedAt: a.createdAt,
    }));
  }

  return result;
}

export async function getUserByUsername(
  username: string,
  currentUserId?: string,
  options?: { includeConnectedAccounts?: boolean }
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
      accounts: options?.includeConnectedAccounts
        ? {
            where: { providerId: { not: 'credential' } },
            select: { providerId: true, createdAt: true },
          }
        : false,
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  const typedUser = user as typeof user & {
    accounts?: { providerId: string; createdAt: Date }[];
  };

  const result: UserProfile & {
    connectedPlatforms?: { providerId: string; connectedAt: Date }[];
  } = {
    id: typedUser.id,
    email: typedUser.email,
    name: typedUser.name,
    username: typedUser.username,
    bio: typedUser.bio,
    avatarUrl: typedUser.avatarUrl,
    image: typedUser.image,
    createdAt: typedUser.createdAt,
    _count: typedUser._count,
    isFollowing: currentUserId
      ? (typedUser.followers as { followerId: string }[]).length > 0
      : false,
  };

  // Add connected platforms if requested
  if (options?.includeConnectedAccounts && typedUser.accounts) {
    result.connectedPlatforms = typedUser.accounts.map((a) => ({
      providerId: a.providerId,
      connectedAt: a.createdAt,
    }));
  }

  return result;
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
