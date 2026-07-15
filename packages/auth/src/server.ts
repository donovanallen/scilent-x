/**
 * @scilent-one/auth - Server Configuration
 *
 * Better Auth server-side configuration with Prisma adapter.
 * This file should only be imported in server-side code.
 *
 * @example
 * ```ts
 * import { auth } from "@scilent-one/auth/server";
 *
 * // Get session in a server component or API route
 * const session = await auth.api.getSession({
 *   headers: await headers()
 * });
 * ```
 */

import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, genericOAuth } from 'better-auth/plugins';
import { db } from '@scilent-one/db';
import { createLogger } from '@scilent-one/logger';
import { authLoggerHooks } from '@scilent-one/logger/auth';
import { isAuthEmailConfigured, sendAuthEmail } from './email';
import { getTrustedOrigins } from './origins';

const logger = createLogger('auth:server');

/** Prefer BETTER_AUTH_URL; fall back for local tooling. Validated by apps/web env. */
const authBaseURL =
  process.env.BETTER_AUTH_URL?.trim() || 'http://127.0.0.1:3000';

/**
 * Production requires BETTER_AUTH_SECRET (≥32 chars) via apps/web env schema.
 * Better Auth also reads BETTER_AUTH_SECRET from the environment.
 * Skip the hard throw when SKIP_ENV_VALIDATION=true (CI Next builds).
 */
const authSecret = process.env.BETTER_AUTH_SECRET?.trim();
if (
  process.env.NODE_ENV === 'production' &&
  !authSecret &&
  process.env.SKIP_ENV_VALIDATION !== 'true'
) {
  throw new Error(
    'BETTER_AUTH_SECRET is required in production (set via apps/web env)'
  );
}

const emailConfigured = isAuthEmailConfigured();

/**
 * Generates a unique username for new users.
 * Format: u_<8-char-hex> (e.g., u_a1b2c3d4)
 * Uses crypto for randomness and checks for uniqueness.
 */
async function generateUniqueUsername(): Promise<string> {
  const maxAttempts = 10;

  logger.debug('Generating unique username', { maxAttempts });

  for (let i = 0; i < maxAttempts; i++) {
    // Generate 8 random hex characters
    const randomBytes = crypto.getRandomValues(new Uint8Array(4));
    const hex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const username = `u_${hex}`;

    // Check if username already exists
    const existing = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existing) {
      logger.debug('Generated unique username', { username, attempt: i + 1 });
      return username;
    }

    logger.debug('Username collision, retrying', { username, attempt: i + 1 });
  }

  // Fallback: use timestamp + random for guaranteed uniqueness
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  const fallbackUsername = `u_${timestamp}${random}`;
  logger.warn('Used fallback username generation', {
    username: fallbackUsername,
  });
  return fallbackUsername;
}

/**
 * Better Auth instance configured for the application.
 *
 * Features:
 * - Email/password authentication
 * - Streaming account linking (Spotify / Tidal) via genericOAuth
 * - Prisma database adapter + Next.js cookie handling
 * - Rate limiting + production session defaults
 *
 * Social login (Google / GitHub / Apple) is intentionally disabled.
 * Optional Resend email (verification + password reset) activates when
 * RESEND_API_KEY is set — see packages/auth/src/email.ts.
 */
export const auth = betterAuth({
  baseURL: authBaseURL,
  ...(authSecret ? { secret: authSecret } : {}),

  /**
   * Database Configuration
   * Uses Prisma adapter connected to PostgreSQL via @scilent-one/db
   */
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  /**
   * Additional User Fields
   * Exposes app-specific preferences on the user/session object.
   * `input: true` lets the client persist changes via authClient.updateUser().
   */
  user: {
    additionalFields: {
      palette: {
        type: 'string',
        required: false,
        defaultValue: 'default',
        input: true,
      },
    },
  },

  /**
   * Database Hooks
   * Auto-generate username for new users to ensure profile routes work
   */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          logger.debug('User creation hook triggered', {
            hasUsername: !!user.username,
            email: user.email ? `${user.email.substring(0, 3)}...` : undefined,
          });

          // Only generate username if not already provided
          if (!user.username) {
            const username = await generateUniqueUsername();
            logger.info('Auto-generated username for new user', { username });
            return {
              data: {
                ...user,
                username,
              },
            };
          }
          return { data: user };
        },
      },
    },
  },

  /**
   * Better Auth Hooks
   * Logs authentication events (sign-in, sign-up, sign-out)
   */
  hooks: {
    before: createAuthMiddleware(authLoggerHooks.before),
    after: createAuthMiddleware(authLoggerHooks.after),
  },

  /**
   * Email and Password Authentication
   *
   * requireEmailVerification stays false until RESEND_API_KEY is configured
   * in production — avoids blocking launch on email provisioning.
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Reset your Scilent password',
        text: `Click the link to reset your password:\n\n${url}\n`,
      });
    },
  },

  /**
   * Email Verification — wired when Resend is configured; no-ops otherwise.
   * Enable requireEmailVerification (above) once AUTH_EMAIL_FROM is verified.
   */
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Verify your Scilent email',
        text: `Click the link to verify your email:\n\n${url}\n`,
      });
    },
    sendOnSignUp: emailConfigured,
    autoSignInAfterVerification: true,
  },

  /**
   * Social OAuth login (Google / GitHub / Apple) — disabled.
   * Streaming providers use genericOAuth below for account linking only.
   * To enable social login, uncomment socialProviders and set env vars
   * (see docs/AUTH.md).
   */
  // socialProviders: { ... },

  /**
   * Trusted Origins (CSRF / CORS)
   * Derived from BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL, and VERCEL_URL.
   */
  trustedOrigins: getTrustedOrigins(),

  /**
   * Session lifetime
   * expiresIn: absolute session max age (7 days).
   * updateAge: rolling refresh window — extend expiry when older than 1 day.
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  /**
   * Rate limiting on auth endpoints.
   * Forced on in all environments so local load tests match production.
   * Stricter rules for credential / reset paths.
   */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 10 },
      '/sign-up/email': { window: 60, max: 5 },
      '/request-password-reset': { window: 60, max: 5 },
      '/forget-password': { window: 60, max: 5 },
      '/send-verification-email': { window: 60, max: 5 },
    },
  },

  /**
   * Plugins
   * nextCookies: Automatically handles cookie setting in Next.js server actions
   */
  plugins: [
    /**
     * Admin plugin — roles, ban, and user impersonation.
     * @see https://www.better-auth.com/docs/plugins/admin
     *
     * Optional bootstrap: set BETTER_AUTH_ADMIN_USER_IDS to a comma-separated
     * list of user IDs that should always be treated as admins (useful before
     * the first seeded admin exists).
     */
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
      adminUserIds: (process.env.BETTER_AUTH_ADMIN_USER_IDS ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
      // Long enough for local debugging sessions without forcing re-impersonation
      impersonationSessionDuration: 60 * 60 * 4, // 4 hours
    }),
    /**
     * Generic OAuth Plugin for Streaming Service Account Linking
     *
     * Enables users to link their streaming accounts (Tidal, Spotify, etc.)
     * to their existing Scilent account. Tokens are stored in the Account table
     * and can be used for user-authenticated API calls.
     */
    genericOAuth({
      config: [
        {
          providerId: 'tidal',
          clientId: process.env.TIDAL_CLIENT_ID ?? '',
          clientSecret: process.env.TIDAL_CLIENT_SECRET ?? '',
          authorizationUrl: 'https://login.tidal.com/authorize',
          tokenUrl: 'https://auth.tidal.com/v1/oauth2/token',
          userInfoUrl: 'https://openapi.tidal.com/v2/users/me',
          // Tidal scopes for full user access
          scopes: [
            'user.read',
            'collection.read',
            'collection.write',
            'entitlements.read',
            'playback',
            'playlists.read',
            'playlists.write',
            'recommendations.read',
            'search.read',
            'search.write',
          ],
          pkce: true, // Tidal requires PKCE
          // Map Tidal's user info response to Better Auth's expected format
          async getUserInfo(token) {
            const tidalLogger = createLogger('auth:tidal');
            tidalLogger.debug('Fetching Tidal user info');

            // Try OpenAPI v2 users/me endpoint (requires user.read scope)
            const meResponse = await fetch(
              'https://openapi.tidal.com/v2/users/me',
              {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`,
                  Accept: 'application/vnd.api+json',
                  'Content-Type': 'application/vnd.api+json',
                },
              }
            );

            const meText = await meResponse.text();

            if (meResponse.ok) {
              try {
                const meData = JSON.parse(meText) as {
                  data?: {
                    id: string;
                    type: string;
                    attributes?: {
                      username?: string;
                      email?: string;
                      emailVerified?: boolean;
                      firstName?: string;
                      lastName?: string;
                      country?: string;
                    };
                  };
                };

                // Handle the nested data.attributes structure
                if (meData.data?.id) {
                  const attrs = meData.data.attributes || {};
                  const name =
                    [attrs.firstName, attrs.lastName]
                      .filter(Boolean)
                      .join(' ') || attrs.username;

                  tidalLogger.info('Tidal user info retrieved via /users/me', {
                    tidalUserId: meData.data.id,
                    hasEmail: !!attrs.email,
                  });

                  return {
                    id: String(meData.data.id),
                    name,
                    email: attrs.email || '',
                    emailVerified: attrs.emailVerified || false,
                  };
                }
              } catch (parseError) {
                tidalLogger.warn('Failed to parse Tidal /users/me response', {
                  error:
                    parseError instanceof Error
                      ? parseError.message
                      : String(parseError),
                });
              }
            }

            tidalLogger.debug(
              'Tidal /users/me endpoint failed, trying sessions fallback',
              {
                status: meResponse.status,
              }
            );

            // Fallback: try legacy sessions endpoint to get userId, then fetch user
            const sessionsResponse = await fetch(
              'https://api.tidal.com/v1/sessions',
              {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`,
                },
              }
            );

            if (sessionsResponse.ok) {
              try {
                const sessionData = (await sessionsResponse.json()) as {
                  userId: number;
                  countryCode?: string;
                };
                tidalLogger.debug('Tidal session retrieved', {
                  tidalUserId: sessionData.userId,
                  countryCode: sessionData.countryCode,
                });

                // Try to get full user info with the userId
                const userResponse = await fetch(
                  `https://api.tidal.com/v1/users/${sessionData.userId}?countryCode=${sessionData.countryCode || 'US'}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token.accessToken}`,
                    },
                  }
                );

                if (userResponse.ok) {
                  try {
                    const userData = (await userResponse.json()) as {
                      id: number;
                      username?: string;
                      email?: string;
                      firstName?: string;
                      lastName?: string;
                    };

                    tidalLogger.info(
                      'Tidal user info retrieved via sessions API',
                      {
                        tidalUserId: userData.id,
                        hasEmail: !!userData.email,
                      }
                    );

                    return {
                      id: String(userData.id),
                      name:
                        userData.username ||
                        [userData.firstName, userData.lastName]
                          .filter(Boolean)
                          .join(' ') ||
                        undefined,
                      email: userData.email || '',
                      emailVerified: false,
                    };
                  } catch (parseError) {
                    tidalLogger.warn('Failed to parse Tidal user response', {
                      error:
                        parseError instanceof Error
                          ? parseError.message
                          : String(parseError),
                    });
                  }
                }

                tidalLogger.warn(
                  'Tidal user fetch failed, using session data only',
                  {
                    status: userResponse.status,
                    tidalUserId: sessionData.userId,
                  }
                );

                // Last resort: return session data without email
                return {
                  id: String(sessionData.userId),
                  name: undefined,
                  email: '',
                  emailVerified: false,
                };
              } catch (parseError) {
                tidalLogger.warn('Failed to parse Tidal sessions response', {
                  error:
                    parseError instanceof Error
                      ? parseError.message
                      : String(parseError),
                });
              }
            }

            tidalLogger.error('All Tidal user info endpoints failed', {
              sessionsStatus: sessionsResponse.status,
            });
            return null;
          },
        },
        {
          providerId: 'spotify',
          clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
          authorizationUrl: 'https://accounts.spotify.com/authorize',
          tokenUrl: 'https://accounts.spotify.com/api/token',
          userInfoUrl: 'https://api.spotify.com/v1/me',
          // Spotify scopes for user profile and followed artists
          scopes: [
            'user-read-private', // Read user profile
            'user-read-email', // Read user email
            'user-follow-read', // Read followed artists
          ],
          pkce: true, // Spotify supports PKCE
          redirectURI: process.env.SPOTIFY_REDIRECT_URI ?? '',
          // Map Spotify's user info response to Better Auth's expected format
          async getUserInfo(token) {
            const spotifyLogger = createLogger('auth:spotify');
            spotifyLogger.debug('Fetching Spotify user info');

            const response = await fetch('https://api.spotify.com/v1/me', {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
                Accept: 'application/json',
              },
            });

            if (!response.ok) {
              spotifyLogger.error('Spotify /me endpoint failed', {
                status: response.status,
              });
              return null;
            }

            try {
              const data = (await response.json()) as {
                id: string;
                display_name?: string;
                email?: string;
                images?: Array<{ url: string }>;
              };

              spotifyLogger.info('Spotify user info retrieved', {
                spotifyUserId: data.id,
                hasEmail: !!data.email,
                hasDisplayName: !!data.display_name,
              });

              return {
                id: data.id,
                name: data.display_name,
                email: data.email || '',
                emailVerified: !!data.email, // Spotify requires verified email
                image: data.images?.[0]?.url,
              };
            } catch (parseError) {
              spotifyLogger.warn('Failed to parse Spotify user response', {
                error:
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError),
              });
              return null;
            }
          },
        },
      ],
    }),
    nextCookies(), // Must be last in the plugins array
  ],
});

/**
 * Auth type export for type inference
 */
export type Auth = typeof auth;
