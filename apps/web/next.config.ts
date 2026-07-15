import createMDX from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

// Validate env at build time (skipped when SKIP_ENV_VALIDATION=true or NODE_ENV=test).
import './src/env';

const sourceDateEpoch = Number(process.env.SOURCE_DATE_EPOCH);
const buildTimestamp =
  process.env.VERCEL_DEPLOYMENT_CREATED_AT ||
  (Number.isFinite(sourceDateEpoch) && sourceDateEpoch > 0
    ? new Date(sourceDateEpoch * 1000).toISOString()
    : new Date().toISOString());

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  devIndicators: false,
  env: {
    // A stable timestamp captured once per build, not once per status request.
    SCILENT_BUILD_TIME: buildTimestamp,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@scilent-one/ui',
      '@scilent-one/scilent-ui',
    ],
  },
  images: {
    remotePatterns: [
      // Spotify CDN
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: 'image-cdn-ak.spotifycdn.com' },
      { protocol: 'https', hostname: 'image-cdn-fa.spotifycdn.com' },
      // Apple Music / iTunes artwork
      { protocol: 'https', hostname: '**.mzstatic.com' },
      // Tidal
      { protocol: 'https', hostname: 'resources.tidal.com' },
      { protocol: 'https', hostname: '**.tidal.com' },
      // Cover Art Archive (MusicBrainz)
      { protocol: 'https', hostname: 'coverartarchive.org' },
      { protocol: 'https', hostname: '**.coverartarchive.org' },
      // OAuth / user avatars (common hosts)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

const withMDX = createMDX({
  options: {},
});

const config = withMDX(nextConfig);

/**
 * Wrap with Sentry always so instrumentation hooks stay consistent.
 * Source-map upload only runs when SENTRY_AUTH_TOKEN (+ org/project) are set;
 * runtime reporting stays off until NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN exist.
 */
const sentryOptions = {
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  ...(process.env.SENTRY_ORG ? { org: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT
    ? { project: process.env.SENTRY_PROJECT }
    : {}),
  ...(process.env.SENTRY_AUTH_TOKEN
    ? { authToken: process.env.SENTRY_AUTH_TOKEN }
    : {}),
};

export default withSentryConfig(config, sentryOptions);
