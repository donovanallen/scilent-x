import { markConversationRead } from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/conversations/:id/read - Mark a conversation as read up to now
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

    await markConversationRead(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
