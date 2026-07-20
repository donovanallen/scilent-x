---
'@scilent-one/db': patch
---

Support production admin seeding via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. In production, `db:seed` creates only the admin account and requires a strong password (no mock users or default credentials).
