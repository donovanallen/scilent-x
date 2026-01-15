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
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';
import { db } from '@scilent-one/db';

/**
 * Generates a unique username for new users.
 * Format: u_<8-char-hex> (e.g., u_a1b2c3d4)
 * Uses crypto for randomness and checks for uniqueness.
 */
async function generateUniqueUsername(): Promise<string> {
  const maxAttempts = 10;

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
      return username;
    }
  }

  // Fallback: use timestamp + random for guaranteed uniqueness
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `u_${timestamp}${random}`;
}

/**
 * Better Auth instance configured for the application.
 *
 * Features:
 * - Email/password authentication
 * - Social OAuth providers (Google, GitHub, Apple)
 * - Prisma database adapter
 * - Next.js cookie handling
 */
export const auth = betterAuth({
  /**
   * Database Configuration
   * Uses Prisma adapter connected to PostgreSQL via @scilent-one/db
   */
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  /**
   * Database Hooks
   * Auto-generate username for new users to ensure profile routes work
   */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Only generate username if not already provided
          if (!user.username) {
            const username = await generateUniqueUsername();
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
   * Email and Password Authentication
   */
  emailAndPassword: {
    enabled: true,
    // Require email verification before allowing sign-in
    requireEmailVerification: false,
    // Minimum password length
    minPasswordLength: 8,
    // Maximum password length
    maxPasswordLength: 128,
    // Auto sign in after registration
    autoSignIn: true,
    // Password reset configuration
    // sendResetPassword: async ({ user, url, token }) => {
    //   // TODO: Implement email sending
    //   console.log(`Password reset for ${user.email}: ${url}`);
    // },
  },

  /**
   * Email Verification Configuration
   */
  // emailVerification: {
  //   sendVerificationEmail: async ({ user, url, token }) => {
  //     // TODO: Implement email sending
  //     console.log(`Verification email for ${user.email}: ${url}`);
  //   },
  //   sendOnSignUp: true,
  //   autoSignInAfterVerification: true,
  // },

  /**
   * Social OAuth Providers
   *
   * Configure each provider with credentials from their developer consoles:
   * - Google: https://console.cloud.google.com/apis/credentials
   * - GitHub: https://github.com/settings/developers
   * - Apple: https://developer.apple.com/account/resources/authkeys/list
   */
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  //     // Always prompt user to select account
  //     // prompt: 'select_account',
  //   },
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID ?? '',
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
  //   },
  //   apple: {
  //     clientId: process.env.APPLE_CLIENT_ID ?? '',
  //     clientSecret: process.env.APPLE_CLIENT_SECRET ?? '',
  //     // Required for native iOS apps using app bundle ID
  //     // appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
  //   },
  // },

  /**
   * Trusted Origins for CORS
   * Add your production domains here
   */
  trustedOrigins: [
    // Apple Sign In requires this
    // 'https://appleid.apple.com',
    // Add your production domains
    // 'https://yourdomain.com',
  ],

  /**
   * Plugins
   * nextCookies: Automatically handles cookie setting in Next.js server actions
   */
  plugins: [
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
                console.log('Tidal /users/me response:', meData);

                // Handle the nested data.attributes structure
                if (meData.data?.id) {
                  const attrs = meData.data.attributes || {};
                  const name =
                    [attrs.firstName, attrs.lastName]
                      .filter(Boolean)
                      .join(' ') || attrs.username;
                  return {
                    id: String(meData.data.id),
                    name,
                    email: attrs.email || '',
                    emailVerified: attrs.emailVerified || false,
                  };
                }
              } catch (parseError) {
                console.log(
                  'Failed to parse Tidal /users/me response:',
                  parseError
                );
              }
            }

            console.log('Tidal /users/me failed:', meResponse.status, meText);

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
                console.log('Tidal sessions response:', sessionData);

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
                    console.log('Tidal user response:', userData);
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
                    console.log(
                      'Failed to parse Tidal user response:',
                      parseError
                    );
                  }
                }

                console.log(
                  'Tidal user fetch failed:',
                  userResponse.status,
                  await userResponse.text()
                );

                // Last resort: return session data without email
                return {
                  id: String(sessionData.userId),
                  name: undefined,
                  email: '',
                  emailVerified: false,
                };
              } catch (parseError) {
                console.log(
                  'Failed to parse Tidal sessions response:',
                  parseError
                );
              }
            }

            console.error(
              'All Tidal user info endpoints failed:',
              sessionsResponse.status,
              await sessionsResponse.text()
            );
            return null;
          },
        },
      ],
    }),
    nextCookies(), // Must be last in the plugins array
  ],

  /**
   * Advanced Configuration
   */
  // session: {
  //   expiresIn: 60 * 60 * 24 * 7, // 7 days
  //   updateAge: 60 * 60 * 24, // 1 day
  // },
});

/**
 * Auth type export for type inference
 */
export type Auth = typeof auth;
