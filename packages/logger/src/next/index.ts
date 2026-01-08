/**
 * @scilent-one/logger/next - Next.js Logging Utilities
 *
 * Provides middleware and server action wrappers for automatic logging.
 */

export { withRequestLogging, type MiddlewareFunction, type RequestLogContext } from './middleware.js';
export { withLogging, createActionLogger, type ActionFunction, type ActionLogOptions } from './action.js';
