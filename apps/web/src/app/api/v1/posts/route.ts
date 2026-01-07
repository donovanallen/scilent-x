import {
  createPost,
  getExploreFeed,
  type PaginationParams,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';

// GET /api/v1/posts - List all posts (explore feed)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const params = parseSearchParams(request) as PaginationParams;

    const result = await getExploreFeed(params, user?.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/posts - Create a new post
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
    const post = await createPost(user.id, {
      content: body.content,
      contentHtml: body.contentHtml,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
