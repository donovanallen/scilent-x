import { getArtistImageUrl } from '@scilent-one/harmony-engine';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { searchArtistsWithUserProvider } from '@/lib/harmonization';
import {
  getConnectedMusicProviderAccount,
  getValidProviderAccessToken,
} from '@/lib/music-provider';

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

    // Resolve the user's connected music provider (any supported provider, not
    // just Tidal). If the token is expired we transparently refresh it; if that
    // fails we simply fall back to the anonymous musicbrainz search below,
    // preserving the "search always works" behavior.
    if (user?.id) {
      const account = await getConnectedMusicProviderAccount(user.id);

      if (account) {
        const token = await getValidProviderAccessToken(
          account,
          await headers()
        );

        if (token.ok) {
          accessToken = token.accessToken;
          providerId = account.providerId;
        }
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
        imageUrl: getArtistImageUrl(artist.images) ?? null,
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
