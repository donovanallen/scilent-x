import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import {
  getAppleMusicCredentials,
  mintAppleMusicDeveloperToken,
} from '@/lib/apple-music-developer-token';

/**
 * GET /api/v1/apple-music/developer-token
 *
 * Returns a short-lived Apple Music developer token for MusicKit JS. The token
 * is scoped (via the JWT `origin` claim) to the request origin plus the
 * configured app URL, so it cannot be reused from another site.
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const credentials = getAppleMusicCredentials();
    if (!credentials) {
      return NextResponse.json(
        { error: 'Apple Music is not configured', code: 'NOT_CONFIGURED' },
        { status: 501 }
      );
    }

    // Collect allowed origins for the token: the request's own origin and the
    // configured app URL (deduplicated).
    const origins = new Set<string>();
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin) origins.add(requestOrigin);

    const appUrl = process.env.BETTER_AUTH_URL;
    if (appUrl) {
      try {
        origins.add(new URL(appUrl).origin);
      } catch {
        // Ignore a malformed BETTER_AUTH_URL; the request origin still applies.
      }
    }

    const token = mintAppleMusicDeveloperToken(credentials, [...origins]);

    return NextResponse.json({ token });
  } catch (error) {
    return handleApiError(error);
  }
}
