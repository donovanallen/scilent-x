---
"@scilent-one/logger": minor
---

Add `@scilent-one/logger` package - structured logging infrastructure for scilent-one applications.

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
export const middleware = withRequestLogging(async (request, { requestId }) => { /* ... */ });

// Server actions
import { withLogging } from '@scilent-one/logger/next';
export const createPost = withLogging('posts:create', createPostImpl);

// Auth hooks
import { authLoggerHooks } from '@scilent-one/logger/auth';
export const auth = betterAuth({ hooks: authLoggerHooks });
```
