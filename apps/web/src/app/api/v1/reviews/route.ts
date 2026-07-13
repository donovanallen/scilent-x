import {
  createReview,
  getReviews,
  type PaginationParams,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';
import { resolveReviewSubject } from '@/lib/review-subject';

// GET /api/v1/reviews - List reviews
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const params = parseSearchParams(request) as PaginationParams;

    const gtin = searchParams.get('gtin') ?? undefined;
    const isrc = searchParams.get('isrc') ?? undefined;
    const authorId =
      searchParams.get('userId') ?? searchParams.get('authorId') ?? undefined;
    const trending = searchParams.get('trending') === 'true';

    const result = await getReviews(
      {
        ...params,
        ...(gtin ? { gtin } : {}),
        ...(isrc ? { isrc } : {}),
        ...(authorId ? { authorId } : {}),
        ...(trending ? { trending } : {}),
      },
      user?.id
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/reviews - Create a review
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    let subject = body.subject;
    if (!subject && (body.url || body.gtin || body.isrc)) {
      const resolved = await resolveReviewSubject({
        url: body.url,
        gtin: body.gtin,
        isrc: body.isrc,
        type: body.subjectType,
      });
      subject = {
        type: resolved.type,
        gtin: resolved.gtin,
        isrc: resolved.isrc,
        mbid: resolved.mbid,
        snapshot: resolved.snapshot,
        artworkUrl: resolved.artworkUrl,
      };
    }

    const review = await createReview(user.id, {
      content: body.content,
      contentHtml: body.contentHtml,
      subject,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
