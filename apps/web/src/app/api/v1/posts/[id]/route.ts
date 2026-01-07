import { getPostById, updatePost, deletePost } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/posts/:id - Get a single post
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const post = await getPostById(id, user?.id);

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/v1/posts/:id - Update a post
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const post = await updatePost(user.id, id, { content: body.content });

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/posts/:id - Delete a post
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

    await deletePost(user.id, id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
