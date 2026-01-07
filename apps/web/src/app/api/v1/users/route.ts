import { db, Prisma } from '@scilent-one/db';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

// GET /api/v1/users - Get all users with search, filter, sort, and pagination
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    // Pagination
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

    // Search
    const query = searchParams.get('q') ?? '';

    // Sort
    const sortBy = searchParams.get('sortBy') ?? 'createdAt';
    const sortOrder = searchParams.get('sortOrder') ?? 'desc';

    // Filters
    const hasUsername = searchParams.get('hasUsername');
    const hasAvatar = searchParams.get('hasAvatar');

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    // Search filter
    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filter: only users with username
    if (hasUsername === 'true') {
      where.username = { not: null };
    }

    // Filter: only users with avatar
    if (hasAvatar === 'true') {
      // If we had an OR for search, we need to restructure
      if (query) {
        where.AND = [
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            OR: [{ avatarUrl: { not: null } }, { image: { not: null } }],
          },
        ];
        delete where.OR;
      } else {
        where.OR = [{ avatarUrl: { not: null } }, { image: { not: null } }];
      }
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
        orderBy = { followers: { _count: direction } };
        break;
      case 'posts':
        orderBy = { posts: { _count: direction } };
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

    // Transform response
    const transformedItems = items.map((userItem) => ({
      id: userItem.id,
      email: userItem.email,
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
