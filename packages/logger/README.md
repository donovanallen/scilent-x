# @scilent-one/logger

Structured logging infrastructure for scilent-one applications, built on [pino](https://github.com/pinojs/pino).

## Features

- 🪵 **Structured JSON logging** in production
- 🎨 **Pretty printing** in development (via optional `pino-pretty`)
- 🔗 **Request ID tracking** for distributed tracing
- ⚡ **Next.js integration** with middleware and server action wrappers
- 🔐 **Better Auth hooks** for authentication event logging
- 📊 **Configurable log levels** via `LOG_LEVEL` environment variable

## Installation

```bash
pnpm add @scilent-one/logger
```

For pretty-printed logs in development:

```bash
pnpm add -D pino-pretty
```

## Usage

### Basic Logging

```typescript
import { Logger, createLogger, logError } from '@scilent-one/logger';

// Create a namespaced logger
const logger = createLogger('api:users');

// Log at different levels
logger.trace('Detailed trace info');
logger.debug('Debug information', { userId: '123' });
logger.info('User created', { userId: '123', email: 'user@example.com' });
logger.warn('Rate limit approaching', { remaining: 10 });
logger.error('Failed to create user', new Error('Database connection failed'));
logger.fatal('Critical system failure', new Error('Out of memory'));

// Using the convenience error logger
try {
  await riskyOperation();
} catch (error) {
  logError('Operation failed', error, { context: 'additional info' });
}
```

### Child Loggers

Create child loggers to add context that persists across log calls:

```typescript
const logger = createLogger('api');
const requestLogger = logger.child({ requestId: 'abc-123' });

requestLogger.info('Processing request'); // includes requestId in all logs
requestLogger.info('Request complete');
```

### Next.js Middleware

Wrap your middleware with automatic request logging:

```typescript
// middleware.ts
import { withRequestLogging } from '@scilent-one/logger/next';

export const middleware = withRequestLogging(async (request, { requestId }) => {
  // requestId is available for correlation
  // Logs are automatically generated for request start/complete/error
  
  // Your middleware logic here
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

Features:
- Generates or extracts `x-request-id` header
- Logs request start, completion, and errors
- Measures request duration
- Adds request ID to response headers

### Server Actions

Wrap server actions with automatic logging:

```typescript
// actions.ts
'use server';

import { withLogging } from '@scilent-one/logger/next';

async function createPostImpl(data: CreatePostInput) {
  // Implementation
  return { id: '123' };
}

export const createPost = withLogging('posts:create', createPostImpl);

// With options
export const deletePost = withLogging(
  'posts:delete',
  deletePostImpl,
  {
    logArgs: true,    // Log action arguments (careful with sensitive data)
    logResult: true,  // Log action result
    context: { module: 'posts' },
  }
);
```

For consistent configuration across actions:

```typescript
import { createActionLogger } from '@scilent-one/logger/next';

const withActionLogging = createActionLogger({ logArgs: false });

export const createPost = withActionLogging('posts:create', createPostImpl);
export const updatePost = withActionLogging('posts:update', updatePostImpl);
```

### Better Auth Integration

Add logging hooks to Better Auth:

```typescript
// packages/auth/src/server.ts
import { betterAuth } from 'better-auth';
import { authLoggerHooks } from '@scilent-one/logger/auth';

export const auth = betterAuth({
  hooks: authLoggerHooks,
  // ... other config
});
```

For custom callbacks:

```typescript
import { createAuthHooks } from '@scilent-one/logger/auth';

const hooks = createAuthHooks({
  onSignIn: async (user) => {
    // Custom sign-in handling (e.g., analytics)
  },
  onSignUp: async (user) => {
    // Custom sign-up handling
  },
  onSignOut: async (user) => {
    // Custom sign-out handling
  },
});

export const auth = betterAuth({
  hooks,
});
```

## Configuration

### Log Levels

Set the log level via environment variable:

```bash
# Options: trace, debug, info, warn, error, fatal
LOG_LEVEL=debug pnpm dev
```

Default levels:
- **Development**: `debug`
- **Production**: `info`

### Pretty Printing

In development, logs are automatically pretty-printed if `pino-pretty` is installed:

```
[12:34:56.789] INFO (api:users): User created
    userId: "123"
    email: "user@example.com"
```

In production, logs are output as JSON for structured log aggregation:

```json
{"level":"info","time":"2024-01-08T12:34:56.789Z","namespace":"api:users","userId":"123","msg":"User created"}
```

## API Reference

### Core Exports (`@scilent-one/logger`)

| Export | Description |
|--------|-------------|
| `Logger` | Main logger class with namespace support |
| `logger` | Default logger instance |
| `createLogger(namespace, context?)` | Create a namespaced logger |
| `logError(message, error, context?)` | Log an error with consistent formatting |

### Next.js Exports (`@scilent-one/logger/next`)

| Export | Description |
|--------|-------------|
| `withRequestLogging(handler)` | Wrap middleware with request logging |
| `withLogging(name, action, options?)` | Wrap server action with logging |
| `createActionLogger(options)` | Create action logger factory |

### Auth Exports (`@scilent-one/logger/auth`)

| Export | Description |
|--------|-------------|
| `authLoggerHooks` | Pre-configured Better Auth hooks |
| `createAuthHooks(callbacks)` | Create custom auth hooks |
| `logAuthError(message, error, context?)` | Log auth errors |

## Future Enhancements

The logger is designed to support future extensions:

- **Database persistence**: Store logs in PostgreSQL via a `Log` model
- **Admin dashboard**: Stream logs via SSE for real-time monitoring
- **Log aggregation**: Integration with external services (Datadog, etc.)

The structured JSON output makes it straightforward to pipe logs to any aggregation service.
