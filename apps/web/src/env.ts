import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Typed environment for `apps/web`.
 *
 * Required vars fail at build/boot unless `SKIP_ENV_VALIDATION=true`
 * (or `NODE_ENV=test`). Optional feature groups are present only when
 * the corresponding credentials are set — see `.env.example`.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    /** Postgres connection string (prefer a pooled URL on Vercel). */
    DATABASE_URL: z.string().url(),

    /** Better Auth signing secret — at least 32 characters. */
    BETTER_AUTH_SECRET: z.string().min(32),

    /** Canonical app origin (e.g. https://app.example.com). */
    BETTER_AUTH_URL: z.string().url(),

    /** Comma-separated user IDs treated as admins (bootstrap). */
    BETTER_AUTH_ADMIN_USER_IDS: z.string().optional(),

    /** Set automatically on Vercel. */
    VERCEL_URL: z.string().optional(),

    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .optional(),

    MUSICBRAINZ_CONTACT: z.string().min(1).optional(),

    // Spotify (OAuth + catalog) — all optional; feature gates check presence
    SPOTIFY_CLIENT_ID: z.string().optional(),
    SPOTIFY_CLIENT_SECRET: z.string().optional(),
    SPOTIFY_REDIRECT_URI: z.string().url().optional(),

    // Tidal
    TIDAL_CLIENT_ID: z.string().optional(),
    TIDAL_CLIENT_SECRET: z.string().optional(),
    TIDAL_COUNTRY_CODE: z.string().min(2).max(2).optional(),

    // Apple Music (MusicKit)
    APPLE_MUSIC_TEAM_ID: z.string().optional(),
    APPLE_MUSIC_KEY_ID: z.string().optional(),
    APPLE_MUSIC_PRIVATE_KEY: z.string().optional(),
    APPLE_MUSIC_STOREFRONT: z.string().optional(),

    // Social OAuth (disabled in auth config today; status UI only)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_CLIENT_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_ADMIN_USER_IDS: process.env.BETTER_AUTH_ADMIN_USER_IDS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    MUSICBRAINZ_CONTACT: process.env.MUSICBRAINZ_CONTACT,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
    TIDAL_CLIENT_ID: process.env.TIDAL_CLIENT_ID,
    TIDAL_CLIENT_SECRET: process.env.TIDAL_CLIENT_SECRET,
    TIDAL_COUNTRY_CODE: process.env.TIDAL_COUNTRY_CODE,
    APPLE_MUSIC_TEAM_ID: process.env.APPLE_MUSIC_TEAM_ID,
    APPLE_MUSIC_KEY_ID: process.env.APPLE_MUSIC_KEY_ID,
    APPLE_MUSIC_PRIVATE_KEY: process.env.APPLE_MUSIC_PRIVATE_KEY,
    APPLE_MUSIC_STOREFRONT: process.env.APPLE_MUSIC_STOREFRONT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
    APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
  },
  emptyStringAsUndefined: true,
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === 'true' ||
    process.env.NODE_ENV === 'test',
});
