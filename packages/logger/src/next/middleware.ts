/**
 * @scilent-one/logger/next - Middleware Request Logging
 *
 * Provides a wrapper for Next.js middleware to automatically log requests.
 */

import type { NextRequest, NextResponse } from 'next/server';
import { Logger, type LogContext } from '../logger.js';

const logger = new Logger({ namespace: 'middleware' });

export interface RequestLogContext extends LogContext {
  requestId: string;
  method: string;
  path: string;
  userAgent?: string | undefined;
}

/**
 * Generate a unique request ID.
 * Uses crypto.randomUUID if available, falls back to timestamp-based ID.
 */
function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract relevant request information for logging.
 */
function getRequestContext(request: NextRequest): RequestLogContext {
  const requestId = request.headers.get('x-request-id') ?? generateRequestId();
  
  return {
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') ?? undefined,
  };
}

export type MiddlewareFunction = (
  request: NextRequest,
  context: { requestId: string }
) => Promise<NextResponse | Response | void> | NextResponse | Response | void;

/**
 * Wrap Next.js middleware with automatic request logging.
 *
 * Features:
 * - Generates or extracts request IDs
 * - Logs request start and completion
 * - Logs errors with stack traces
 * - Measures request duration
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { withRequestLogging } from '@scilent-one/logger/next';
 *
 * export const middleware = withRequestLogging(async (request, { requestId }) => {
 *   // Your middleware logic here
 *   // requestId is available for correlation
 * });
 * ```
 */
export function withRequestLogging(
  handler: MiddlewareFunction
): (request: NextRequest) => Promise<NextResponse | Response | void> {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const context = getRequestContext(request);
    const childLogger = logger.child({ requestId: context.requestId });

    childLogger.debug('Request started', {
      method: context.method,
      path: context.path,
    });

    try {
      const response = await handler(request, { requestId: context.requestId });
      const duration = Date.now() - startTime;

      childLogger.info('Request completed', {
        method: context.method,
        path: context.path,
        duration,
        status: response instanceof Response ? response.status : undefined,
      });

      // Add request ID to response headers for tracing
      if (response instanceof Response) {
        const headers = new Headers(response.headers);
        headers.set('x-request-id', context.requestId);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        }) as NextResponse;
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      childLogger.error('Request failed', error instanceof Error ? error : undefined, {
        method: context.method,
        path: context.path,
        duration,
      });

      throw error;
    }
  };
}
