import { NextResponse } from 'next/server';
import { getUserById, updateProfile } from '@scilent-one/social';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';

// GET /api/v1/users/me - Get current user profile
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const profile = await getUserById(user.id);

    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/v1/users/me - Update current user profile
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const profile = await updateProfile(user.id, {
      username: body.username,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      name: body.name,
    });

    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
