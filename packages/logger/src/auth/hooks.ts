/**
 * @scilent-one/logger/auth - Better Auth Logging Hooks
 *
 * Provides hooks for logging authentication events from Better Auth.
 * Uses the createAuthMiddleware API for proper integration.
 */

import { Logger, type LogContext } from '../logger';

const logger = new Logger({ namespace: 'auth' });

/**
 * Better Auth middleware context type (internal).
 * We use a loose type to be compatible with Better Auth's complex middleware context.
 */
interface AuthContext {
  path: string;
  method: string;
  body?: unknown;
  headers?: unknown;
  request?: unknown;
  context: {
    newSession?: {
      user: {
        id: string;
        email?: string;
        name?: string | null;
      };
    } | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Generic middleware handler type that accepts any auth context.
 * Uses a function signature compatible with Better Auth's createAuthMiddleware.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MiddlewareHandler = (ctx: any) => Promise<void | unknown>;

/**
 * Extract safe user info for logging (no sensitive data).
 */
function getSafeUserInfo(user?: {
  id: string;
  email?: string;
  name?: string | null;
}): LogContext | undefined {
  if (!user) return undefined;
  return {
    userId: user.id,
    email: user.email ? `${user.email.substring(0, 3)}...` : undefined,
  };
}

/**
 * Create the after hook middleware function for logging auth events.
 * This logs sign-in, sign-up, sign-out, and session events.
 */
function createAfterHookLogger(): MiddlewareHandler {
  return async (rawCtx) => {
    const ctx = rawCtx as AuthContext;
    const path = ctx.path;
    const method = ctx.method;

    // Sign-in events
    if (path.startsWith('/sign-in')) {
      const newSession = ctx.context.newSession;
      if (newSession) {
        logger.info('User signed in', {
          ...getSafeUserInfo(newSession.user),
          method,
          path,
        });
      }
      return;
    }

    // Sign-up events
    if (path.startsWith('/sign-up')) {
      const newSession = ctx.context.newSession;
      if (newSession) {
        logger.info('User signed up', {
          ...getSafeUserInfo(newSession.user),
          method,
          path,
        });
      }
      return;
    }

    // Sign-out events
    if (path.startsWith('/sign-out')) {
      logger.info('User signed out', {
        method,
        path,
      });
      return;
    }

    // OAuth callback events
    if (path.startsWith('/callback/')) {
      const provider =
        path.replace('/callback/', '').split('/')[0] ?? 'unknown';
      const newSession = ctx.context.newSession;
      if (newSession) {
        logger.info('OAuth callback completed', {
          provider,
          ...getSafeUserInfo(newSession.user),
          path,
        });
      }
      return;
    }
  };
}

/**
 * Create the before hook middleware function for logging auth requests.
 * This logs the start of authentication attempts.
 */
function createBeforeHookLogger(): MiddlewareHandler {
  return async (rawCtx) => {
    const ctx = rawCtx as AuthContext;
    const path = ctx.path;
    const method = ctx.method;

    // Only log important auth endpoints at debug level
    if (
      path.startsWith('/sign-in') ||
      path.startsWith('/sign-up') ||
      path.startsWith('/sign-out')
    ) {
      logger.debug('Auth request started', {
        method,
        path,
        hasBody: !!ctx.body,
      });
    }
  };
}

/**
 * Better Auth hooks for logging authentication events.
 * These are raw hook functions - you need to wrap them with createAuthMiddleware.
 *
 * @example
 * ```ts
 * // packages/auth/src/server.ts
 * import { betterAuth } from 'better-auth';
 * import { createAuthMiddleware } from 'better-auth/api';
 * import { authLoggerHooks } from '@scilent-one/logger/auth';
 *
 * export const auth = betterAuth({
 *   hooks: {
 *     before: createAuthMiddleware(authLoggerHooks.before),
 *     after: createAuthMiddleware(authLoggerHooks.after),
 *   },
 *   // ... other config
 * });
 * ```
 */
export const authLoggerHooks = {
  before: createBeforeHookLogger(),
  after: createAfterHookLogger(),
};

/**
 * Create custom auth logging hooks with additional callbacks.
 *
 * @example
 * ```ts
 * import { createAuthMiddleware } from 'better-auth/api';
 * import { createAuthHooks } from '@scilent-one/logger/auth';
 *
 * const hooks = createAuthHooks({
 *   onSignIn: async (user) => {
 *     // Custom sign-in handling
 *   },
 * });
 *
 * export const auth = betterAuth({
 *   hooks: {
 *     before: createAuthMiddleware(hooks.before),
 *     after: createAuthMiddleware(hooks.after),
 *   },
 * });
 * ```
 */
export interface AuthHookCallbacks {
  onSignIn?: (user: {
    id: string;
    email?: string;
    name?: string | null;
  }) => void | Promise<void>;
  onSignUp?: (user: {
    id: string;
    email?: string;
    name?: string | null;
  }) => void | Promise<void>;
  onSignOut?: () => void | Promise<void>;
  onOAuthCallback?: (
    provider: string,
    user: { id: string; email?: string; name?: string | null }
  ) => void | Promise<void>;
}

export function createAuthHooks(callbacks: AuthHookCallbacks = {}): {
  before: MiddlewareHandler;
  after: MiddlewareHandler;
} {
  const afterHook: MiddlewareHandler = async (rawCtx) => {
    const ctx = rawCtx as AuthContext;
    const path = ctx.path;
    const method = ctx.method;

    // Sign-in events
    if (path.startsWith('/sign-in')) {
      const newSession = ctx.context.newSession;
      if (newSession) {
        logger.info('User signed in', {
          ...getSafeUserInfo(newSession.user),
          method,
          path,
        });
        await callbacks.onSignIn?.(newSession.user);
      }
      return;
    }

    // Sign-up events
    if (path.startsWith('/sign-up')) {
      const newSession = ctx.context.newSession;
      if (newSession) {
        logger.info('User signed up', {
          ...getSafeUserInfo(newSession.user),
          method,
          path,
        });
        await callbacks.onSignUp?.(newSession.user);
      }
      return;
    }

    // Sign-out events
    if (path.startsWith('/sign-out')) {
      logger.info('User signed out', {
        method,
        path,
      });
      await callbacks.onSignOut?.();
      return;
    }

    // OAuth callback events
    if (path.startsWith('/callback/')) {
      const provider =
        path.replace('/callback/', '').split('/')[0] ?? 'unknown';
      const newSession = ctx.context.newSession;
      if (newSession) {
        logger.info('OAuth callback completed', {
          provider,
          ...getSafeUserInfo(newSession.user),
          path,
        });
        await callbacks.onOAuthCallback?.(provider, newSession.user);
      }
      return;
    }
  };

  return {
    before: createBeforeHookLogger(),
    after: afterHook,
  };
}

/**
 * Log an authentication error.
 * Utility function for consistent auth error logging.
 */
export function logAuthError(
  message: string,
  error: unknown,
  context?: LogContext
): void {
  if (error instanceof Error) {
    logger.error(message, error, context);
  } else {
    logger.error(message, { error: String(error), ...context });
  }
}
