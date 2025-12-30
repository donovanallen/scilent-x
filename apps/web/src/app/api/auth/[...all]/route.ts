/**
 * Better Auth API Route Handler
 *
 * This catch-all route handles all authentication API requests.
 * Endpoints include:
 * - POST /api/auth/sign-in/email - Email/password sign in
 * - POST /api/auth/sign-up/email - Email/password registration
 * - POST /api/auth/sign-out - Sign out
 * - GET  /api/auth/session - Get current session
 * - GET  /api/auth/callback/:provider - OAuth callback
 * - And more...
 *
 * @see https://www.better-auth.com/docs/integrations/next
 */

import { auth } from '@scilent-one/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
