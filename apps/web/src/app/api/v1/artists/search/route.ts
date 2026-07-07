import { db } from '@scilent-one/db';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { searchArtistsWithUserProvider } from '@/lib/harmonization';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

// GET /api/v1/artists/search - Search artists (for #mentions)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const limitParam = searchParams.get('limit');
    const limit = Math.min(
      Math.max(parseInt(limitParam ?? String(DEFAULT_LIMIT), 10), 1),
      MAX_LIMIT
    );

    if (!query || query.length < 1) {
      return NextResponse.json({ items: [] });
    }

    let accessToken: string | null = null;
    let providerId: string | null = null;

    if (user?.id) {
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

      const isExpired = account?.accessTokenExpiresAt
        ? account.accessTokenExpiresAt.getTime() <= Date.now()
        : false;

      if (account?.accessToken && !isExpired) {
        accessToken = account.accessToken;
        providerId = account.providerId;
      }
    }

    const artists = await searchArtistsWithUserProvider(
      query,
      accessToken,
      providerId,
      limit
    );

    const items = artists.map((artist) => {
      const primarySource = artist.sources[0];
      const provider = primarySource?.provider ?? providerId ?? 'musicbrainz';
      const sourceId =
        primarySource?.id ?? artist.externalIds[provider] ?? artist.name;

      return {
        id: `${provider}:${sourceId}`,
        name: artist.name,
        imageUrl: null,
        provider,
        externalIds: artist.externalIds,
        subtitle: artist.disambiguation ?? artist.country ?? null,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
