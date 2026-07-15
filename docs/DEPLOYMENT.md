# Deployment

> **Status:** In-repo tooling for production readiness is largely complete (WS1–WS7).
> **Platform provisioning** (Vercel project / DNS / Sentry DSN / migrate-on-deploy on a
> live project) remains **deferred to WS8** — see the expanded runbook in
> [`.cursor/plans/production_deployment_prep_988afef6.plan.md`](../.cursor/plans/production_deployment_prep_988afef6.plan.md).
> Do not treat this doc as a completed go-live checklist until WS8 is done.

## What is already in the repo

| Piece                  | Where                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Env validation         | `apps/web/src/env.ts` — set `SKIP_ENV_VALIDATION=true` in CI when secrets are absent          |
| Auth hardening         | `packages/auth` — trustedOrigins, session, rate limits, optional Resend                       |
| Root CI                | `.github/workflows/ci.yml` — lint, typecheck, `turbo build --filter=web`, full tests          |
| Path-filtered coverage | `.github/workflows/test.yml` — includes `apps/web` + `harmony-engine`                         |
| Root DB aliases        | `pnpm db:generate` / `db:migrate` / `db:migrate:deploy` / `db:push` / `db:seed` / `db:studio` |
| Health check           | `GET /api/health` — DB `SELECT 1` + latency JSON                                              |
| Sentry scaffold        | `@sentry/nextjs` — env-gated; inactive until DSN vars are set                                 |
| Agent tooling          | `.cursor/skills/production-readiness`, `.cursor/commands/deploy-check.md`                     |
| Migrate-on-deploy      | Command ready (`pnpm db:migrate:deploy`) — **wire on Vercel in WS8**                          |

## Database URL (pooled for serverless)

Prefer a **pooled** `DATABASE_URL` on Vercel (Neon pooler, Supabase pooler port **6543**,
PgBouncer, etc.). Direct connections open a new pg session per invocation and hit
connection limits under concurrency.

- **App runtime:** pooled URL in Production / Preview env
- **Migrations:** some providers need a **direct** URL for DDL; if migrate fails through
  the pooler, run `pnpm db:migrate:deploy` against the direct connection string from a
  one-off job / local machine, or follow the provider’s migrate guide
- Optional: `DATABASE_POOL_MAX` (default **5** in production in `@scilent-one/db`)

## Monorepo → Vercel (deferred — WS8)

Detailed step-by-step lives in the plan (WS8). Summary:

1. **Root Directory:** `apps/web` (see `apps/web/vercel.json`)
2. **Install:** `cd ../.. && pnpm install` (monorepo root)
3. **Build (placeholder until migrate is wired):** `cd ../.. && pnpm turbo build --filter=web`
4. **Build with migrate-on-deploy (target):**

```bash
cd ../.. && pnpm db:migrate:deploy && pnpm turbo build --filter=web
```

5. **Env:** see required vs optional below
6. **Domain:** attach or move custom domain between Vercel projects (DNS often unchanged)
7. **Sentry:** create project; set `NEXT_PUBLIC_SENTRY_DSN` and/or `SENTRY_DSN` (+ org/project/token for source maps)

### Env vars (from `apps/web/.env.example`)

**Required (Production + Preview):**

| Var                  | Notes                                      |
| -------------------- | ------------------------------------------ |
| `DATABASE_URL`       | Prefer **pooled** Postgres URL             |
| `BETTER_AUTH_SECRET` | ≥32 characters (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL`    | Canonical HTTPS origin, no trailing slash  |

**Optional:**

| Var                                                   | Notes                                               |
| ----------------------------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                                 | SEO / public canonical when different from auth URL |
| `VERCEL_URL`                                          | Injected by Vercel — do not set manually            |
| `LOG_LEVEL`                                           | `fatal`…`trace`                                     |
| `MUSICBRAINZ_CONTACT`                                 | MusicBrainz User-Agent email                        |
| `BETTER_AUTH_ADMIN_USER_IDS`                          | Bootstrap admin user IDs                            |
| `RESEND_API_KEY` / `AUTH_EMAIL_FROM`                  | Password reset + verification email                 |
| Spotify / Tidal / Apple Music keys                    | Streaming catalog + OAuth link features             |
| Google / GitHub / Apple OAuth client vars             | Login providers disabled in config today            |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`               | Enable Sentry after project create                  |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Source-map upload on build                          |
| `DATABASE_POOL_MAX`                                   | Cap pg pool size (prod default 5)                   |

### Preview vs Production

- Set Preview env separately from Production
- `VERCEL_URL` is trusted via auth `trustedOrigins`
- Prefer dedicated Preview `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` for a fixed custom preview domain so cookies match

### Smoke-test (after WS8)

- [ ] `GET /api/health` → `status: "ok"`
- [ ] Sign-up / login cookie on production domain
- [ ] Admin route with admin role
- [ ] DB-backed page load (feed / profile)
- [ ] Optional: intentional error appears in Sentry when DSN set

## Local / CI builds without secrets

```bash
SKIP_ENV_VALIDATION=true pnpm turbo build --filter=web
```

Pre-deploy agent command: `/deploy-check` (see `.cursor/commands/deploy-check.md`).

## Agent MCP (after WS8)

Once the project exists, enable **Vercel MCP** and **Sentry MCP** so agents can inspect
deployments, logs, env, and production errors without pasting secrets into chat.

## Related docs

- [AUTH.md](./AUTH.md) — Better Auth config and optional Resend
- [DATABASE.mdx](./DATABASE.mdx) — Prisma / Postgres + pooled URL notes
- [INITIAL_SETUP.md](./INITIAL_SETUP.md) — local bootstrap
- Plan: expanded WS8 runbook in `.cursor/plans/production_deployment_prep_988afef6.plan.md`
- Skill: `.cursor/skills/production-readiness/SKILL.md`
