# Deployment

> **Status:** In-repo tooling for production readiness is largely complete (WS1–WS7).
> **Platform provisioning** (isolated beta Vercel project and database / beta DNS /
> Sentry DSN / migrate-on-deploy) remains **deferred to WS8** — see the expanded runbook in
> [`.cursor/plans/production_deployment_prep_988afef6.plan.md`](../.cursor/plans/production_deployment_prep_988afef6.plan.md).
> Do not treat this doc as a completed beta-launch checklist until WS8 is done.

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

## Rollout topology

The beta rollout intentionally uses two isolated stacks:

| Stack               | Vercel project                            | Domain                          | Database                                    |
| ------------------- | ----------------------------------------- | ------------------------------- | ------------------------------------------- |
| Existing production | Existing project (leave unchanged)        | `https://scilentmusic.com`      | Existing Prisma-managed PostgreSQL database |
| New beta            | New project imported from this repository | `https://beta.scilentmusic.com` | Separate Prisma-managed PostgreSQL database |

The new project's Vercel **Production** environment serves the beta hostname. Pull
requests still use Vercel **Preview** environments. Do not attach or move
`scilentmusic.com` during the beta rollout.

## Database isolation and connection URL

Provision a separate PostgreSQL database in Prisma for the beta project. The beta
Vercel project must receive only the beta connection string; never copy the existing
site's `DATABASE_URL` into the beta project. Beta migrations, seed data, test users,
and destructive testing must remain isolated from existing production.

Use a PostgreSQL connection string compatible with the repo's `@prisma/adapter-pg`
client and suitable for Vercel/serverless workloads. Where the database provider
offers pooled/runtime and direct/migration URLs, use them as follows:

- **Beta app runtime:** beta serverless/runtime URL in the new project's Production env
- **Migrations:** some providers need a **direct** URL for DDL; if migrate fails through
  the pooler, run `pnpm db:migrate:deploy` against the direct connection string from a
  one-off job / local machine, or follow the provider’s migrate guide
- Optional: `DATABASE_POOL_MAX` (default **5** in production in `@scilent-one/db`)

## Monorepo → separate beta Vercel project (deferred — WS8)

Detailed step-by-step lives in the plan (WS8). Summary:

1. Leave the current `scilentmusic.com` Vercel project unchanged.
2. Import this repository as a **new** Vercel project.
3. **Root Directory:** `apps/web` (see `apps/web/vercel.json`)
4. **Install:** `cd ../.. && pnpm install` (monorepo root)
5. **Build (placeholder until the beta database is ready):** `cd ../.. && pnpm turbo build --filter=web`
6. **Build with beta migrate-on-deploy (target):**

```bash
cd ../.. && pnpm db:migrate:deploy && pnpm turbo build --filter=web
```

1. **Env:** set beta-specific Production and Preview variables; see below
2. **Domain:** attach `beta.scilentmusic.com` to the new project without moving the apex domain
3. **Sentry:** create project; set `NEXT_PUBLIC_SENTRY_DSN` and/or `SENTRY_DSN` (+ org/project/token for source maps)

### Env vars (from `apps/web/.env.example`)

**Required for the beta project's Production environment:**

| Var                  | Notes                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`       | Separate beta PostgreSQL database; never the existing site's database |
| `BETTER_AUTH_SECRET` | Beta-specific secret, ≥32 characters (`openssl rand -base64 32`)      |
| `BETTER_AUTH_URL`    | `https://beta.scilentmusic.com`                                       |

**Optional:**

| Var                                                   | Notes                                    |
| ----------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                                 | Set to `https://beta.scilentmusic.com`   |
| `VERCEL_URL`                                          | Injected by Vercel — do not set manually |
| `LOG_LEVEL`                                           | `fatal`…`trace`                          |
| `MUSICBRAINZ_CONTACT`                                 | MusicBrainz User-Agent email             |
| `BETTER_AUTH_ADMIN_USER_IDS`                          | Bootstrap admin user IDs                 |
| `RESEND_API_KEY` / `AUTH_EMAIL_FROM`                  | Password reset + verification email      |
| Spotify / Tidal / Apple Music keys                    | Streaming catalog + OAuth link features  |
| Google / GitHub / Apple OAuth client vars             | Login providers disabled in config today |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`               | Enable Sentry after project create       |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Source-map upload on build               |
| `DATABASE_POOL_MAX`                                   | Cap pg pool size (prod default 5)        |

### Beta Production vs pull-request Preview

- In this new Vercel project, “Production” means the stable beta environment at
  `beta.scilentmusic.com`
- Set Preview env separately from beta Production
- `VERCEL_URL` is trusted via auth `trustedOrigins`
- Prefer dedicated Preview `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` for a fixed custom preview domain so cookies match
- Prefer another disposable database for Preview deployments
- Do not run migrate-on-deploy in Preview unless per-preview database provisioning is
  deliberately implemented
- Neither beta Production nor Preview may use the existing `scilentmusic.com` database

### Beta domain setup

1. In the new Vercel project, add `beta.scilentmusic.com` under Settings → Domains.
2. Add the DNS record Vercel displays. If Vercel manages the zone, it can usually
   configure the subdomain directly; otherwise add the record at the current DNS provider.
3. Leave `scilentmusic.com` attached to the old project.
4. Redeploy after setting `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`.
5. Wait for TLS issuance before testing auth and cookies.

### Beta smoke-test (after WS8)

- [ ] `https://scilentmusic.com` still serves the existing project
- [ ] `GET https://beta.scilentmusic.com/api/health` → `status: "ok"`
- [ ] Sign-up / login cookie on `beta.scilentmusic.com`
- [ ] Admin route with admin role
- [ ] DB-backed page load uses beta data and exposes no existing production data
- [ ] Optional: intentional error appears in Sentry when DSN set

## Final apex cutover (after beta acceptance)

Moving the domain does not move database data. Before cutover, decide whether beta
data is promoted, migrated, or discarded, and back up both databases.

1. Prepare the intended final production database and apply migrations before routing traffic.
2. Move `scilentmusic.com` from the old Vercel project to the new project.
3. Set `BETTER_AUTH_URL=https://scilentmusic.com` and
   `NEXT_PUBLIC_APP_URL=https://scilentmusic.com`, then redeploy.
4. Update streaming OAuth callbacks, Resend links/sender configuration, and other
   integrations that reference `beta.scilentmusic.com`.
5. Decide whether the beta hostname remains a test environment or redirects to the apex.
6. Smoke-test health, auth, admin access, DB-backed pages, email, and integrations
   before retiring the old project.

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
