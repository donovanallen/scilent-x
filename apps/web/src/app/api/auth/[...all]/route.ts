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
import { createLogger } from '@scilent-one/logger';
import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';

const logger = createLogger('api:auth');

const { GET: baseGet, POST: basePost } = toNextJsHandler(auth);

/**
 * Wrap auth handlers with request logging for observability.
 */
function withAuthLogging(
  handler: (req: NextRequest) => Promise<Response>,
  method: 'GET' | 'POST'
) {
  return async (req: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    const path = req.nextUrl.pathname;
    const authPath = path.replace('/api/auth', '');

    logger.debug('Auth request started', { method, path: authPath });

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Log based on the type of auth operation
      if (response.ok) {
        logger.info('Auth request completed', {
          method,
          path: authPath,
          status: response.status,
          duration,
        });
      } else {
        logger.warn('Auth request failed', {
          method,
          path: authPath,
          status: response.status,
          duration,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'Auth request error',
        error instanceof Error ? error : undefined,
        { method, path: authPath, duration }
      );
      throw error;
    }
  };
}

export const GET = withAuthLogging(baseGet, 'GET');
export const POST = withAuthLogging(basePost, 'POST');
