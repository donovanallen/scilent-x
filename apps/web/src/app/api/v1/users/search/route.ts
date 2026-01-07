import { NextResponse } from 'next/server';
import { searchUsers, type PaginationParams } from '@scilent-one/social';
import { getCurrentUser, handleApiError, parseSearchParams } from '@/lib/api-utils';

// GET /api/v1/users/search - Search users (for @mentions)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const paginationParams = parseSearchParams(request) as PaginationParams;

    if (!query || query.length < 1) {
      return NextResponse.json({ items: [], nextCursor: null, hasMore: false });
    }

    const result = await searchUsers(query, paginationParams, user?.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
