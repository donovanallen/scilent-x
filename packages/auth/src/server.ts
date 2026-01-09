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
          userInfoUrl: 'https://api.tidal.com/v1/sessions',
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
            // Try OIDC userinfo endpoint first (standard OAuth2)
            const userinfoResponse = await fetch(
              'https://login.tidal.com/oauth2/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`,
                },
              }
            );

            if (userinfoResponse.ok) {
              const userinfo = (await userinfoResponse.json()) as {
                sub: string;
                preferred_username?: string;
                email?: string;
                email_verified?: boolean;
              };
              console.log('Tidal userinfo response:', userinfo);
              return {
                id: userinfo.sub,
                name: userinfo.preferred_username,
                email: userinfo.email || '',
                emailVerified: userinfo.email_verified || false,
              };
            }

            console.log(
              'Tidal userinfo failed, trying sessions:',
              userinfoResponse.status
            );

            // Fallback: try legacy sessions endpoint
            const sessionsResponse = await fetch(
              'https://api.tidal.com/v1/sessions',
              {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`,
                },
              }
            );

            if (sessionsResponse.ok) {
              const sessionData = (await sessionsResponse.json()) as {
                userId: number;
                username?: string;
              };
              console.log('Tidal sessions response:', sessionData);
              return {
                id: String(sessionData.userId),
                name: sessionData.username,
                email: '',
                emailVerified: false,
              };
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
