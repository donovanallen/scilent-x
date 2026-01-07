import {
  getCommentsByPost,
  createComment,
  type PaginationParams,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/posts/:id/comments - Get comments for a post
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const paginationParams = parseSearchParams(request) as PaginationParams;

    const result = await getCommentsByPost(id, paginationParams, user?.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/posts/:id/comments - Create a comment on a post
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

    const body = await request.json();
    const comment = await createComment(user.id, {
      content: body.content,
      postId: id,
      parentId: body.parentId,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
