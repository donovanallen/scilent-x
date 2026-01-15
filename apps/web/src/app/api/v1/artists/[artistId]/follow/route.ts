import {
  followArtist,
  unfollowArtist,
  isFollowingArtist,
} from '@scilent-one/social';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ artistId: string }>;
}

// GET /api/v1/artists/:artistId/follow - Check if following an artist
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { artistId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const isFollowing = await isFollowingArtist(user.id, artistId);

    return NextResponse.json({ isFollowing });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/artists/:artistId/follow - Follow an artist
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { artistId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      provider?: string;
      artistName?: string;
      artistImage?: string | null;
    };

    if (!body.provider || !body.artistName) {
      return NextResponse.json(
        { error: 'Provider and artistName are required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const follow = await followArtist(user.id, {
      artistId,
      provider: body.provider,
      artistName: body.artistName,
      artistImage: body.artistImage ?? null,
    });

    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/artists/:artistId/follow - Unfollow an artist
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { artistId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    await unfollowArtist(user.id, artistId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
