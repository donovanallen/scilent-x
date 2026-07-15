/**
 * Next.js Middleware with Request Logging + optimistic auth gate.
 *
 * Cookie presence is checked here for UX (redirect to /login). Full session
 * validation happens in the authenticated layout / API handlers.
 * Role enforcement (admin vs user) happens in the admin layout via
 * `auth.api.getSession` — Better Auth session validation is not Edge-safe
 * when the Prisma adapter is used, so middleware only checks cookie presence.
 */

import { withRequestLogging } from '@scilent-one/logger/next';
import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

import {
  isAdminPath,
  isPublicPath,
  sanitizeInternalRedirect,
} from '@/lib/auth-guards';

export const middleware = withRequestLogging(
  async (request: NextRequest, { requestId }) => {
    const { pathname, search } = request.nextUrl;

    if (!isPublicPath(pathname)) {
      const sessionCookie = getSessionCookie(request);

      if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        const redirectTarget = sanitizeInternalRedirect(`${pathname}${search}`);
        if (redirectTarget) {
          loginUrl.searchParams.set('redirect', redirectTarget);
        }
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.headers.set('x-request-id', requestId);
        return redirectResponse;
      }
    }

    // Forward pathname so server layouts can rebuild a safe redirect target
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    if (isAdminPath(pathname)) {
      requestHeaders.set('x-admin-path', '1');
    }

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set('x-request-id', requestId);
    return response;
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
