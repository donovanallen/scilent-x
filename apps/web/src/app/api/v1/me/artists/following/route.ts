import type { HarmonizedArtist } from '@scilent-one/harmony-engine';
import { NextResponse } from 'next/server';

import { aggregateFollowedArtists } from '@/lib/aggregate-followed-artists';
import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';
import { getFollowedArtistsFromProvider } from '@/lib/harmonization';
import {
  getConnectedLibraryProviderIds,
  getFreshAccessToken,
  LIBRARY_ARTIST_PROVIDER_IDS,
  type LibraryArtistProviderId,
} from '@/lib/music-provider';

const ALL_PROVIDERS_VALUE = 'all';

type ProviderCursors = Partial<Record<LibraryArtistProviderId, string | null>>;

interface SingleProviderResponse {
  mode: 'single';
  items: HarmonizedArtist[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
  provider: string;
}

interface AggregateProviderResponse {
  mode: 'aggregate';
  items: HarmonizedArtist[];
  providerCursors: ProviderCursors;
  hasMore: boolean;
  total?: number;
}

function parseProviderCursors(raw: string | null): ProviderCursors {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }
    return parsed as ProviderCursors;
  } catch {
    return {};
  }
}

function isLibraryProvider(
  providerId: string
): providerId is LibraryArtistProviderId {
  return (LIBRARY_ARTIST_PROVIDER_IDS as readonly string[]).includes(
    providerId
  );
}

async function fetchProviderPage(
  userId: string,
  providerId: LibraryArtistProviderId,
  cursor: string | undefined,
  limit: number
) {
  const token = await getFreshAccessToken(userId, providerId);

  if (!token.ok) {
    return {
      providerId,
      tokenError: token,
      items: [] as HarmonizedArtist[],
      nextCursor: null as string | null,
      hasMore: false,
      total: undefined as number | undefined,
    };
  }

  const params: { limit: number; cursor?: string } = { limit };
  if (cursor) {
    params.cursor = cursor;
  }

  const result = await getFollowedArtistsFromProvider(
    token.accessToken,
    providerId,
    params
  );

  return {
    providerId,
    tokenError: null,
    items: result.items,
    nextCursor: result.nextCursor ?? null,
    hasMore: result.hasMore,
    total: result.total,
  };
}

// GET /api/v1/me/artists/following - Followed/library artists for the current user.
//
// Single-provider: ?provider=spotify&cursor=&limit=
// Aggregate: omit provider or ?provider=all&providerCursors={...}&limit=
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
    const limit = paginationParams.limit ?? 50;

    const providerId =
      providerParam && providerParam !== ALL_PROVIDERS_VALUE
        ? providerParam
        : null;

    if (providerId) {
      if (!isLibraryProvider(providerId)) {
        return NextResponse.json(
          {
            error: `Unsupported provider '${providerId}'`,
            code: 'BAD_REQUEST',
          },
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

      const params: { limit: number; cursor?: string } = { limit };
      if (paginationParams.cursor) {
        params.cursor = paginationParams.cursor;
      }

      const result = await getFollowedArtistsFromProvider(
        token.accessToken,
        providerId,
        params
      );

      const response: SingleProviderResponse = {
        mode: 'single',
        items: result.items,
        nextCursor: result.nextCursor ?? null,
        hasMore: result.hasMore,
        provider: providerId,
      };

      if (result.total !== undefined) {
        response.total = result.total;
      }

      return NextResponse.json(response);
    }

    const connectedProviders = await getConnectedLibraryProviderIds(user.id);

    if (connectedProviders.length === 0) {
      return NextResponse.json(
        { error: 'No connected music providers found', code: 'NO_PROVIDER' },
        { status: 400 }
      );
    }

    const providerCursors = parseProviderCursors(
      searchParams.get('providerCursors')
    );

    const fetchResults = await Promise.all(
      connectedProviders.map((provider) => {
        const cursor = providerCursors[provider];
        if (cursor === null) {
          return Promise.resolve({
            providerId: provider,
            tokenError: null,
            items: [] as HarmonizedArtist[],
            nextCursor: null as string | null,
            hasMore: false,
            total: undefined as number | undefined,
          });
        }

        return fetchProviderPage(user.id, provider, cursor ?? undefined, limit);
      })
    );

    const tokenErrors = fetchResults
      .filter((result) => result.tokenError !== null)
      .map((result) => ({
        provider: result.providerId,
        code: result.tokenError!.code,
        reconnectVia: result.tokenError!.reconnectVia,
      }));

    const allItems = fetchResults.flatMap((result) => result.items);
    const mergedItems = aggregateFollowedArtists(allItems);

    const nextProviderCursors: ProviderCursors = {};
    let hasMore = false;
    let totalSum = 0;
    let hasTotal = false;

    for (const result of fetchResults) {
      nextProviderCursors[result.providerId] = result.hasMore
        ? result.nextCursor
        : null;
      if (result.hasMore) {
        hasMore = true;
      }
      if (result.total !== undefined) {
        totalSum += result.total;
        hasTotal = true;
      }
    }

    const response: AggregateProviderResponse = {
      mode: 'aggregate',
      items: mergedItems,
      providerCursors: nextProviderCursors,
      hasMore,
    };

    if (hasTotal) {
      response.total = totalSum;
    }

    return NextResponse.json({
      ...response,
      ...(tokenErrors.length > 0 ? { tokenErrors } : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
