/**
 * @scilent-one/logger/auth - Better Auth Logging Hooks
 *
 * Provides hooks for logging authentication events from Better Auth.
 */

import { Logger, type LogContext } from '../logger.js';

const logger = new Logger({ namespace: 'auth' });

/**
 * Better Auth hook context types.
 * These match the hook signatures from better-auth.
 */
export interface AuthHookContext {
  user?: {
    id: string;
    email?: string;
    name?: string | null;
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  [key: string]: unknown;
}

export interface AuthHookRequest {
  method: string;
  url: string;
  headers: Headers;
}

/**
 * Extract safe user info for logging (no sensitive data).
 */
function getSafeUserInfo(user?: AuthHookContext['user']): LogContext | undefined {
  if (!user) return undefined;
  return {
    userId: user.id,
    email: user.email ? `${user.email.substring(0, 3)}...` : undefined,
  };
}

/**
 * Extract request info for logging.
 */
function getRequestInfo(request?: AuthHookRequest): LogContext | undefined {
  if (!request) return undefined;
  return {
    method: request.method,
    path: new URL(request.url).pathname,
  };
}

/**
 * Better Auth hooks for logging authentication events.
 *
 * @example
 * ```ts
 * // packages/auth/src/server.ts
 * import { betterAuth } from 'better-auth';
 * import { authLoggerHooks } from '@scilent-one/logger/auth';
 *
 * export const auth = betterAuth({
 *   hooks: authLoggerHooks,
 *   // ... other config
 * });
 * ```
 */
export const authLoggerHooks = {
  /**
   * Called after a user successfully signs in.
   */
  after: [
    {
      matcher: (context: { path: string }) => context.path.startsWith('/sign-in'),
      handler: async (ctx: {
        context: AuthHookContext;
        request?: AuthHookRequest;
      }) => {
        logger.info('User signed in', {
          ...getSafeUserInfo(ctx.context.user),
          ...getRequestInfo(ctx.request),
        });
      },
    },
    {
      matcher: (context: { path: string }) => context.path.startsWith('/sign-up'),
      handler: async (ctx: {
        context: AuthHookContext;
        request?: AuthHookRequest;
      }) => {
        logger.info('User signed up', {
          ...getSafeUserInfo(ctx.context.user),
          ...getRequestInfo(ctx.request),
        });
      },
    },
    {
      matcher: (context: { path: string }) => context.path.startsWith('/sign-out'),
      handler: async (ctx: {
        context: AuthHookContext;
        request?: AuthHookRequest;
      }) => {
        logger.info('User signed out', {
          ...getSafeUserInfo(ctx.context.user),
          ...getRequestInfo(ctx.request),
        });
      },
    },
  ],
};

/**
 * Create custom auth logging hooks with additional context.
 *
 * @example
 * ```ts
 * const hooks = createAuthHooks({
 *   onSignIn: (user) => {
 *     // Custom sign-in handling
 *   },
 *   onSignOut: (user) => {
 *     // Custom sign-out handling
 *   },
 * });
 * ```
 */
export interface AuthHookCallbacks {
  onSignIn?: (user: AuthHookContext['user']) => void | Promise<void>;
  onSignUp?: (user: AuthHookContext['user']) => void | Promise<void>;
  onSignOut?: (user: AuthHookContext['user']) => void | Promise<void>;
  onError?: (error: Error, context: AuthHookContext) => void | Promise<void>;
}

export function createAuthHooks(callbacks: AuthHookCallbacks = {}) {
  return {
    after: [
      {
        matcher: (context: { path: string }) => context.path.startsWith('/sign-in'),
        handler: async (ctx: { context: AuthHookContext; request?: AuthHookRequest }) => {
          logger.info('User signed in', {
            ...getSafeUserInfo(ctx.context.user),
            ...getRequestInfo(ctx.request),
          });
          await callbacks.onSignIn?.(ctx.context.user);
        },
      },
      {
        matcher: (context: { path: string }) => context.path.startsWith('/sign-up'),
        handler: async (ctx: { context: AuthHookContext; request?: AuthHookRequest }) => {
          logger.info('User signed up', {
            ...getSafeUserInfo(ctx.context.user),
            ...getRequestInfo(ctx.request),
          });
          await callbacks.onSignUp?.(ctx.context.user);
        },
      },
      {
        matcher: (context: { path: string }) => context.path.startsWith('/sign-out'),
        handler: async (ctx: { context: AuthHookContext; request?: AuthHookRequest }) => {
          logger.info('User signed out', {
            ...getSafeUserInfo(ctx.context.user),
            ...getRequestInfo(ctx.request),
          });
          await callbacks.onSignOut?.(ctx.context.user);
        },
      },
    ],
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
