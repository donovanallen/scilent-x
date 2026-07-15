import { hasAdminRole } from '@scilent-one/auth/roles';

/**
 * Returns true when the user has the Better Auth `admin` role
 * (or an equivalent role string from the admin plugin).
 */
export function isAdminUser(
  user: { role?: string | string[] | null } | null | undefined
): boolean {
  // Normalize `undefined` so exactOptionalPropertyTypes accepts Better Auth User.
  return hasAdminRole(user?.role ?? null);
}

/** Paths that do not require a session cookie (optimistic middleware). */
export function isPublicPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return true;
  }
  // Better Auth handlers must remain reachable without a session
  if (pathname.startsWith('/api/auth')) {
    return true;
  }
  // API routes enforce auth themselves (401 JSON) — do not redirect to /login
  if (pathname.startsWith('/api/')) {
    return true;
  }
  return false;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

/**
 * Sanitize a post-authentication redirect target.
 *
 * Only same-origin, absolute-path destinations are allowed (e.g. `/reviews/new?url=...`).
 * Absolute URLs and protocol-relative paths (`//evil.com`) are rejected to avoid
 * open-redirect vulnerabilities. Returns `null` when the value is missing or unsafe,
 * letting callers fall back to a default destination.
 */
export function sanitizeInternalRedirect(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}
