import { setReviewVisibility } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/reviews/[id]/visibility - Toggle a review's visibility
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

    if (body.visibility !== 'PUBLIC' && body.visibility !== 'PRIVATE') {
      return NextResponse.json(
        {
          error: 'visibility must be "PUBLIC" or "PRIVATE"',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const review = await setReviewVisibility(user.id, id, body.visibility);

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}
