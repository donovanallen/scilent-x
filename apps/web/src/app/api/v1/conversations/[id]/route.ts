import { getConversationSummary } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/conversations/:id - Get conversation metadata (other participant, last message, unread count)
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

    const conversation = await getConversationSummary(user.id, id);

    return NextResponse.json(conversation);
  } catch (error) {
    return handleApiError(error);
  }
}
