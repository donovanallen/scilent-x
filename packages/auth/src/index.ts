/**
 * @scilent-one/auth
 *
 * Authentication package providing Better Auth integration for the monorepo.
 *
 * This package provides both server-side and client-side authentication utilities.
 *
 * ## Server-side usage (API routes, Server Components, Server Actions):
 * ```ts
 * import { auth } from "@scilent-one/auth/server";
 *
 * const session = await auth.api.getSession({
 *   headers: await headers()
 * });
 * ```
 *
 * ## Client-side usage (React components):
 * ```tsx
 * import { authClient, useSession } from "@scilent-one/auth/client";
 *
 * function Component() {
 *   const { data: session } = useSession();
 *   // ...
 * }
 * ```
 *
 * ## Direct imports (when you need both):
 * ```ts
 * import { auth } from "@scilent-one/auth";           // Server
 * import { authClient } from "@scilent-one/auth";     // Client
 * ```
 */

// Re-export server utilities
export { auth } from './server';
export type { Auth } from './server';

// Re-export client utilities
export {
  authClient,
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} from './client';
export type { AuthClient, Session } from './client';
