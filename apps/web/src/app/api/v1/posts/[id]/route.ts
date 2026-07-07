import { getPostById, updatePost, deletePost } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/posts/:id - Get a single post
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const paramsPromise = params;
    const userPromise = getCurrentUser();
    const { id } = await paramsPromise;
    const [_user, post] = await Promise.all([
      userPromise,
      userPromise.then((resolvedUser) => getPostById(id, resolvedUser?.id)),
    ]);

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/v1/posts/:id - Update a post
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const paramsPromise = params;
    const userPromise = getCurrentUser();
    const [{ id }, user] = await Promise.all([paramsPromise, userPromise]);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const post = await updatePost(user.id, id, {
      content: body.content,
      contentHtml: body.contentHtml,
    });

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/posts/:id - Delete a post
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const paramsPromise = params;
    const userPromise = getCurrentUser();
    const [{ id }, user] = await Promise.all([paramsPromise, userPromise]);

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
