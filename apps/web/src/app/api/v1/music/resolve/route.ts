import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { resolveReviewSubject } from '@/lib/review-subject';

// GET /api/v1/music/resolve - Resolve music metadata for review prefill
export async function GET(request: Request) {
  try {
    await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') ?? undefined;
    const gtin = searchParams.get('gtin') ?? undefined;
    const isrc = searchParams.get('isrc') ?? undefined;
    const type = searchParams.get('type') as 'RELEASE' | 'TRACK' | null;

    if (!url && !gtin && !isrc) {
      return NextResponse.json(
        { error: 'Provide url, gtin, or isrc', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const subject = await resolveReviewSubject({
      ...(url ? { url } : {}),
      ...(gtin ? { gtin } : {}),
      ...(isrc ? { isrc } : {}),
      ...(type ? { type } : {}),
    });

    return NextResponse.json({ subject });
  } catch (error) {
    return handleApiError(error);
  }
}
