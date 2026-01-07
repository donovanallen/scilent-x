import { NextResponse } from 'next/server';
import { likePost, unlikePost } from '@scilent-one/social';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/v1/posts/:id/like - Like a post
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    await likePost(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/posts/:id/like - Unlike a post
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    await unlikePost(user.id, id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
