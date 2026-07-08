import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';
import { getFollowedArtistsFromProvider } from '@/lib/harmonization';
import {
  getConnectedMusicProviderAccount,
  getValidProviderAccessToken,
} from '@/lib/music-provider';

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

    // Resolve the user's connected music provider (any supported provider, not
    // just Tidal).
    const account = await getConnectedMusicProviderAccount(user.id);

    if (!account) {
      return NextResponse.json(
        { error: 'No connected music provider found', code: 'NO_PROVIDER' },
        { status: 400 }
      );
    }

    // Get a valid access token, transparently refreshing an expired one via the
    // stored refresh token. Only surface TOKEN_EXPIRED when refresh genuinely
    // can't recover (no refresh token, or the refresh call failed).
    const token = await getValidProviderAccessToken(account, await headers());

    if (!token.ok) {
      return NextResponse.json(
        {
          error: 'Provider access token has expired',
          code: token.code,
        },
        { status: 401 }
      );
    }

    const paginationParams = parseSearchParams(request);

    const result = await getFollowedArtistsFromProvider(
      token.accessToken,
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
