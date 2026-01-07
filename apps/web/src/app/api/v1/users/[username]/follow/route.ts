import {
  followUser,
  unfollowUser,
  getUserByUsername,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ username: string }>;
}

// POST /api/v1/users/:username/follow - Follow a user
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { username } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const targetUser = await getUserByUsername(username);
    await followUser(user.id, targetUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/users/:username/follow - Unfollow a user
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { username } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const targetUser = await getUserByUsername(username);
    await unfollowUser(user.id, targetUser.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
