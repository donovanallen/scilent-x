/**
 * Next.js Middleware with Request Logging Orchestration
 *
 * This middleware:
 * - Logs all requests with timing and request IDs
 * - Propagates request IDs via headers for distributed tracing
 * - Optimistically gates /admin/* behind a session cookie presence check
 *
 * Role enforcement (admin vs user) happens in the admin layout via
 * `auth.api.getSession` — Better Auth session validation is not Edge-safe
 * when the Prisma adapter is used, so middleware only checks cookie presence.
 */

import { withRequestLogging } from '@scilent-one/logger/next';
import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Core middleware logic wrapped with automatic request logging.
 *
 * The `withRequestLogging` wrapper:
 * - Generates unique request IDs (or uses existing x-request-id header)
 * - Logs request start at debug level
 * - Logs request completion with duration at info level
 * - Logs errors with stack traces
 * - Adds x-request-id to response headers for client-side correlation
 */
export const middleware = withRequestLogging(
  async (request: NextRequest, { requestId }) => {
    const { pathname } = request.nextUrl;

    // Optimistic auth gate for admin UI. Full role checks run in the admin layout.
    if (pathname.startsWith('/admin')) {
      const sessionCookie = getSessionCookie(request);
      if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    const response = NextResponse.next();

    // Propagate request ID for downstream logging correlation
    response.headers.set('x-request-id', requestId);

    return response;
  }
);

/**
 * Middleware matcher configuration.
 *
 * Matches all routes except:
 * - Static files (_next/static)
 * - Image optimization (_next/image)
 * - Favicon and other static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
