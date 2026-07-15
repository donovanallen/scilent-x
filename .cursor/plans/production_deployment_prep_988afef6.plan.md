---
name: Production deployment prep
overview: 'Harden the web app, auth, DB, and env handling for production; add CI/CD and Vercel deployment with migrate-on-deploy; and set up repeatable deploy tooling (skills/commands/MCP).'
todos:
  - id: auth-gate
    content: Add middleware session gate + layout guard for (authenticated) routes and admin RBAC
    status: completed
  - id: env-schema
    content: Add zod env validation module and reconcile all .env.example files
    status: completed
  - id: images
    content: Adopt next/image in artwork/avatar components + remotePatterns config
    status: completed
  - id: next-config
    content: 'Security headers, optimizePackageImports additions in next.config.ts'
    status: completed
  - id: error-ux
    content: 'Segment error.tsx/loading.tsx, mount Toaster, replace console.error with logger'
    status: completed
  - id: seo
    content: 'Metadata (description/OG), favicon, robots.ts, sitemap.ts, metadataBase'
    status: completed
  - id: auth-hardening
    content: 'trustedOrigins, session config, rate limiting in packages/auth'
    status: completed
  - id: db-prod
    content: 'Pooled connection docs, root db:* aliases, migrate-deploy wiring'
    status: pending
  - id: ci
    content: New ci.yml (lint/typecheck/build/tests incl. apps/web + harmony-engine)
    status: completed
  - id: observability
    content: Sentry scaffold (env-gated) + /api/health route
    status: pending
  - id: platform-provisioning
    content: 'WS8: Vercel project, env secrets, migrate-on-deploy, domain/DNS, Sentry DSN'
    status: pending
  - id: runbook
    content: 'docs/DEPLOYMENT.md runbook: Vercel setup, env secrets, domain repurpose steps'
    status: completed
  - id: agent-tooling
    content: New production-readiness skill + deploy-check command; recommend Vercel MCP
    status: pending
isProject: false
---

# Production Deployment Prep

## Progress (as of 2026-07-15)

Branch: `cursor/production-deployment-prep-plan-7c85` (PR #128). Reviewed against this plan and commits through `5f0f4aa`.

| WS    | Focus                 | Status                             | Notes                                                                                                                                                                                                    |
| ----- | --------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Frontend hardening    | **Done**                           | Middleware cookie gate, server auth layout, admin RBAC via Better Auth roles, `next/image` + remotePatterns, security headers, error/loading/Toaster, SEO (metadata/robots/sitemap/icon), logger cleanup |
| **2** | Env validation        | **Done**                           | `apps/web/src/env.ts` (`@t3-oss/env-nextjs` + zod), instrumentation + next.config boot validation, reconciled `.env.example`s, `docs/AUTH.md` updated                                                    |
| **3** | DB / Prisma prod      | **Not started (local draft only)** | Root `db:*` aliases drafted in **uncommitted** `package.json` / `AGENTS.md` only. No pool sizing in `PrismaPg`, no pooled-URL docs landed on branch. Migrate-on-deploy wire-up is **WS8**                |
| **4** | Auth hardening        | **Done**                           | `trustedOrigins`, session 7d/1d, rate limits, optional Resend, changeset `.changeset/auth-production-hardening.md`                                                                                       |
| **5** | CI/CD (in-repo)       | **Done**                           | `.github/workflows/ci.yml`; `test.yml` includes `apps/web` + harmony-engine; draft `docs/DEPLOYMENT.md` + `apps/web/vercel.json`                                                                         |
| **6** | Observability (code)  | **Not started**                    | No `/api/health`; no `@sentry/nextjs` scaffold                                                                                                                                                           |
| **7** | Agent tooling         | **Not started**                    | No `production-readiness` skill / `deploy-check` command yet                                                                                                                                             |
| **8** | Platform provisioning | **Deferred**                       | Vercel project, secrets, migrate-on-deploy on live build, domain/DNS, Sentry DSN — dashboard work                                                                                                        |

**Branch commits for this plan (newest first):**

- `5f0f4aa` — docs(plans): update production prep progress against branch
- `16d60c0` — feat(auth): harden Better Auth and add production CI (WS4 + WS5)
- `d57a3ed` — feat(web): add typed env validation (WS2)
- `1d3ec5f` — lockfile fix after merge
- `f5a84d3` — feat(web): harden frontend for production readiness (WS1)
- `cbf2cd9` — docs(plans): add this plan

**Remaining code before go-live:** WS3 (aliases + pool docs), WS6 (health + env-gated Sentry), WS7 (skill/command). **Then WS8** with you on the dashboard.

**Uncommitted local (not on branch yet):** `AGENTS.md` + root `package.json` `db:*` aliases (belongs in WS3); unrelated WIP under `apps/web` (admin status pages) — keep out of plan commits unless intentional.

## Assumptions (flag if wrong)

- **Hosting: Vercel** — the repo's docs ([docs/INITIAL_SETUP.md](docs/INITIAL_SETUP.md)) already assume it, and it's the best fit for Next 16 + Turborepo. Repurposing your existing URL is then just moving the custom domain from the old Vercel project to the new one (Settings → Domains); DNS stays untouched if it already points at Vercel. **I need from you**: the domain name, and which platform the old project is on.
- **Production Postgres**: code uses `@prisma/adapter-pg` with a plain connection string, so any provider works (Neon/Supabase/Railway). For Vercel serverless you must use a **pooled** connection URL. Tell me if you already have a prod DB.

## Workstream 1 — Frontend production hardening (`apps/web`) ✅

- **Auth gate**: session-cookie check + redirect-to-`/login` in [apps/web/src/middleware.ts](apps/web/src/middleware.ts); server `getSession` in authenticated layout; admin RBAC via Better Auth roles (`hasAdminRole` / `isAdminUser`), not email allowlists.
- **Images**: `next/image` in scilent-ui artwork + web avatars; `images.remotePatterns` for Spotify / Apple / Tidal / Cover Art Archive / OAuth avatars.
- **next.config**: security `headers()`, `optimizePackageImports` includes `@scilent-one/ui` / `@scilent-one/scilent-ui`.
- **Error UX**: segment `error.tsx` + `loading.tsx`; root `<Toaster />`; server actions use `@scilent-one/logger`.
- **SEO/meta**: description + OG/Twitter, `icon.tsx`, `robots.ts`, `sitemap.ts`, `metadataBase` via `getSiteUrl()`.
- **Cleanup**: Prisma Studio link gated to development; setup link → `/admin/db/setup`.

## Workstream 2 — Env vars, secrets, validation ✅

- Typed env module: [apps/web/src/env.ts](apps/web/src/env.ts) (`@t3-oss/env-nextjs` + zod). Required: `DATABASE_URL`, `BETTER_AUTH_SECRET` (≥32), `BETTER_AUTH_URL`. Validated at build (`next.config` import) and boot (`instrumentation.ts`). Skip with `SKIP_ENV_VALIDATION=true` or `NODE_ENV=test`.
- Reconciled [apps/web/.env.example](apps/web/.env.example), [packages/db/.env.example](packages/db/.env.example), [packages/auth/.env.example](packages/auth/.env.example); [docs/AUTH.md](docs/AUTH.md) points at canonical web template.
- Secrets live in Vercel project env settings (prod/preview split); nothing committed. **Dashboard entry of secrets → [WS8](#workstream-8--platform-provisioning-deferred).**

## Workstream 3 — DB & Prisma ⏳

- Migrations already exist under [packages/db/prisma/migrations](packages/db/prisma/migrations) with package script `db:migrate:deploy` — **wire into live deploy in [WS8](#workstream-8--platform-provisioning-deferred)**. No schema changes needed for launch.
- **Still todo:** document/verify pooled `DATABASE_URL` for serverless; optionally add explicit pool sizing to `PrismaPg` in [packages/db/src/client.ts](packages/db/src/client.ts) (today: plain `connectionString` only).
- **Still todo (draft exists locally, uncommitted):** root `db:*` script aliases + AGENTS.md lines for `db:migrate:deploy` / `db:seed`. Commit as part of this workstream.

## Workstream 4 — Auth hardening (`packages/auth`) ✅

- Set `trustedOrigins` from the prod URL, explicit session `expiresIn`/`updateAge`, and confirm `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` are required by the env schema.
- Enable Better Auth rate limiting on auth endpoints.
- Optional Resend email (verification + password reset) behind `RESEND_API_KEY` — no-ops when unset. OAuth login providers (Google/GitHub/Apple) stay disabled; docs match reality.

**Done in-repo:** `trustedOrigins` from `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` / `VERCEL_URL` ([packages/auth/src/origins.ts](packages/auth/src/origins.ts)); session 7d / refresh 1d; rate limits; optional Resend ([packages/auth/src/email.ts](packages/auth/src/email.ts)); [docs/AUTH.md](docs/AUTH.md). Changeset: [.changeset/auth-production-hardening.md](.changeset/auth-production-hardening.md).

## Workstream 5 — CI/CD + deployment (split)

### In-repo / CI (done) ✅

- **New [`.github/workflows/ci.yml`](.github/workflows/ci.yml)**: lint + typecheck + build (`turbo build --filter=web`) + full test suite on every PR — uses `SKIP_ENV_VALIDATION=true` so Next env schema does not need secrets in GitHub Actions.
- **Fixed [`.github/workflows/test.yml`](.github/workflows/test.yml)**: path filters include `apps/web` + `harmony-engine`; coverage job still covers social/scilent-ui/ui; separate step runs harmony-engine + web tests.
- Draft [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) + minimal [apps/web/vercel.json](apps/web/vercel.json) install/build hints for the monorepo.

### Platform / dashboard (moved → [WS8](#workstream-8--platform-provisioning-deferred))

- Vercel project creation, env secret entry, migrate-on-deploy on a live project, domain/DNS — **not done here**.

## Workstream 6 — Observability (code later; DSN → WS8) ⏳

- Add **Sentry** (`@sentry/nextjs`) for client + server error reporting; wire it into `global-error.tsx` and `handleApiError` in [apps/web/src/lib/api-utils.ts](apps/web/src/lib/api-utils.ts). Pino stays for structured server logs (Vercel captures stdout). Scaffold env-gated; **creating the Sentry project and pasting DSNs is [WS8](#workstream-8--platform-provisioning-deferred).**
- Add a `/api/health` route (DB ping) for uptime checks.
- **Status:** neither health route nor Sentry scaffold exists on the branch yet.

## Workstream 7 — Recommended tooling for repeatable deploys ⏳

**Existing/reputable to adopt:**

- **Vercel MCP server** (official, `mcp.vercel.com`) — lets agents inspect deployments, logs, and env vars; the single most useful addition for this workflow.
- **Sentry MCP** — once Sentry is in, agents can triage prod errors directly.
- `gh` CLI already available for CI inspection.

**Net-new for this repo:**

- `.cursor/skills/production-readiness/SKILL.md` — the audit checklist from this plan (auth gate, env schema, headers, images, migrations) so future agents re-verify before each deploy.
- `.cursor/commands/deploy-check.md` — pre-deploy command: `pnpm fix` + build + `changeset status` + env-example drift check + migration status.
- Extend the existing `responsive-testing` skill usage into CI later (optional, post-launch).
- **Status:** skill + command not created yet.

## Workstream 8 — Platform provisioning (deferred)

External dashboard / account work. In-repo hooks: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), `apps/web/vercel.json`, `SKIP_ENV_VALIDATION` in CI. Root `pnpm db:migrate:deploy` lands with WS3 (script already exists under `packages/db`). **Do not block code PRs on this list.**

Checklist:

- [ ] Create Vercel project for this repo; **Root Directory** = `apps/web`
- [ ] Configure install/build (see `vercel.json` / DEPLOYMENT.md); confirm Turborepo + `pnpm` versions
- [ ] Enter Production + Preview env vars from `apps/web/.env.example` (at least `DATABASE_URL` pooled, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- [ ] Optional: `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, streaming/Apple Music keys, `NEXT_PUBLIC_APP_URL`
- [ ] Wire **migrate-on-deploy**: run `pnpm db:migrate:deploy` in the production build (or install) command so schema ships with the code
- [ ] Attach custom domain / DNS (or move domain from the old Vercel project)
- [ ] Create Sentry project; set DSN env vars after WS6 scaffolds `@sentry/nextjs`
- [ ] Smoke-test production deploy + auth cookie/origin + DB connectivity
- [ ] Confirm Preview deploys get Preview env + acceptable `trustedOrigins` behavior

## Sequencing

**Done in-repo:** WS1, WS2, WS4, WS5 (CI + draft runbook). **Next code:** WS3 → WS6 → WS7. **Go-live:** WS8 with you (Vercel, secrets, migrate-on-deploy, domain, Sentry DSN).
