---
'@scilent-one/auth': minor
---

Harden Better Auth for production: derive trustedOrigins from app/Vercel URLs, set explicit session expiresIn/updateAge, enable rate limiting on auth endpoints, and scaffold optional Resend-backed password-reset/verification email that no-ops when unset.
