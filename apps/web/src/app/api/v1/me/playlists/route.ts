import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { getPlaylistsFromProvider } from '@/lib/harmonization';
import { getFreshAccessToken } from '@/lib/music-provider';

// GET /api/v1/me/playlists?provider=apple_music - Get the current user's
// playlists from a connected music provider's library.
//
// Unlike /api/v1/artists/following (which auto-selects among the connected
// OAuth providers), this endpoint requires an explicit `provider` since not
// every connected provider supports playlists yet.
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
    const providerId = searchParams.get('provider');

    if (!providerId) {
      return NextResponse.json(
        { error: "Query param 'provider' is required", code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const token = await getFreshAccessToken(user.id, providerId);

    if (!token.ok) {
      return NextResponse.json(
        {
          error: `${providerId} access token is unavailable`,
          code: token.code,
          reconnectVia: token.reconnectVia,
        },
        { status: token.code === 'NOT_CONNECTED' ? 400 : 401 }
      );
    }

    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const publicOnly = searchParams.get('publicOnly') === 'true';

    const params: {
      limit?: number;
      cursor?: string;
      publicOnly?: boolean;
    } = {};
    if (limitParam) params.limit = parseInt(limitParam, 10);
    if (cursor) params.cursor = cursor;
    if (publicOnly) params.publicOnly = true;

    const result = await getPlaylistsFromProvider(
      token.accessToken,
      providerId,
      params
    );

    return NextResponse.json({ ...result, provider: providerId });
  } catch (error) {
    return handleApiError(error);
  }
}
