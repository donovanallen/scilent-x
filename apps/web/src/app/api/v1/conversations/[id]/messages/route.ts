import {
  getMessages,
  sendMessage,
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

// GET /api/v1/conversations/:id/messages - Get messages in a conversation, most recent first
export async function GET(request: Request, { params }: RouteParams) {
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

    const paginationParams = parseSearchParams(request) as PaginationParams;
    const result = await getMessages(user.id, id, paginationParams);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/conversations/:id/messages - Send a message in a conversation
export async function POST(request: Request, { params }: RouteParams) {
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
    const message = await sendMessage(user.id, id, {
      content: body.content,
      contentHtml: body.contentHtml,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
