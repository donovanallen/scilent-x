import {
  getExploreFeed,
  getTrendingPosts,
  type PaginationParams,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';

// GET /api/v1/feed/explore - Get explore/discover feed
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const paginationParams = parseSearchParams(request) as PaginationParams;
    const trending = searchParams.get('trending') === 'true';

    const result = trending
      ? await getTrendingPosts(paginationParams, user?.id)
      : await getExploreFeed(paginationParams, user?.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
