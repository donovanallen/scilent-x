/**
 * @scilent-one/auth - Client Configuration
 *
 * Better Auth client-side configuration for React applications.
 * This file should only be imported in client-side code.
 *
 * @example
 * ```tsx
 * import { authClient } from "@scilent-one/auth/client";
 *
 * // Use the session hook in a React component
 * function UserProfile() {
 *   const { data: session, isPending } = authClient.useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return <div>Not signed in</div>;
 *
 *   return <div>Welcome, {session.user.name}!</div>;
 * }
 * ```
 */

import { createAuthClient } from 'better-auth/react';
import { genericOAuthClient } from 'better-auth/client/plugins';

/**
 * Auth client instance for client-side authentication.
 *
 * Available methods:
 * - authClient.signIn.email({ email, password }) - Sign in with email/password
 * - authClient.signIn.social({ provider }) - Sign in with OAuth provider
 * - authClient.signUp.email({ email, password, name }) - Register new user
 * - authClient.signOut() - Sign out current user
 * - authClient.useSession() - React hook for session state
 * - authClient.getSession() - Get current session (async)
 * - authClient.linkSocial({ provider, callbackURL }) - Link streaming account
 * - authClient.unlinkAccount({ providerId }) - Unlink streaming account
 * - authClient.listAccounts() - Get all linked accounts
 */
export const authClient = createAuthClient({
  /**
   * Base URL for auth API requests.
   * In most cases, this can be left empty and it will use the current origin.
   * Set this if your auth API is on a different domain.
   */
  // baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [genericOAuthClient()],
});

/**
 * Convenience exports for common auth operations
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  linkSocial,
  unlinkAccount,
  listAccounts,
} = authClient;

/**
 * Type exports for client-side usage
 */
export type AuthClient = typeof authClient;
export type Session = Awaited<ReturnType<typeof authClient.getSession>>['data'];
