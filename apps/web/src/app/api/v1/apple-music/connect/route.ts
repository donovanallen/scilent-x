import { db } from '@scilent-one/db';
import { AppleMusicProvider } from '@scilent-one/harmony-engine';
import { NextResponse } from 'next/server';

import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { getHarmonizationEngine } from '@/lib/harmonization';

const PROVIDER_ID = 'apple_music';

/**
 * POST /api/v1/apple-music/connect
 *
 * Stores the Music User Token obtained client-side via MusicKit as an
 * `apple_music` account for the current user. Apple Music is not an OAuth2
 * provider, so this replaces the `linkSocial` flow used by Spotify/Tidal.
 *
 * Body: { musicUserToken: string }
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      musicUserToken?: unknown;
    } | null;
    const musicUserToken = body?.musicUserToken;

    if (typeof musicUserToken !== 'string' || musicUserToken.length === 0) {
      return NextResponse.json(
        { error: 'musicUserToken is required', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Best-effort validation: confirm the token works against Apple's API before
    // persisting it. If the provider isn't enabled we skip validation and store
    // the token as-is (the profile card surfaces auth errors either way).
    const engine = await getHarmonizationEngine();
    const provider = engine.getProvider(PROVIDER_ID);
    if (provider instanceof AppleMusicProvider) {
      try {
        await provider.getCurrentUser(musicUserToken);
      } catch {
        return NextResponse.json(
          {
            error: 'Apple Music authorization failed',
            code: 'INVALID_TOKEN',
          },
          { status: 400 }
        );
      }
    }

    // Upsert the account row. accountId is the user id, which keeps the
    // (providerId, accountId) pair unique per user.
    await db.account.upsert({
      where: {
        providerId_accountId: {
          providerId: PROVIDER_ID,
          accountId: user.id,
        },
      },
      update: { accessToken: musicUserToken },
      create: {
        userId: user.id,
        providerId: PROVIDER_ID,
        accountId: user.id,
        accessToken: musicUserToken,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/apple-music/connect
 *
 * Removes the current user's Apple Music connection.
 */
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    await db.account.deleteMany({
      where: { userId: user.id, providerId: PROVIDER_ID },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
