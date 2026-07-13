import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api-utils';
import { getHarmonizationEngine } from '@/lib/harmonization';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

// GET /api/v1/releases/search - Search releases for review picker
export async function GET(request: Request) {
  try {
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

    const engine = await getHarmonizationEngine();
    const releases = await engine.search(query, undefined, limit);

    return NextResponse.json({ items: releases });
  } catch (error) {
    return handleApiError(error);
  }
}
