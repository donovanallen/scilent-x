---
"@scilent-one/logger": minor
---

Add `@scilent-one/logger` package with pino-based structured logging infrastructure:

- Core Logger class with namespace support and request ID tracking
- Next.js middleware wrapper (`withRequestLogging`) for automatic request logging
- Server action wrapper (`withLogging`) for automatic action logging
- Better Auth hooks (`authLoggerHooks`) for auth event logging
- Pretty printing in development, JSON in production
- Configurable via `LOG_LEVEL` environment variable
