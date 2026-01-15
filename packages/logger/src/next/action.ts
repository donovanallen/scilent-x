/**
 * @scilent-one/logger/next - Server Action Logging
 *
 * Provides a wrapper for Next.js server actions with automatic logging.
 */

import { Logger, type LogContext } from '../logger';

const logger = new Logger({ namespace: 'action' });

export type ActionFunction<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

export interface ActionLogOptions {
  /** Log the action arguments (be careful with sensitive data) */
  logArgs?: boolean;
  /** Log the action result */
  logResult?: boolean;
  /** Additional context to include in logs */
  context?: LogContext;
}

/**
 * Wrap a server action with automatic logging.
 *
 * Features:
 * - Logs action invocation with name
 * - Measures execution duration
 * - Logs errors with stack traces
 * - Optional argument and result logging
 *
 * @example
 * ```ts
 * // actions.ts
 * 'use server';
 *
 * import { withLogging } from '@scilent-one/logger/next';
 *
 * async function createPostImpl(data: CreatePostInput) {
 *   // Implementation
 *   return { id: '123' };
 * }
 *
 * export const createPost = withLogging('posts:create', createPostImpl);
 * ```
 */
export function withLogging<TArgs extends unknown[], TResult>(
  actionName: string,
  action: ActionFunction<TArgs, TResult>,
  options: ActionLogOptions = {}
): ActionFunction<TArgs, TResult> {
  const actionLogger = logger.child({
    action: actionName,
    ...options.context,
  });

  return async (...args: TArgs): Promise<TResult> => {
    const startTime = Date.now();

    actionLogger.debug(
      'Action started',
      options.logArgs ? { args } : undefined
    );

    try {
      const result = await action(...args);
      const duration = Date.now() - startTime;

      actionLogger.info('Action completed', {
        duration,
        ...(options.logResult ? { result } : {}),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      actionLogger.error(
        'Action failed',
        error instanceof Error ? error : undefined,
        { duration }
      );

      throw error;
    }
  };
}

/**
 * Create a logging wrapper factory with default options.
 * Useful for consistent logging configuration across actions.
 *
 * @example
 * ```ts
 * const withActionLogging = createActionLogger({ logArgs: false });
 *
 * export const createPost = withActionLogging('posts:create', createPostImpl);
 * export const deletePost = withActionLogging('posts:delete', deletePostImpl);
 * ```
 */
export function createActionLogger(defaultOptions: ActionLogOptions = {}) {
  return function <TArgs extends unknown[], TResult>(
    actionName: string,
    action: ActionFunction<TArgs, TResult>,
    options: ActionLogOptions = {}
  ): ActionFunction<TArgs, TResult> {
    return withLogging(actionName, action, { ...defaultOptions, ...options });
  };
}
