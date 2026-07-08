/**
 * Connected music-provider account resolution + token lifecycle helpers.
 *
 * These utilities are shared by the artist API routes and profile server
 * actions so that any connected music provider is supported, and so that
 * expired access tokens are transparently refreshed before we give up and ask
 * the user to reconnect.
 *
 * Refreshable provider set (OAuth): only providers wired as Better Auth OAuth
 * accounts (`packages/auth/src/server.ts` -> `genericOAuth`) can be refreshed
 * server-side via a stored refresh token. Today that is Tidal
 * (`https://auth.tidal.com/v1/oauth2/token`) and Spotify
 * (`https://accounts.spotify.com/api/token`, `grant_type=refresh_token`).
 *
 * Apple Music is different: it uses a client-side MusicKit "Music User Token"
 * that has no server-side refresh flow. {@link getFreshAccessToken} therefore
 * never tries to refresh it — when an Apple Music token is missing/expired it
 * reports `reconnectVia: 'musickit'` so the UI can prompt the user to
 * re-authorize through MusicKit instead.
 */
import { auth } from '@scilent-one/auth/server';
import { db } from '@scilent-one/db';
import { headers } from 'next/headers';

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

/** Provider id for Apple Music, which cannot be refreshed server-side. */
const APPLE_MUSIC_PROVIDER_ID = 'apple_music';

export type ProviderTokenResult =
  | { ok: true; accessToken: string }
  /**
   * The access token is expired/missing and could not be refreshed (no refresh
   * token on file, or the refresh call failed). The user must reconnect.
   */
  | { ok: false; code: 'TOKEN_EXPIRED' };

/**
 * Given an access token's expiry (or `null` when unknown), decide whether it
 * should be refreshed. Tokens are refreshed slightly before their real expiry
 * ({@link TOKEN_REFRESH_MARGIN_MS}) to avoid racing the clock. A `null` expiry
 * is treated as "never expires from our perspective" (e.g. Apple Music tokens,
 * which carry no server-side expiry).
 */
function isAccessTokenExpired(expiresAt: Date | null, nowMs: number): boolean {
  const expiresAtMs = expiresAt?.getTime() ?? null;
  return expiresAtMs !== null && expiresAtMs - nowMs <= TOKEN_REFRESH_MARGIN_MS;
}

/**
 * Exchange a stored refresh token for a fresh access token via Better Auth's
 * built-in `getAccessToken` endpoint. Better Auth looks up the account's refresh
 * token, calls the provider's OAuth token endpoint, and persists the rotated
 * `accessToken`/`accessTokenExpiresAt` (and refresh token, if rotated) back to
 * the `Account` row before returning the fresh token.
 */
async function refreshOAuthAccessToken(
  providerId: string,
  accountId: string,
  requestHeaders: Headers,
  nowMs: number
): Promise<ProviderTokenResult> {
  try {
    const refreshed = await auth.api.getAccessToken({
      body: {
        providerId,
        accountId,
      },
      headers: requestHeaders,
    });

    const refreshedExpiresAtMs = refreshed?.accessTokenExpiresAt
      ? new Date(refreshed.accessTokenExpiresAt).getTime()
      : null;
    const stillExpired =
      refreshedExpiresAtMs !== null && refreshedExpiresAtMs <= nowMs;

    if (refreshed?.accessToken && !stillExpired) {
      return { ok: true, accessToken: refreshed.accessToken };
    }

    return { ok: false, code: 'TOKEN_EXPIRED' };
  } catch (error) {
    logger.warn('Failed to refresh provider access token', {
      providerId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, code: 'TOKEN_EXPIRED' };
  }
}

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
  const needsRefresh = isAccessTokenExpired(account.accessTokenExpiresAt, now);

  // Fast path: token present and comfortably unexpired -> no refresh round-trip.
  if (account.accessToken && !needsRefresh) {
    return { ok: true, accessToken: account.accessToken };
  }

  // A refresh is needed but there is nothing to refresh with -> reconnect.
  if (!account.hasRefreshToken) {
    return { ok: false, code: 'TOKEN_EXPIRED' };
  }

  return refreshOAuthAccessToken(
    account.providerId,
    account.accountId,
    requestHeaders,
    now
  );
}

/**
 * How a user should re-establish a broken provider connection:
 * - `oauth`: restart the Better Auth OAuth link flow (Spotify, Tidal, ...).
 * - `musickit`: re-authorize through the client-side MusicKit flow (Apple
 *   Music), which has no server-side refresh.
 */
export type ReconnectVia = 'oauth' | 'musickit';

export type FreshAccessTokenResult =
  | { ok: true; providerId: string; accessToken: string }
  | {
      ok: false;
      providerId: string;
      /**
       * `NOT_CONNECTED` - no account/access token stored for this provider.
       * `TOKEN_EXPIRED` - token is expired and could not be refreshed (no
       * refresh token, refresh failed, or the provider has no refresh flow).
       */
      code: 'NOT_CONNECTED' | 'TOKEN_EXPIRED';
      reconnectVia: ReconnectVia;
    };

/**
 * Return a currently-valid access token for `(userId, providerId)`, refreshing
 * it transparently when possible.
 *
 * This is the shared entry point used by server actions and route handlers so
 * that token lifecycle handling lives in exactly one place:
 *
 * - Looks up the connected `Account` row for the user + provider.
 * - Checks `accessTokenExpiresAt`; if the token is still valid, returns it
 *   without a network round-trip.
 * - For OAuth providers (Spotify, Tidal) whose token is expired, exchanges the
 *   stored refresh token for a new access token and persists the rotated token
 *   back to the `Account` row (via Better Auth `getAccessToken`).
 * - For Apple Music, never attempts a refresh (there is no server-side refresh
 *   for a MusicKit "Music User Token"); an expired/missing token yields
 *   `reconnectVia: 'musickit'` so the caller can prompt a MusicKit re-auth.
 *
 * The request headers are read from the ambient request context
 * (`next/headers`), so this must be called from a Server Component, Server
 * Action, or Route Handler.
 *
 * @param userId - the id of the user who owns the connected account.
 * @param providerId - the provider to fetch a token for (e.g. `spotify`,
 *   `tidal`, `apple_music`).
 */
export async function getFreshAccessToken(
  userId: string,
  providerId: string
): Promise<FreshAccessTokenResult> {
  const isAppleMusic = providerId === APPLE_MUSIC_PROVIDER_ID;
  const reconnectVia: ReconnectVia = isAppleMusic ? 'musickit' : 'oauth';

  const account = await db.account.findFirst({
    where: { userId, providerId },
    select: {
      accountId: true,
      accessToken: true,
      accessTokenExpiresAt: true,
      refreshToken: true,
    },
  });

  if (!account?.accessToken) {
    return { ok: false, providerId, code: 'NOT_CONNECTED', reconnectVia };
  }

  const now = Date.now();
  const expired = isAccessTokenExpired(account.accessTokenExpiresAt, now);

  // Fast path: token present and comfortably unexpired.
  if (!expired) {
    return { ok: true, providerId, accessToken: account.accessToken };
  }

  // Apple Music tokens cannot be refreshed server-side; the user must
  // re-authorize through MusicKit.
  if (isAppleMusic || !account.refreshToken) {
    return { ok: false, providerId, code: 'TOKEN_EXPIRED', reconnectVia };
  }

  const refreshed = await refreshOAuthAccessToken(
    providerId,
    account.accountId,
    await headers(),
    now
  );

  if (refreshed.ok) {
    return { ok: true, providerId, accessToken: refreshed.accessToken };
  }

  return { ok: false, providerId, code: 'TOKEN_EXPIRED', reconnectVia };
}
