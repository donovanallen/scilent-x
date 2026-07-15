/**
 * Canonical site origin for metadataBase / robots / sitemap.
 * Prefer an explicit public app URL; fall back to Vercel / local defaults.
 */
export function getSiteUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.BETTER_AUTH_URL?.replace(/\/$/, '');
  if (explicit) return explicit;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  return 'http://127.0.0.1:3000';
}
