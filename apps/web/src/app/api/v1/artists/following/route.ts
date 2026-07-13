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
  getFreshAccessToken,
  getValidProviderAccessToken,
} from '@/lib/music-provider';

// GET /api/v1/artists/following - Get list of followed artists from a connected provider.
//
// Prefer /api/v1/me/artists/following for new callers (supports aggregate mode).
// Optional `provider` selects a specific account; when omitted, auto-selects the
// most recently updated OAuth provider (backward compatible).
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const providerParam = searchParams.get('provider');
    const paginationParams = parseSearchParams(request);

    if (providerParam) {
      const token = await getFreshAccessToken(user.id, providerParam);

      if (!token.ok) {
        return NextResponse.json(
          {
            error: `${providerParam} access token is unavailable`,
            code: token.code,
            reconnectVia: token.reconnectVia,
          },
          { status: token.code === 'NOT_CONNECTED' ? 400 : 401 }
        );
      }

      const params: { limit?: number; cursor?: string } = {};
      if (paginationParams.limit) params.limit = paginationParams.limit;
      if (paginationParams.cursor) params.cursor = paginationParams.cursor;

      const result = await getFollowedArtistsFromProvider(
        token.accessToken,
        providerParam,
        params
      );

      return NextResponse.json({
        ...result,
        provider: providerParam,
      });
    }

    const account = await getConnectedMusicProviderAccount(user.id);

    if (!account) {
      return NextResponse.json(
        { error: 'No connected music provider found', code: 'NO_PROVIDER' },
        { status: 400 }
      );
    }

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
