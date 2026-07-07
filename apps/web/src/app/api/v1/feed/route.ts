import { getHomeFeed, type PaginationParams } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';

// GET /api/v1/feed - Get home feed (posts from followed users)
export async function GET(request: Request) {
  try {
    const userPromise = getCurrentUser();
    const params = parseSearchParams(request) as PaginationParams;
    const user = await userPromise;

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const result = await getHomeFeed(user.id, params);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
