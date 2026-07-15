---
'@scilent-one/db': patch
---

Allow optional `DATABASE_POOL_MAX` (and a conservative production default of 5) when constructing the Prisma `PrismaPg` adapter pool for serverless-friendly connection limits.
