/**
 * Admin access is gated by an email allowlist until a proper role
 * column / Better Auth admin plugin lands.
 *
 * Set `ADMIN_EMAILS` to a comma-separated list of emails
 * (case-insensitive), e.g. `ADMIN_EMAILS=you@example.com,ops@example.com`.
 * When unset or empty, no user is treated as admin.
 */
export function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUser(
  user: { email?: string | null } | null | undefined
): boolean {
  const email = user?.email?.trim().toLowerCase();
  if (!email) return false;
  return getAdminEmails().has(email);
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
