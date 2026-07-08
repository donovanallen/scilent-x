import {
  getInboxConversations,
  getOrCreateDirectConversation,
  type PaginationParams,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';

// GET /api/v1/conversations - List the current user's inbox
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const params = parseSearchParams(request) as PaginationParams;
    const result = await getInboxConversations(user.id, params);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/conversations - Start (or fetch) a 1:1 conversation with a mutual follower
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
    const conversation = await getOrCreateDirectConversation(
      user.id,
      body.recipientId
    );

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
