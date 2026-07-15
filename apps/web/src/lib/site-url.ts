/**
 * Canonical site origin for metadataBase / robots / sitemap.
 * Prefer an explicit public app URL; fall back to Vercel / local defaults.
 */
import { env } from '@/env';

export function getSiteUrl(): string {
  const explicit =
    env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    env.BETTER_AUTH_URL?.replace(/\/$/, '');
  if (explicit) return explicit;

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  return 'http://127.0.0.1:3000';
}
