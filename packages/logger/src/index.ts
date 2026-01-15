/**
 * @scilent-one/logger - Structured Logging Infrastructure
 *
 * Provides pino-based structured logging for scilent-one applications
 * with support for Next.js middleware, server actions, and Better Auth.
 *
 * @example
 * ```ts
 * // Basic usage
 * import { Logger, logError, createLogger } from '@scilent-one/logger';
 *
 * const logger = createLogger('api:users');
 * logger.info('User created', { userId: '123' });
 *
 * // Error logging
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   logError('Operation failed', error, { userId: '123' });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Next.js middleware
 * import { withRequestLogging } from '@scilent-one/logger/next';
 *
 * export const middleware = withRequestLogging(async (request, { requestId }) => {
 *   // Your middleware logic
 * });
 * ```
 *
 * @example
 * ```ts
 * // Server actions
 * import { withLogging } from '@scilent-one/logger/next';
 *
 * export const createPost = withLogging('posts:create', async (data) => {
 *   // Action implementation
 * });
 * ```
 *
 * @example
 * ```ts
 * // Better Auth hooks
 * import { authLoggerHooks } from '@scilent-one/logger/auth';
 *
 * export const auth = betterAuth({
 *   hooks: authLoggerHooks,
 * });
 * ```
 */

export {
  Logger,
  logger,
  logError,
  createLogger,
  type LogLevel,
  type LogContext,
  type LoggerOptions,
} from './logger';
