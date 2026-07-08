import {
  getUserByUsername,
  getProfileFeed,
  getLikedPosts,
  getUserReposts,
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

// GET /api/v1/users/:username - Get user profile by username
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { username } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const includePosts = searchParams.get('includePosts') === 'true';
    const includeLiked = searchParams.get('includeLiked') === 'true';
    const includeReposts = searchParams.get('includeReposts') === 'true';
    const includeConnectedAccounts =
      searchParams.get('includeConnectedAccounts') === 'true';
    const paginationParams = parseSearchParams(request) as PaginationParams;

    const profile = await getUserByUsername(username, user?.id, {
      includeConnectedAccounts,
    });

    if (includeLiked) {
      const liked = await getLikedPosts(profile.id, paginationParams, user?.id);
      return NextResponse.json({ ...profile, liked });
    }

    if (includeReposts) {
      const reposts = await getUserReposts(
        profile.id,
        paginationParams,
        user?.id
      );
      return NextResponse.json({ ...profile, reposts });
    }

    if (includePosts) {
      const posts = await getProfileFeed(
        profile.id,
        paginationParams,
        user?.id
      );
      return NextResponse.json({ ...profile, posts });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
