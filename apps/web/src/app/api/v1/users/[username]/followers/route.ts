import {
  getFollowers,
  getUserByUsername,
  type PaginationParams,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import {
  getCurrentUser,
  handleApiError,
  parseSearchParams,
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ username: string }>;
}

// GET /api/v1/users/:username/followers - Get user's followers
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { username } = await params;
    const user = await getCurrentUser();
    const paginationParams = parseSearchParams(request) as PaginationParams;

    const targetUser = await getUserByUsername(username);
    const result = await getFollowers(
      targetUser.id,
      paginationParams,
      user?.id
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
