/**
 * Resolve trusted origins for Better Auth CSRF / CORS checks.
 *
 * Better Auth always trusts `baseURL` / `BETTER_AUTH_URL`. We also include
 * `NEXT_PUBLIC_APP_URL` (when set) and the current Vercel deployment host so
 * preview URLs work without listing every hostname by hand.
 */

function addOrigin(origins: Set<string>, value: string | undefined): void {
  if (!value?.trim()) return;
  try {
    const url = value.includes('://') ? value : `https://${value}`;
    origins.add(new URL(url).origin);
  } catch {
    // Ignore invalid URLs — Better Auth will still trust BETTER_AUTH_URL via baseURL.
  }
}

export function getTrustedOrigins(): string[] {
  const origins = new Set<string>();

  addOrigin(origins, process.env.BETTER_AUTH_URL);
  addOrigin(origins, process.env.NEXT_PUBLIC_APP_URL);
  addOrigin(origins, process.env.VERCEL_URL);

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://127.0.0.1:3000');
    origins.add('http://localhost:3000');
  }

  return [...origins];
}
