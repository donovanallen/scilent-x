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
    status: completed
  - id: ci
    content: New ci.yml (lint/typecheck/build/tests incl. apps/web + harmony-engine)
    status: completed
  - id: observability
    content: Sentry scaffold (env-gated) + /api/health route
    status: completed
  - id: platform-provisioning
    content: 'WS8: Vercel project, env secrets, migrate-on-deploy, domain/DNS, Sentry DSN'
    status: pending
  - id: runbook
    content: 'docs/DEPLOYMENT.md runbook: Vercel setup, env secrets, domain repurpose steps'
    status: completed
  - id: agent-tooling
    content: New production-readiness skill + deploy-check command; recommend Vercel MCP
    status: completed
isProject: false
---

# Production Deployment Prep

## Progress (as of 2026-07-15)

Branch: `cursor/production-deployment-prep-plan-7c85` (PR #128).

| WS    | Focus                 | Status       | Notes                                                                                                                                                                                                    |
| ----- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Frontend hardening    | **Done**     | Middleware cookie gate, server auth layout, admin RBAC via Better Auth roles, `next/image` + remotePatterns, security headers, error/loading/Toaster, SEO (metadata/robots/sitemap/icon), logger cleanup |
| **2** | Env validation        | **Done**     | `apps/web/src/env.ts` (`@t3-oss/env-nextjs` + zod), instrumentation + next.config boot validation, reconciled `.env.example`s, `docs/AUTH.md` updated                                                    |
| **3** | DB / Prisma prod      | **Done**     | Root `db:*` aliases + AGENTS.md; pooled `DATABASE_URL` docs; optional `DATABASE_POOL_MAX` + prod default pool max 5 in `PrismaPg`; migrate-on-deploy **wire-up remains WS8**                             |
| **4** | Auth hardening        | **Done**     | `trustedOrigins`, session 7d/1d, rate limits, optional Resend, changeset `.changeset/auth-production-hardening.md`                                                                                       |
| **5** | CI/CD (in-repo)       | **Done**     | `.github/workflows/ci.yml`; `test.yml` includes `apps/web` + harmony-engine; draft `docs/DEPLOYMENT.md` + `apps/web/vercel.json`                                                                         |
| **6** | Observability (code)  | **Done**     | `/api/health` (DB ping); `@sentry/nextjs` env-gated scaffold (client/server/edge); wired into `global-error.tsx` + `handleApiError`; DSN creation is **WS8**                                             |
| **7** | Agent tooling         | **Done**     | `.cursor/skills/production-readiness/SKILL.md` + `.cursor/commands/deploy-check.md`; Vercel/Sentry MCP recommended post-WS8                                                                              |
| **8** | Platform provisioning | **Deferred** | Vercel project, secrets, migrate-on-deploy on live build, domain/DNS, Sentry DSN — dashboard work (expanded runbook below)                                                                               |

**In-repo code for this plan is complete through WS7.** Remaining go-live work is **WS8** (dashboard / account).

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

## Workstream 3 — DB & Prisma ✅

- Migrations already exist under [packages/db/prisma/migrations](packages/db/prisma/migrations) with package script `db:migrate:deploy` — **wire into live deploy in [WS8](#workstream-8--platform-provisioning-deferred)**. No schema changes needed for launch.
- Root `db:*` aliases in [package.json](package.json) + [AGENTS.md](AGENTS.md): `db:generate`, `db:migrate`, `db:migrate:deploy`, `db:push`, `db:seed`, `db:studio`.
- Pooled URL guidance in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/DATABASE.mdx](docs/DATABASE.mdx).
- Optional `DATABASE_POOL_MAX` on `PrismaPg` in [packages/db/src/client.ts](packages/db/src/client.ts) (production default max **5** when unset). Changeset: `.changeset/db-pool-max.md`.
- Exact migrate-on-deploy command for Vercel: `pnpm db:migrate:deploy` (from monorepo root) — see WS8.

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

## Workstream 6 — Observability (code) ✅

- **`GET /api/health`**: DB `SELECT 1`, JSON `{ status, checks.database.{ status, latencyMs } }`, no auth (middleware already treats `/api/*` as public for cookie redirects).
- **Sentry** (`@sentry/nextjs`): `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`; `instrumentation.ts` registers + `onRequestError`; `withSentryConfig` in `next.config.ts` with source maps **disabled** unless `SENTRY_AUTH_TOKEN` is set; runtime `enabled: Boolean(dsn)`.
- Wired into [global-error.tsx](apps/web/src/app/global-error.tsx) and [handleApiError](apps/web/src/lib/api-utils.ts) (skips 401/403).
- Optional env in `apps/web/src/env.ts` + `.env.example`: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.
- **Creating the Sentry project and pasting DSNs is [WS8](#workstream-8--platform-provisioning-deferred).**

## Workstream 7 — Recommended tooling for repeatable deploys ✅

**Existing/reputable to adopt (after WS8):**

- **Vercel MCP server** (official, `mcp.vercel.com`) — lets agents inspect deployments, logs, and env vars.
- **Sentry MCP** — once Sentry DSN is live, agents can triage prod errors directly.
- `gh` CLI already available for CI inspection.

**Net-new in this repo:**

- [`.cursor/skills/production-readiness/SKILL.md`](.cursor/skills/production-readiness/SKILL.md) — audit checklist (auth gate, env schema, headers, images, migrations, CI, health, Sentry, trustedOrigins).
- [`.cursor/commands/deploy-check.md`](.cursor/commands/deploy-check.md) — pre-deploy: `pnpm fix` + build + `changeset status` + env-example drift + migration/health considerations.

## Workstream 8 — Platform provisioning (deferred)

External dashboard / account work. In-repo hooks are ready; **do not block code PRs on this list.** Canonical short copy also lives in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### Still outstanding from earlier streams (platform-only)

| From | Outstanding until WS8                                                                         |
| ---- | --------------------------------------------------------------------------------------------- |
| WS2  | Enter secrets in Vercel (Production + Preview); nothing else for env schema                   |
| WS3  | Wire `pnpm db:migrate:deploy` into the live build command; confirm pooled prod `DATABASE_URL` |
| WS4  | Set production `BETTER_AUTH_URL` / optional Resend keys; verify cookies on real domain        |
| WS5  | Create Vercel project; `vercel.json` install/build already drafted                            |
| WS6  | Create Sentry project; set DSN (+ optional source-map token/org/project)                      |
| WS7  | Enable Vercel MCP + Sentry MCP for agents after projects exist                                |

### Step-by-step runbook

#### 1. Create the Vercel project

1. Import this GitHub repo in Vercel (or `vercel link` from a machine with access).
2. **Framework Preset:** Next.js.
3. **Root Directory:** `apps/web` (matches [apps/web/vercel.json](apps/web/vercel.json)).
4. Confirm **Install Command:** `cd ../.. && pnpm install` (monorepo root).
5. Confirm **pnpm** / Node versions match repo (`packageManager` in root `package.json`, `.nvmrc` if present).
6. Leave the initial **Build Command** as `cd ../.. && pnpm turbo build --filter=web` until step 3 (migrate) is ready — first deploy can validate install/build without migrate if the DB schema is already applied manually.

#### 2. Environment variables

Copy from [apps/web/.env.example](apps/web/.env.example). Set separately for **Production** and **Preview**.

**Required**

| Variable             | Value guidance                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | **Pooled** Postgres URL (Neon/Supabase pooler). Optional companion: `DATABASE_POOL_MAX=5` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` (≥32 chars)                                                     |
| `BETTER_AUTH_URL`    | Canonical public HTTPS origin, **no trailing slash** (e.g. `https://app.example.com`)     |

**Optional — product**

| Variable                                                           | When                                             |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`                                              | Public/SEO canonical if it differs from auth URL |
| `LOG_LEVEL` / `MUSICBRAINZ_CONTACT` / `BETTER_AUTH_ADMIN_USER_IDS` | Ops / bootstrap                                  |
| `RESEND_API_KEY` / `AUTH_EMAIL_FROM`                               | Password reset + email verification              |
| Spotify / Tidal / Apple Music keys                                 | Streaming features                               |
| Google / GitHub / Apple OAuth client IDs                           | Unused for login today (admin status only)       |

**Optional — Sentry (after step 5)**

| Variable                                              | When                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`                              | Browser + usually enough for all runtimes                   |
| `SENTRY_DSN`                                          | Server/edge override (falls back to public DSN in scaffold) |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Source-map upload on Vercel **build** env                   |

CI continues to use `SKIP_ENV_VALIDATION=true` — do **not** rely on that skip in Production.

#### 3. Migrate-on-deploy

Update the Vercel **Build Command** (Root Directory still `apps/web`):

```bash
cd ../.. && pnpm db:migrate:deploy && pnpm turbo build --filter=web
```

Notes:

- Root alias `pnpm db:migrate:deploy` → `@scilent-one/db` `prisma migrate deploy`.
- Turbo already runs `^db:generate` for the web build graph.
- If the pooler rejects DDL, apply migrations once with a **direct** URL (one-off / provider migrate guide), then keep the app on the pooled URL.
- Do **not** run `db:migrate` (dev) in production.

#### 4. Domain / DNS

1. Vercel → Project → Settings → Domains → add the production hostname.
2. If DNS already points at Vercel, **move** the domain from the old project to this one (often no DNS edit).
3. After the domain is attached, set Production `BETTER_AUTH_URL` (and optional `NEXT_PUBLIC_APP_URL`) to that exact origin.
4. Wait for TLS certificate issuance before smoke-testing auth cookies.

#### 5. Sentry project

1. Create a Sentry Next.js project for this app.
2. Copy the DSN into Production (and Preview if desired): `NEXT_PUBLIC_SENTRY_DSN` and/or `SENTRY_DSN`.
3. For readable stack traces: create an auth token with release/source-map scopes; set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` on the Vercel build environment.
4. Redeploy. Confirm SDK stays quiet when DSN unset; with DSN set, throw a test error and check Issues.

#### 6. Preview vs Production behavior

| Concern           | Production                              | Preview                                                                                                                  |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Env set           | Production vars                         | Preview vars (separate)                                                                                                  |
| `BETTER_AUTH_URL` | Final custom domain                     | Prefer Preview-specific URL if using a fixed preview domain; otherwise `VERCEL_URL` is also trusted via `trustedOrigins` |
| `DATABASE_URL`    | Prod pooled DB (or isolated preview DB) | Prefer a non-prod DB                                                                                                     |
| Migrate-on-deploy | Yes on production builds                | Decide deliberately — previews migrating a shared prod DB is usually **wrong**                                           |
| Sentry            | Production DSN / `environment`          | Optional separate project or same DSN with Preview env tag                                                               |

#### 7. Smoke-test checklist

- [ ] Deploy succeeds; build logs show migrate + `turbo build --filter=web`
- [ ] `GET https://<host>/api/health` → `{ "status": "ok", "checks": { "database": { "status": "ok", "latencyMs": <n> } } }`
- [ ] Sign up / login; session cookie set for the production host
- [ ] Authenticated page loads; logout works
- [ ] Admin user reaches `/admin`; non-admin gets forbidden / redirect as designed
- [ ] A DB-backed route (feed/profile) returns data
- [ ] Optional Resend: password-reset email when keys set
- [ ] Optional Sentry: test error visible in project
- [ ] Security headers present (`X-Frame-Options`, HSTS, etc.)

#### 8. Post-go-live agent tooling

- Enable **Vercel MCP** (`mcp.vercel.com`) for deployment/log/env inspection.
- Enable **Sentry MCP** for production error triage.
- Use `/deploy-check` and the `production-readiness` skill before subsequent promotes.

## Sequencing

**Done in-repo:** WS1–WS7. **Go-live:** WS8 with you (Vercel, secrets, migrate-on-deploy, domain, Sentry DSN, smoke tests).
