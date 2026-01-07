import {
  getCommentById,
  updateComment,
  deleteComment,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/comments/:id - Get a single comment
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const comment = await getCommentById(id, user?.id);

    return NextResponse.json(comment);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/v1/comments/:id - Update a comment
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
    const comment = await updateComment(user.id, id, { content: body.content });

    return NextResponse.json(comment);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/comments/:id - Delete a comment
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

    await deleteComment(user.id, id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
