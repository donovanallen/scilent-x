import { db, Prisma } from '@scilent-one/db';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

// Pagination constants
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

// GET /api/v1/users - Get all users with search, filter, sort, and pagination
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }
    const { searchParams } = new URL(request.url);

    // Pagination
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10),
      MAX_PAGE_SIZE
    );

    // Search
    const query = searchParams.get('q') ?? '';

    // Sort - validate against allowed values
    const allowedSortBy = [
      'createdAt',
      'name',
      'username',
      'followers',
      'posts',
    ] as const;
    const sortByParam = searchParams.get('sortBy');
    const sortBy =
      sortByParam &&
      allowedSortBy.includes(sortByParam as (typeof allowedSortBy)[number])
        ? (sortByParam as (typeof allowedSortBy)[number])
        : 'createdAt';
    const rawSortOrder = searchParams.get('sortOrder');
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';

    // Filters
    const hasUsername = searchParams.get('hasUsername');

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    // Search filter - searches across username, name, and bio
    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filter: only users with username (users who have completed profile setup)
    if (hasUsername === 'true') {
      where.username = { not: null };
    }

    // Build orderBy clause
    const direction: Prisma.SortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    let orderBy: Prisma.UserOrderByWithRelationInput;

    switch (sortBy) {
      case 'name':
        orderBy = { name: direction };
        break;
      case 'username':
        orderBy = { username: direction };
        break;
      case 'followers':
      case 'posts':
        // Avoid inefficient relation-count-based sorting for large datasets.
        // Fallback to createdAt sorting to maintain predictable behavior.
        orderBy = { createdAt: direction };
        break;
      case 'createdAt':
      default:
        orderBy = { createdAt: direction };
        break;
    }

    // Fetch users with counts and follow status
    const users = await db.user.findMany({
      where,
      select: {
        id: true,
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
        followers: currentUser?.id
          ? {
              where: { followerId: currentUser.id },
              take: 1,
            }
          : false,
      },
      orderBy,
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    // Check if there are more results
    const hasMore = users.length > limit;
    const items = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // Transform response (excluding email for privacy)
    const transformedItems = items.map((userItem) => ({
      id: userItem.id,
      name: userItem.name,
      username: userItem.username,
      bio: userItem.bio,
      avatarUrl: userItem.avatarUrl,
      image: userItem.image,
      createdAt: userItem.createdAt,
      followersCount: userItem._count.followers,
      followingCount: userItem._count.following,
      postsCount: userItem._count.posts,
      isFollowing: currentUser?.id
        ? Array.isArray(userItem.followers) && userItem.followers.length > 0
        : false,
    }));

    return NextResponse.json({
      items: transformedItems,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
