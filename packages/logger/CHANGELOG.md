# @scilent-one/logger

## 0.2.1

### Patch Changes

- Routine dependency maintenance across the monorepo.

  - Updated all in-range dependencies to their latest minor/patch versions
    (Radix UI, Tiptap, Storybook, Vitest, Prisma, @typescript-eslint, Turbo, etc.)
  - Bumped `next` to 16.2.10, `react`/`react-dom` to 19.2.7, and `lucide-react`
    to 1.23.0 (fixed the one breaking change: the removed `Github` brand icon
    in a Storybook story)
  - Deliberately upgraded several majors after verifying no breaking impact:
    `date-fns` 3 -> 4, `pino` 9 -> 10, `zod` 3 -> 4 (updated `z.record()` calls
    to the new two-argument signature), `eslint` 9 -> 10, `chromatic` 13 -> 18,
    `vite` 7 -> 8, `@vitejs/plugin-react` 5 -> 6, `vite-plugin-svgr` 4 -> 5,
    `p-retry` 6 -> 8 (updated `onFailedAttempt` to the new `RetryContext` shape),
    `@types/node` 25 -> 26, `dotenv` 16 -> 17, `isomorphic-dompurify` 2 -> 3,
    `html-react-parser` 5 -> 6, and `eslint-import-resolver-typescript` 3 -> 4
  - Deferred the TypeScript 5.9 -> 6.0 major upgrade; see `docs/TODO.md` for
    the reason (deprecated `downlevelIteration` compiler option breaks the
    shared tsconfig base repo-wide)

## 0.2.0

### Minor Changes

- 01f7fde: Add `@scilent-one/logger` package - structured logging infrastructure for scilent-one applications.

  ### Features
  - **Core Logger** (`@scilent-one/logger`)
    - Pino-based structured logging with namespace support
    - Pretty printing in development, JSON in production
    - Configurable via `LOG_LEVEL` environment variable
    - `Logger` class, `createLogger()`, and `logError()` utilities
  - **Next.js Integration** (`@scilent-one/logger/next`)
    - `withRequestLogging()` - Middleware wrapper with automatic request logging and request ID tracking
    - `withLogging()` - Server action wrapper for automatic action logging with duration measurement
    - `createActionLogger()` - Factory for consistent logging configuration
  - **Better Auth Hooks** (`@scilent-one/logger/auth`)
    - `authLoggerHooks` - Pre-configured hooks for sign-in, sign-up, and sign-out events
    - `createAuthHooks()` - Factory for custom auth event callbacks
    - `logAuthError()` - Utility for auth error logging

  ### Usage

  ```typescript
  // Basic logging
  import { createLogger } from '@scilent-one/logger';
  const logger = createLogger('api:users');
  logger.info('User created', { userId: '123' });

  // Middleware
  import { withRequestLogging } from '@scilent-one/logger/next';
  export const middleware = withRequestLogging(
    async (request, { requestId }) => {
      /* ... */
    }
  );

  // Server actions
  import { withLogging } from '@scilent-one/logger/next';
  export const createPost = withLogging('posts:create', createPostImpl);

  // Auth hooks
  import { authLoggerHooks } from '@scilent-one/logger/auth';
  export const auth = betterAuth({ hooks: authLoggerHooks });
  ```

### Patch Changes

- d0acd8a: Adds logging to Auth flow and Auth, DB packages
