import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api-utils';
import { getHarmonizationEngine } from '@/lib/harmonization';
import {
  fetchCoverArtArchiveUrl,
  getCoverArtArchiveUrl,
} from '@scilent-one/harmony-engine';

// GET /api/v1/artwork - Proxy/resolve artwork URL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gtin = searchParams.get('gtin') ?? undefined;
    const isrc = searchParams.get('isrc') ?? undefined;
    const mbid = searchParams.get('mbid') ?? undefined;

    if (mbid) {
      const caa = await fetchCoverArtArchiveUrl(mbid);
      const url = caa ?? getCoverArtArchiveUrl(mbid);
      return NextResponse.json(
        { url },
        {
          headers: {
            'Cache-Control':
              'public, max-age=86400, stale-while-revalidate=604800',
          },
        }
      );
    }

    const engine = await getHarmonizationEngine();

    if (gtin) {
      const result = await engine.lookupByGtin(gtin);
      const release = result.data;
      if (!release) {
        return NextResponse.json({ url: null }, { status: 404 });
      }

      const front =
        release.artwork?.find(
          (a: { type: string; url: string }) => a.type === 'front'
        )?.url ?? release.artwork?.[0]?.url;
      const releaseMbid = release.externalIds?.musicbrainz;
      const url =
        front ??
        (releaseMbid ? await fetchCoverArtArchiveUrl(releaseMbid) : null);

      return NextResponse.json(
        { url },
        {
          headers: {
            'Cache-Control':
              'public, max-age=86400, stale-while-revalidate=604800',
          },
        }
      );
    }

    if (isrc) {
      const result = await engine.lookupByIsrc(isrc);
      const track = result.data;
      if (!track) {
        return NextResponse.json({ url: null }, { status: 404 });
      }

      return NextResponse.json({ url: null });
    }

    return NextResponse.json(
      { error: 'Provide gtin, isrc, or mbid', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
