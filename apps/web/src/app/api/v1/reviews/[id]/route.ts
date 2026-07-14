import { updateReview } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { resolveReviewSubject } from '@/lib/review-subject';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/reviews/[id] - Update a review
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    let subject = body.subject;
    if (body.url || body.gtin || body.isrc) {
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

    const visibility =
      body.visibility === 'PUBLIC' || body.visibility === 'PRIVATE'
        ? body.visibility
        : undefined;

    const review = await updateReview(user.id, id, {
      content: body.content,
      contentHtml: body.contentHtml,
      subject,
      ...(visibility ? { visibility } : {}),
    });

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}
