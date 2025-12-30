# Authentication (@scilent-one/auth)

This document covers the authentication setup using [Better Auth](https://www.better-auth.com/) in the scilent-one monorepo.

## Overview

The `@scilent-one/auth` package provides a unified authentication solution that:

- Supports email/password authentication
- Supports OAuth providers (Google, GitHub, Apple)
- Integrates with the existing Prisma database (`@scilent-one/db`)
- Works across multiple platforms (Next.js, React Native, etc.)
- Provides type-safe client and server utilities

## Quick Start

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create or update your `.env` file in the monorepo root (or `apps/web/.env.local` for Next.js):

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/scilent_one"

# Better Auth (required)
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers (configure as needed)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
```

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

## Package Structure

```
packages/auth/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts      # Main exports (both server & client)
    ├── server.ts     # Server-side auth configuration
    └── client.ts     # Client-side auth utilities
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

// In a Server Component
export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
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
    <div>
      <button onClick={() => signIn.social({ provider: 'google' })}>
        Sign in with Google
      </button>
      <button onClick={() => signIn.social({ provider: 'github' })}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

### Email/Password Authentication

```tsx
'use client';

import { signIn, signUp } from '@/lib/auth-client';
import { useState } from 'react';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await signUp.email({
      email,
      password,
      name,
      callbackURL: '/dashboard',
    });

    if (error) {
      console.error('Sign up failed:', error.message);
      return;
    }

    // User is automatically signed in after registration
    console.log('Signed up successfully:', data);
  };

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password (min 8 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await signIn.email({
      email,
      password,
      callbackURL: '/dashboard',
    });

    if (error) {
      console.error('Sign in failed:', error.message);
      return;
    }

    console.log('Signed in successfully:', data);
  };

  return (
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

## OAuth Provider Setup

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
4. Choose **Web application**
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy **Client ID** and **Client Secret** to your `.env`

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in application details:
   - Homepage URL: `http://localhost:3000` (or production URL)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** and generate a **Client Secret**
5. Add to your `.env`

> **Important**: For GitHub Apps (not OAuth Apps), you must enable email permission:
> Go to _Permissions and Events_ → _Account Permissions_ → _Email Addresses_ → Select "Read-Only"

### Apple

Apple Sign In requires an Apple Developer account ($99/year) and is more complex to set up.

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Create an **App ID** with Sign In with Apple capability
3. Create a **Service ID** (this is your `APPLE_CLIENT_ID`)
4. Configure domains and return URLs:
   - Development: `http://localhost:3000/api/auth/callback/apple`
   - Production: `https://yourdomain.com/api/auth/callback/apple`
5. Create a **Key** for Sign In with Apple
6. Generate a **Client Secret** (JWT) using the key

> **Note**: Apple Sign In does NOT work with `localhost` or non-HTTPS URLs. For local development, you'll need to use a tunnel service like ngrok or skip Apple testing locally.

The client secret is a JWT that must be regenerated every 6 months. See [Apple's documentation](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret) for details.

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

## Protected Routes

### Next.js Middleware/Proxy (Optimistic)

For fast, cookie-based checks (recommended for most cases):

```typescript
// middleware.ts (or proxy.ts for Next.js 16+)
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```

### Server Component (Full Validation)

For routes requiring full session validation:

```tsx
import { auth } from '@scilent-one/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return <div>Welcome to your dashboard, {session.user.name}!</div>;
}
```

## API Reference

### Server (`@scilent-one/auth/server`)

| Export                             | Description                                        |
| ---------------------------------- | -------------------------------------------------- |
| `auth`                             | Better Auth instance with all configured providers |
| `auth.api.getSession({ headers })` | Get current session                                |
| `auth.api.signInEmail({ body })`   | Sign in with email/password                        |
| `auth.api.signUpEmail({ body })`   | Register with email/password                       |
| `auth.api.signInSocial({ body })`  | Initiate OAuth sign in                             |

### Client (`@scilent-one/auth/client`)

| Export                                    | Description                   |
| ----------------------------------------- | ----------------------------- |
| `authClient`                              | Full auth client instance     |
| `useSession()`                            | React hook for session state  |
| `getSession()`                            | Async function to get session |
| `signIn.email({ email, password })`       | Sign in with email/password   |
| `signIn.social({ provider })`             | Sign in with OAuth provider   |
| `signUp.email({ email, password, name })` | Register new user             |
| `signOut()`                               | Sign out current user         |

## Troubleshooting

### "DATABASE_URL environment variable is not set"

Ensure your `.env` file contains the `DATABASE_URL` variable and restart your dev server.

### OAuth callback errors

1. Verify redirect URLs match exactly in provider console
2. Check that client ID and secret are correct
3. For Google: Ensure you've enabled the Google+ API
4. For GitHub: Ensure email permission is enabled for GitHub Apps

### Session not persisting

1. Check that `BETTER_AUTH_SECRET` is set
2. Verify cookies are being set (check browser dev tools)
3. Ensure `BETTER_AUTH_URL` matches your actual URL

### Type errors with Prisma

After schema changes, regenerate the Prisma client:

```bash
cd packages/db
pnpm db:generate
```

## Next Steps

- [ ] Implement email verification flow
- [ ] Add password reset functionality
- [ ] Create sign-in/sign-up UI pages
- [ ] Add session management UI (view/revoke sessions)
- [ ] Configure rate limiting for auth endpoints
- [ ] Add two-factor authentication (2FA) plugin

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
