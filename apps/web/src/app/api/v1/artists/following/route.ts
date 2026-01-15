import { db } from '@scilent-one/db';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';
import { getFollowedArtistsFromProvider } from '@/lib/harmonization';

// GET /api/v1/artists/following - Get list of followed artists from connected provider
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get connected provider account (currently only Tidal is supported)
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'tidal',
      },
      select: {
        accessToken: true,
        accessTokenExpiresAt: true,
        providerId: true,
      },
    });

    if (!account?.accessToken) {
      return NextResponse.json(
        { error: 'No connected music provider found', code: 'NO_PROVIDER' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const isExpired = account.accessTokenExpiresAt
      ? account.accessTokenExpiresAt.getTime() <= Date.now()
      : false;

    if (isExpired) {
      return NextResponse.json(
        { error: 'Provider access token has expired', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
    }

    const paginationParams = parseSearchParams(request);

    const result = await getFollowedArtistsFromProvider(
      account.accessToken,
      account.providerId,
      paginationParams
    );

    return NextResponse.json({
      ...result,
      provider: account.providerId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
