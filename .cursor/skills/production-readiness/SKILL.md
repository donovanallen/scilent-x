---
name: production-readiness
description: Pre-deploy audit checklist for scilent-x (auth gate, env schema, security headers, images, DB migrations, CI, health, Sentry, trustedOrigins). Use before production deploys or when asked to verify launch readiness.
user-invocable: true
---

# Production readiness

Re-verify these before promoting a build to production. Source of truth plan:
`.cursor/plans/production_deployment_prep_988afef6.plan.md`. Runbook:
`docs/DEPLOYMENT.md` (platform steps remain **WS8** until checked off).

## Checklist

### Auth & gates

- [ ] Middleware cookie gate redirects unauthenticated users to `/login`
- [ ] Authenticated layout validates session server-side
- [ ] Admin routes enforce Better Auth `admin` role (not email allowlists)
- [ ] `trustedOrigins` derives from `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` / `VERCEL_URL`
- [ ] Production `BETTER_AUTH_URL` is the canonical HTTPS origin (no trailing slash)
- [ ] Preview vs Production env splits make sense for cookies / origins

### Env schema

- [ ] Required vars present: `DATABASE_URL`, `BETTER_AUTH_SECRET` (≥32), `BETTER_AUTH_URL`
- [ ] `apps/web/.env.example` matches `apps/web/src/env.ts` (no drift)
- [ ] CI uses `SKIP_ENV_VALIDATION=true` for builds without secrets
- [ ] Optional groups documented: Resend, streaming, Sentry, `DATABASE_POOL_MAX`

### Frontend hardening

- [ ] Security headers in `next.config.ts` (`X-Frame-Options`, HSTS, etc.)
- [ ] `next/image` + `images.remotePatterns` for artwork / avatars
- [ ] Segment `error.tsx` / `loading.tsx`; root `global-error.tsx` reports to Sentry when DSN set
- [ ] SEO: metadata, robots, sitemap, favicon

### Database

- [ ] Production `DATABASE_URL` is a **pooled** connection (Neon/Supabase pooler)
- [ ] Migrations exist under `packages/db/prisma/migrations`
- [ ] Migrate-on-deploy will run `pnpm db:migrate:deploy` (root alias) — **WS8 wire-up**
- [ ] Optional `DATABASE_POOL_MAX` considered for serverless (default max 5 in prod)

### CI / quality

- [ ] `.github/workflows/ci.yml` green (lint, typecheck, build, tests)
- [ ] Pending changesets for touched `packages/*` (`pnpm changeset status`)
- [ ] Prefer `/deploy-check` (or this skill + `pnpm fix` + build) before merge

### Observability

- [ ] `/api/health` returns `{ status: "ok" }` with DB latency when DB is up
- [ ] Sentry scaffold present (`instrumentation*.ts`, `sentry.*.config.ts`)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` set in Production after WS8 project create
- [ ] Source maps: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` on Vercel build env only

### Platform (WS8 — dashboard; not code)

- [ ] Vercel project: Root Directory `apps/web`, install/build from monorepo root
- [ ] Production + Preview env vars entered
- [ ] Custom domain / DNS moved
- [ ] Smoke-test: login, admin, health, DB, cookies

## Agent MCP after WS8

Once the Vercel project and Sentry org exist, enable for agents:

- **Vercel MCP** (`mcp.vercel.com`) — deployments, logs, env inspection
- **Sentry MCP** — triage production errors

Do not invent secrets in chat; read them from the dashboard / MCP.

## Related

- Command: `.cursor/commands/deploy-check.md`
- Docs: `docs/DEPLOYMENT.md`, `docs/AUTH.md`, `docs/DATABASE.mdx`
