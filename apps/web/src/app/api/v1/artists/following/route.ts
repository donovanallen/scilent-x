import { getFollowedArtists } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError, parseSearchParams } from '@/lib/api-utils';

// GET /api/v1/artists/following - Get list of followed artists
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const paginationParams = parseSearchParams(request);
    const result = await getFollowedArtists(user.id, paginationParams);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
