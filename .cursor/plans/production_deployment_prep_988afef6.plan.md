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

## Assumptions (flag if wrong)

- **Hosting: Vercel** — the repo's docs ([docs/INITIAL_SETUP.md](docs/INITIAL_SETUP.md)) already assume it, and it's the best fit for Next 16 + Turborepo. Repurposing your existing URL is then just moving the custom domain from the old Vercel project to the new one (Settings → Domains); DNS stays untouched if it already points at Vercel. **I need from you**: the domain name, and which platform the old project is on.
- **Production Postgres**: code uses `@prisma/adapter-pg` with a plain connection string, so any provider works (Neon/Supabase/Railway). For Vercel serverless you must use a **pooled** connection URL. Tell me if you already have a prod DB.

## Workstream 1 — Frontend production hardening (`apps/web`)

- **Auth gate (biggest gap)**: `(authenticated)` is name-only. Add session-cookie check + redirect-to-`/login` in [apps/web/src/middleware.ts](apps/web/src/middleware.ts) (currently logging-only), plus a server-side `getSession` guard in the authenticated layout. Add real admin RBAC checks for `/admin/*` (actions currently have TODO comments claiming protection that doesn't exist).
- **Images**: adopt `next/image` in the artwork components ([packages/scilent-ui](packages/scilent-ui) `Artwork`, `AlbumArtwork`, `ArtistCard`, `ArtistHeader`; web admin/settings avatars) and configure `images.remotePatterns` in [apps/web/next.config.ts](apps/web/next.config.ts) for Spotify (`i.scdn.co`), Apple (`*.mzstatic.com`), Tidal, and `coverartarchive.org`.
- **next.config**: add security `headers()` (HSTS, X-Content-Type-Options, frame-ancestors, referrer policy), keep `optimizePackageImports` and add `@scilent-one/ui` / `@scilent-one/scilent-ui` to it.
- **Error UX**: add segment `error.tsx` + `loading.tsx` for the authenticated group (currently everything falls through to `global-error.tsx`); mount `<Toaster />` in the root layout — toasts are called throughout but never render.
- **SEO/meta**: root metadata description + OpenGraph/Twitter card, favicon/`icon` assets, `robots.ts`, `sitemap.ts`, `metadataBase` from the prod URL.
- **Cleanup**: remove/gate dev-only bits (admin DB page links to `localhost:5555` Prisma Studio), replace remaining `console.error` in server actions with `@scilent-one/logger`.

## Workstream 2 — Env vars, secrets, validation

- Add a typed env module (zod-based, `@t3-oss/env-nextjs` style) validating at build/boot: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Spotify/Tidal/Apple Music vars, `LOG_LEVEL`. Today validation is nonexistent; ~25 vars are read ad-hoc.
- Reconcile [apps/web/.env.example](apps/web/.env.example) (and db/auth package examples) with the real inventory; document required-vs-optional per feature.
- Secrets live in Vercel project env settings (prod/preview split); nothing committed. **Dashboard entry of secrets → [WS8](#workstream-8--platform-provisioning-deferred).**

## Workstream 3 — DB & Prisma

- Migrations already exist (12 under [packages/db/prisma/migrations](packages/db/prisma/migrations)) with a `db:migrate:deploy` script — wire it into deploy (see [WS8](#workstream-8--platform-provisioning-deferred)). No schema changes needed.
- Document/verify pooled `DATABASE_URL` for serverless; optionally add explicit pool sizing to `PrismaPg` in [packages/db/src/client.ts](packages/db/src/client.ts).
- Add root `db:*` script aliases (README/AGENTS.md reference them but they don't exist).

## Workstream 4 — Auth hardening (`packages/auth`) ✅

- Set `trustedOrigins` from the prod URL, explicit session `expiresIn`/`updateAge`, and confirm `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` are required by the env schema.
- Enable Better Auth rate limiting on auth endpoints.
- Decide (your call, non-blocking): email verification + password reset need an email provider (e.g. Resend) — I'd scaffold the config behind an optional env var but not block launch on it. OAuth login providers (Google/GitHub/Apple) stay disabled; docs updated to match reality.

**Done in-repo:** `trustedOrigins` from `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` / `VERCEL_URL`; session 7d / refresh 1d; rate limits; optional Resend (`RESEND_API_KEY`); [docs/AUTH.md](docs/AUTH.md) updated. Changeset: `.changeset/auth-production-hardening.md`.

## Workstream 5 — CI/CD + deployment (split)

### In-repo / CI (done) ✅

- **New [`.github/workflows/ci.yml`](.github/workflows/ci.yml)**: lint + typecheck + build (`turbo build --filter=web`) + full test suite on every PR — uses `SKIP_ENV_VALIDATION=true` so Next env schema does not need secrets in GitHub Actions.
- **Fixed [`.github/workflows/test.yml`](.github/workflows/test.yml)**: path filters include `apps/web` + `harmony-engine`; coverage job still covers social/scilent-ui/ui; separate step runs harmony-engine + web tests.
- Draft [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) + minimal [apps/web/vercel.json](apps/web/vercel.json) install/build hints for the monorepo.

### Platform / dashboard (moved → [WS8](#workstream-8--platform-provisioning-deferred))

- Vercel project creation, env secret entry, migrate-on-deploy on a live project, domain/DNS — **not done here**.

## Workstream 6 — Observability (code later; DSN → WS8)

- Add **Sentry** (`@sentry/nextjs`) for client + server error reporting; wire it into `global-error.tsx` and `handleApiError` in [apps/web/src/lib/api-utils.ts](apps/web/src/lib/api-utils.ts). Pino stays for structured server logs (Vercel captures stdout). Scaffold env-gated in a later code PR; **creating the Sentry project and pasting DSNs is [WS8](#workstream-8--platform-provisioning-deferred).**
- Add a `/api/health` route (DB ping) for uptime checks.

## Workstream 7 — Recommended tooling for repeatable deploys

**Existing/reputable to adopt:**

- **Vercel MCP server** (official, `mcp.vercel.com`) — lets agents inspect deployments, logs, and env vars; the single most useful addition for this workflow.
- **Sentry MCP** — once Sentry is in, agents can triage prod errors directly.
- `gh` CLI already available for CI inspection.

**Net-new for this repo:**

- `.cursor/skills/production-readiness/SKILL.md` — the audit checklist from this plan (auth gate, env schema, headers, images, migrations) so future agents re-verify before each deploy.
- `.cursor/commands/deploy-check.md` — pre-deploy command: `pnpm fix` + build + `changeset status` + env-example drift check + migration status.
- Extend the existing `responsive-testing` skill usage into CI later (optional, post-launch).

## Workstream 8 — Platform provisioning (deferred)

External dashboard / account work. In-repo hooks: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), `apps/web/vercel.json`, `SKIP_ENV_VALIDATION` in CI, root `pnpm db:migrate:deploy`. **Do not block code PRs on this list.**

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

WS1–WS2 and WS4 auth hardening + WS5 CI workflows are in-repo. Remaining code: WS3 (DB pool docs / aliases if not already present), WS6 observability scaffold, WS7 skills/commands. **WS8 is the go-live platform checklist** (Vercel, secrets, migrate-on-deploy, domain, Sentry DSN).
