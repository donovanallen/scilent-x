# Authentication (@scilent-one/auth)

This document covers the authentication setup using [Better Auth](https://www.better-auth.com/) in the scilent-one monorepo.

## Overview

The `@scilent-one/auth` package provides a unified authentication solution that:

- Supports **email/password** authentication (primary login path today)
- Links **streaming accounts** (Spotify, Tidal) via Better Auth `genericOAuth` — not social login
- Integrates with Prisma (`@scilent-one/db`) and Next.js cookies
- Enforces **trusted origins**, **session expiry**, and **rate limiting** for production
- Optionally sends verification / password-reset email via **Resend** when `RESEND_API_KEY` is set

**Not enabled:** Google / GitHub / Apple social login. Env vars and admin status UI may still list them; the Better Auth `socialProviders` block remains commented out. See [Social login (disabled)](#social-login-disabled).

## Quick Start

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create or update `apps/web/.env.local` (canonical template: `apps/web/.env.example`):

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/scilent_x?schema=public"

# Better Auth (required)
BETTER_AUTH_SECRET="your-secret-here-at-least-32-chars!!"
BETTER_AUTH_URL="http://127.0.0.1:3000"
# Optional bootstrap admin IDs (comma-separated) before a seeded admin exists
# BETTER_AUTH_ADMIN_USER_IDS=

# Optional public app URL (also added to trustedOrigins when set)
# NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"

# Streaming OAuth — account linking (optional)
# SPOTIFY_CLIENT_ID=
# SPOTIFY_CLIENT_SECRET=
# SPOTIFY_REDIRECT_URI=
# TIDAL_CLIENT_ID=
# TIDAL_CLIENT_SECRET=

# Auth email via Resend (optional — password reset / verification)
# RESEND_API_KEY=
# AUTH_EMAIL_FROM="Scilent <noreply@yourdomain.com>"
```

Required vars are validated at Next.js build/boot by `apps/web/src/env.ts`
(`@t3-oss/env-nextjs` + Zod). Set `SKIP_ENV_VALIDATION=true` only for tooling
that must run without secrets (e.g. CI builds without a real DB).

Generate a secret key:

```bash
openssl rand -base64 32
```

### 3. Run Database Migration

```bash
cd packages/db
pnpm db:generate  # Regenerate Prisma client
pnpm db:migrate   # Apply migrations
```

### 4. Start Development Server

```bash
pnpm dev
```

## Production hardening (current defaults)

Configured in `packages/auth/src/server.ts`:

| Concern            | Behavior                                                                                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseURL` / secret | `BETTER_AUTH_URL` + `BETTER_AUTH_SECRET` (secret required in production)                                                                                                                                                                             |
| `trustedOrigins`   | Origins from `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `VERCEL_URL`, plus localhost in non-prod (`packages/auth/src/origins.ts`)                                                                                                                     |
| Session            | `expiresIn` = 7 days; `updateAge` = 1 day (rolling refresh)                                                                                                                                                                                          |
| Rate limit         | Enabled everywhere; default 100 req / 60s; stricter rules for sign-in / sign-up / password reset / verification                                                                                                                                      |
| Email              | `sendResetPassword` + `sendVerificationEmail` always registered; deliver via Resend when `RESEND_API_KEY` is set, otherwise no-op with a warning log. `requireEmailVerification` stays **false** until you intentionally enable it after email works |

## Package Structure

```
packages/auth/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts      # Main exports (both server & client)
    ├── server.ts     # Server-side auth configuration
    ├── client.ts     # Client-side auth utilities
    ├── email.ts      # Optional Resend delivery
    ├── origins.ts    # trustedOrigins derivation
    └── roles.ts      # Admin role helpers
```

## Usage

### Server-Side (API Routes, Server Components, Server Actions)

```typescript
import { auth } from '@scilent-one/auth/server';
import { headers } from 'next/headers';

// Get current session
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}
```

### Client-Side (React Components)

```tsx
'use client';

import { useSession, signIn, signOut } from '@/lib/auth-client';

export function AuthButton() {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return <button disabled>Loading...</button>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (session) {
    return (
      <div>
        <span>Signed in as {session.user.email}</span>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        signIn.email({ email: 'you@example.com', password: '••••••••' })
      }
    >
      Sign in
    </button>
  );
}
```

### Email/Password Authentication

Use `signUp.email` / `signIn.email` from the auth client. Minimum password length is 8 characters.

### Password reset & email verification (optional Resend)

1. Set `RESEND_API_KEY` (and preferably `AUTH_EMAIL_FROM` with a verified domain).
2. Password-reset emails go out via `sendResetPassword`.
3. Verification emails send on sign-up when Resend is configured (`sendOnSignUp`).
4. When ready to require verified emails before sign-in, set `requireEmailVerification: true` in `server.ts`.

Without Resend, reset/verification requests still succeed from Better Auth’s perspective but **no email is delivered** (server logs a warning).

## Social login (disabled)

Google / GitHub / Apple **login** is not configured. To enable later:

1. Uncomment `socialProviders` in `packages/auth/src/server.ts`
2. Set the corresponding client ID/secret env vars
3. Register callback URLs (`/api/auth/callback/<provider>`) in each console
4. Add `https://appleid.apple.com` to trusted origins if enabling Apple

Streaming OAuth (Spotify/Tidal) for **account linking** is separate and already live via `genericOAuth`.

<details>
<summary>Historical provider setup notes (when re-enabling social login)</summary>

### Google

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client ID (Web)
2. Redirect URIs: `http://localhost:3000/api/auth/callback/google` / production equivalent

### GitHub

1. [GitHub OAuth Apps](https://github.com/settings/developers)
2. Callback: `http://localhost:3000/api/auth/callback/github`

### Apple

Requires an Apple Developer account; does not work with plain `localhost` (use HTTPS / tunnel). See [Apple’s docs](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret).

</details>

## Database Schema

Better Auth uses the following tables (defined in `packages/db/prisma/schema.prisma`):

| Table           | Description                                      |
| --------------- | ------------------------------------------------ |
| `users`         | Core user information (email, name, image, etc.) |
| `accounts`      | OAuth and credential accounts linked to users    |
| `sessions`      | Active user sessions                             |
| `verifications` | Email verification and password reset tokens     |

### Regenerating Schema

If you add Better Auth plugins that require additional tables, regenerate the schema:

```bash
cd packages/auth
pnpm generate  # Runs Better Auth CLI to update Prisma schema
cd ../db
pnpm db:generate
pnpm db:migrate
```

## Admin plugin & impersonation

Better Auth's [admin plugin](https://www.better-auth.com/docs/plugins/admin) is enabled in
`@scilent-one/auth`. It adds `role` / ban fields on `users` and `impersonatedBy` on `sessions`.

- **Seeded admin:** run `pnpm --filter @scilent-one/db db:seed`, then sign in as
  `admin@scilent.local` (default password `password123`, or `SEED_USER_PASSWORD`).
- **Set role:** Admin → Users → Make admin / Revoke admin (`authClient.admin.setRole`).
  You cannot revoke your own admin role or demote the last remaining admin.
- **Impersonate:** Admin → Users → Impersonate. An amber banner lets you stop and restore the
  admin session (`authClient.admin.stopImpersonating()`).
- **Bootstrap without seed:** set `BETTER_AUTH_ADMIN_USER_IDS` to a comma-separated list of user IDs.

### Auth & middleware considerations

| Layer                                     | What it does                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Middleware (`apps/web/src/middleware.ts`) | Optimistic: redirects `/admin/*` to login when no session cookie. Does **not** check role (Edge + Prisma).   |
| Admin layout                              | Full `auth.api.getSession` + `hasAdminRole` — non-admins (including impersonated users) are redirected home. |
| Better Auth admin API                     | Server-side permission checks on impersonate / ban / etc. Admins cannot impersonate other admins by default. |
| Impersonation banner                      | Shown while `session.session.impersonatedBy` is set; stop restores the admin cookie session.                 |

## Protected Routes

### Next.js Middleware (Optimistic)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```

### Server Component (Full Validation)

```tsx
import { auth } from '@scilent-one/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return <div>Welcome to your dashboard, {session.user.name}!</div>;
}
```

## API Reference

### Server (`@scilent-one/auth/server`)

| Export                             | Description                  |
| ---------------------------------- | ---------------------------- |
| `auth`                             | Better Auth instance         |
| `auth.api.getSession({ headers })` | Get current session          |
| `auth.api.signInEmail({ body })`   | Sign in with email/password  |
| `auth.api.signUpEmail({ body })`   | Register with email/password |

### Client (`@scilent-one/auth/client`)

| Export                                    | Description                   |
| ----------------------------------------- | ----------------------------- |
| `authClient`                              | Full auth client instance     |
| `useSession()`                            | React hook for session state  |
| `getSession()`                            | Async function to get session |
| `signIn.email({ email, password })`       | Sign in with email/password   |
| `signUp.email({ email, password, name })` | Register new user             |
| `signOut()`                               | Sign out current user         |

## Troubleshooting

### "DATABASE_URL environment variable is not set"

Ensure your `.env` file contains the `DATABASE_URL` variable and restart your dev server.

### Auth email never arrives

1. Confirm `RESEND_API_KEY` is set in the environment that serves `/api/auth/*`
2. Verify `AUTH_EMAIL_FROM` uses a domain verified in Resend
3. Check server logs for `Auth email skipped — RESEND_API_KEY not set`

### Session not persisting

1. Check that `BETTER_AUTH_SECRET` is set (≥32 characters)
2. Verify cookies are being set (browser DevTools)
3. Ensure `BETTER_AUTH_URL` matches the origin you use in the browser (prefer `127.0.0.1` locally)
4. Confirm the request origin is in `trustedOrigins` (derived from auth/app/Vercel URL)

### Type errors with Prisma

```bash
cd packages/db
pnpm db:generate
```

## Next Steps

- [ ] Turn on `requireEmailVerification` once Resend + `AUTH_EMAIL_FROM` are production-ready
- [ ] Build password-reset / verify-email UI against Better Auth client helpers
- [ ] Session management UI (view/revoke sessions)
- [ ] Optional: re-enable social login providers
- [ ] Optional: two-factor authentication (2FA) plugin

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
