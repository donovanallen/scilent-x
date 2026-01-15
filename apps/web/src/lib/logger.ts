/**
 * Logger instances for the web application.
 *
 * Provides pre-configured loggers for different contexts.
 * Each logger includes the appropriate namespace for filtering logs.
 */

import { createLogger } from '@scilent-one/logger';

/**
 * Logger for API route handlers.
 * Namespace: api
 */
export const apiLogger = createLogger('api');

/**
 * Logger for authentication-related operations.
 * Namespace: auth
 */
export const authLogger = createLogger('auth');

/**
 * Logger for server actions.
 * Namespace: action
 */
export const actionLogger = createLogger('action');

/**
 * Logger for server components and data fetching.
 * Namespace: server
 */
export const serverLogger = createLogger('server');

/**
 * Create a namespaced API logger for a specific route.
 *
 * @example
 * ```ts
 * const logger = createApiLogger('posts');
 * logger.info('Post created', { postId: '123' });
 * // Output: { namespace: 'api:posts', msg: 'Post created', postId: '123' }
 * ```
 */
export function createApiLogger(route: string) {
  return createLogger(`api:${route}`);
}

/**
 * Create a namespaced action logger for a specific domain.
 *
 * @example
 * ```ts
 * const logger = createActionLogger('harmony');
 * logger.info('Lookup completed', { gtin: '...' });
 * // Output: { namespace: 'action:harmony', msg: 'Lookup completed', gtin: '...' }
 * ```
 */
export function createActionDomainLogger(domain: string) {
  return createLogger(`action:${domain}`);
}
