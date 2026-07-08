/**
 * Connected music-provider account resolution + token lifecycle helpers.
 *
 * These utilities are shared by the artist API routes so that any connected
 * OAuth music provider (not just Tidal) is supported, and so that expired
 * access tokens are transparently refreshed before we give up and ask the user
 * to reconnect.
 *
 * Provider set: only providers wired as Better Auth OAuth accounts
 * (`packages/auth/src/server.ts` -> `genericOAuth`) can be resolved here. Today
 * that is Tidal and Spotify. Apple Music is intentionally excluded: it uses a
 * client-side MusicKit "Music User Token" and is NOT stored as a Better Auth
 * `Account`, so there is no server-side account/refresh-token to resolve.
 */
import { auth } from '@scilent-one/auth/server';
import { db } from '@scilent-one/db';

import { createApiLogger } from './logger';

const logger = createApiLogger('music-provider');

/**
 * Music providers that can be connected via Better Auth OAuth and therefore
 * have a persisted `Account` row (with access/refresh tokens) we can use.
 *
 * Order here is only used as a deterministic tie-breaker; primary selection is
 * by most-recently-updated account (see `getConnectedMusicProviderAccount`).
 */
export const SUPPORTED_MUSIC_PROVIDER_IDS = ['tidal', 'spotify'] as const;

export type MusicProviderId = (typeof SUPPORTED_MUSIC_PROVIDER_IDS)[number];

/**
 * A user's connected music-provider account, narrowed to the fields the artist
 * routes need. `providerId` is one of {@link SUPPORTED_MUSIC_PROVIDER_IDS}.
 */
export interface ConnectedMusicProviderAccount {
  /** Better Auth `Account.id` (primary key), used to disambiguate refreshes. */
  id: string;
  /** Provider-issued account id (Better Auth `Account.accountId`). */
  accountId: string;
  providerId: MusicProviderId;
  accessToken: string | null;
  accessTokenExpiresAt: Date | null;
  /** Presence indicates whether a transparent refresh is even possible. */
  hasRefreshToken: boolean;
}

/**
 * Resolve the user's connected music-provider account among the supported set.
 *
 * Selection strategy: if a user has connected more than one provider, we pick
 * the **most recently updated** account (`updatedAt desc`). This is
 * deterministic, naturally favors the account the user most recently
 * connected/used (its `updatedAt` bumps on token refresh), and avoids baking in
 * an arbitrary provider preference. Ties (same `updatedAt`) are broken by
 * `providerId` for full determinism.
 *
 * @returns the selected account, or `null` if the user has no connected
 *   supported provider.
 */
export async function getConnectedMusicProviderAccount(
  userId: string
): Promise<ConnectedMusicProviderAccount | null> {
  const account = await db.account.findFirst({
    where: {
      userId,
      providerId: { in: [...SUPPORTED_MUSIC_PROVIDER_IDS] },
    },
    orderBy: [{ updatedAt: 'desc' }, { providerId: 'asc' }],
    select: {
      id: true,
      accountId: true,
      providerId: true,
      accessToken: true,
      accessTokenExpiresAt: true,
      refreshToken: true,
    },
  });

  if (!account) {
    return null;
  }

  return {
    id: account.id,
    accountId: account.accountId,
    providerId: account.providerId as MusicProviderId,
    accessToken: account.accessToken,
    accessTokenExpiresAt: account.accessTokenExpiresAt,
    hasRefreshToken: !!account.refreshToken,
  };
}

/** Refresh a token a bit before it actually expires to avoid racing the clock. */
const TOKEN_REFRESH_MARGIN_MS = 10_000;

export type ProviderTokenResult =
  | { ok: true; accessToken: string }
  /**
   * The access token is expired/missing and could not be refreshed (no refresh
   * token on file, or the refresh call failed). The user must reconnect.
   */
  | { ok: false; code: 'TOKEN_EXPIRED' };

/**
 * Return a currently-valid OAuth access token for a connected provider account,
 * transparently refreshing it when needed.
 *
 * This delegates the refresh to Better Auth's built-in `auth.api.getAccessToken`
 * endpoint, which:
 *   - looks up the account's stored refresh token,
 *   - exchanges it at the provider's OAuth token endpoint (wired per-provider by
 *     the `genericOAuth` plugin: Spotify `https://accounts.spotify.com/api/token`,
 *     Tidal `https://auth.tidal.com/v1/oauth2/token`),
 *   - persists the rotated `accessToken`/`accessTokenExpiresAt` (and refresh
 *     token, if the provider returned a new one) back to the `Account` row, and
 *   - returns the fresh token.
 *
 * Using the built-in keeps this provider-agnostic (new providers only need to be
 * added to the `genericOAuth` config) and avoids hand-rolling OAuth calls or
 * duplicating token-persistence logic.
 *
 * @param account - the connected account from {@link getConnectedMusicProviderAccount}.
 * @param requestHeaders - the incoming request headers, forwarded so Better Auth
 *   can authorize the token operation against the caller's session.
 */
export async function getValidProviderAccessToken(
  account: ConnectedMusicProviderAccount,
  requestHeaders: Headers
): Promise<ProviderTokenResult> {
  const now = Date.now();
  const expiresAtMs = account.accessTokenExpiresAt?.getTime() ?? null;
  const needsRefresh =
    expiresAtMs !== null && expiresAtMs - now <= TOKEN_REFRESH_MARGIN_MS;

  // Fast path: token present and comfortably unexpired -> no refresh round-trip.
  if (account.accessToken && !needsRefresh) {
    return { ok: true, accessToken: account.accessToken };
  }

  // A refresh is needed but there is nothing to refresh with -> reconnect.
  if (!account.hasRefreshToken) {
    return { ok: false, code: 'TOKEN_EXPIRED' };
  }

  try {
    const refreshed = await auth.api.getAccessToken({
      body: {
        providerId: account.providerId,
        accountId: account.accountId,
      },
      headers: requestHeaders,
    });

    const refreshedExpiresAtMs = refreshed?.accessTokenExpiresAt
      ? new Date(refreshed.accessTokenExpiresAt).getTime()
      : null;
    const stillExpired =
      refreshedExpiresAtMs !== null && refreshedExpiresAtMs <= now;

    if (refreshed?.accessToken && !stillExpired) {
      return { ok: true, accessToken: refreshed.accessToken };
    }

    return { ok: false, code: 'TOKEN_EXPIRED' };
  } catch (error) {
    logger.warn('Failed to refresh provider access token', {
      providerId: account.providerId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, code: 'TOKEN_EXPIRED' };
  }
}
