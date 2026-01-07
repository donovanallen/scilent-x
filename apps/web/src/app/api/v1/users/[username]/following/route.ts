import { NextResponse } from 'next/server';
import { getFollowing, getUserByUsername, type PaginationParams } from '@scilent-one/social';
import { getCurrentUser, handleApiError, parseSearchParams } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ username: string }>;
}

// GET /api/v1/users/:username/following - Get users that a user follows
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { username } = await params;
    const user = await getCurrentUser();
    const paginationParams = parseSearchParams(request) as PaginationParams;

    const targetUser = await getUserByUsername(username);
    const result = await getFollowing(targetUser.id, paginationParams, user?.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
