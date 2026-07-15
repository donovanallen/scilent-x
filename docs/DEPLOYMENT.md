# Deployment

> **Status:** In-repo tooling and CI are in progress. **Platform provisioning
> (Vercel / DNS / Sentry DSN / migrate-on-deploy on a live project) is deferred**
> to workstream **WS8 — Platform provisioning** in
> [`.cursor/plans/production_deployment_prep_988afef6.plan.md`](../.cursor/plans/production_deployment_prep_988afef6.plan.md).
> Do not treat this doc as a completed go-live checklist until WS8 is done.

## What is already in the repo

| Piece                  | Where                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Env validation         | `apps/web/src/env.ts` — set `SKIP_ENV_VALIDATION=true` in CI when secrets are absent |
| Auth hardening         | `packages/auth` — trustedOrigins, session, rate limits, optional Resend              |
| Root CI                | `.github/workflows/ci.yml` — lint, typecheck, `turbo build --filter=web`, full tests |
| Path-filtered coverage | `.github/workflows/test.yml` — includes `apps/web` + `harmony-engine`                |
| DB migrate script      | `pnpm db:migrate:deploy` (packages/db) — **wire on Vercel in WS8**                   |

## Monorepo → Vercel (deferred — WS8)

When creating the project (do this in the Vercel dashboard / CLI later):

1. **Root Directory:** `apps/web`
2. **Install:** `pnpm install` (from repo root; Vercel monorepo install usually runs at root when configured)
3. **Build:** from the monorepo perspective, prefer `pnpm turbo build --filter=web` (Turbo already runs `^db:generate` via `turbo.json`)
4. **Env (Production + Preview):** copy required keys from `apps/web/.env.example`:
   - `DATABASE_URL` (pooled Postgres URL for serverless)
   - `BETTER_AUTH_SECRET` (≥32 chars)
   - `BETTER_AUTH_URL` (canonical HTTPS origin)
   - Optional: `NEXT_PUBLIC_APP_URL`, streaming keys, `RESEND_API_KEY`, `AUTH_EMAIL_FROM`
5. **Migrate-on-deploy:** run `pnpm db:migrate:deploy` as part of the production build command (or a Vercel install/build hook) so schema ships with the code that needs it — **not configured yet**
6. **Domain / DNS:** attach the custom domain; if the DNS already points at Vercel, moving the domain between projects is usually enough
7. **Sentry:** create a project and set DSN env vars after in-repo scaffolding (WS6); DSN entry itself is WS8

Placeholder build command for later (do not rely on this until WS8):

```bash
pnpm db:migrate:deploy && pnpm turbo build --filter=web
```

(Adjust working directory / `cd` based on whether Vercel’s Root Directory is `apps/web` or the repo root.)

## Preview deploys

- Set Preview env vars separately from Production.
- `VERCEL_URL` is injected by Vercel; auth `trustedOrigins` also trusts that host.
- Prefer a dedicated Preview `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` when cookies must match a fixed custom preview domain.

## Local / CI builds without secrets

```bash
SKIP_ENV_VALIDATION=true pnpm turbo build --filter=web
```

## Related docs

- [AUTH.md](./AUTH.md) — Better Auth config and optional Resend
- [DATABASE.mdx](./DATABASE.mdx) — Prisma / Postgres
- [INITIAL_SETUP.md](./INITIAL_SETUP.md) — local bootstrap
- Plan: WS8 checklist in `.cursor/plans/production_deployment_prep_988afef6.plan.md`
