---
name: Production deployment prep
overview: "Harden the web app, auth, DB, and env handling for production; add CI/CD and Vercel deployment with migrate-on-deploy; and set up repeatable deploy tooling (skills/commands/MCP)."
todos:
  - id: auth-gate
    content: Add middleware session gate + layout guard for (authenticated) routes and admin RBAC
    status: pending
  - id: env-schema
    content: Add zod env validation module and reconcile all .env.example files
    status: pending
  - id: images
    content: Adopt next/image in artwork/avatar components + remotePatterns config
    status: pending
  - id: next-config
    content: "Security headers, optimizePackageImports additions in next.config.ts"
    status: pending
  - id: error-ux
    content: "Segment error.tsx/loading.tsx, mount Toaster, replace console.error with logger"
    status: pending
  - id: seo
    content: "Metadata (description/OG), favicon, robots.ts, sitemap.ts, metadataBase"
    status: pending
  - id: auth-hardening
    content: "trustedOrigins, session config, rate limiting in packages/auth"
    status: pending
  - id: db-prod
    content: "Pooled connection docs, root db:* aliases, migrate-deploy wiring"
    status: pending
  - id: ci
    content: New ci.yml (lint/typecheck/build/tests incl. apps/web + harmony-engine)
    status: pending
  - id: observability
    content: Sentry scaffold (env-gated) + /api/health route
    status: pending
  - id: runbook
    content: "docs/DEPLOYMENT.md runbook: Vercel setup, env secrets, domain repurpose steps"
    status: pending
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
- Secrets live in Vercel project env settings (prod/preview split); nothing committed.

## Workstream 3 — DB & Prisma

- Migrations already exist (12 under [packages/db/prisma/migrations](packages/db/prisma/migrations)) with a `db:migrate:deploy` script — wire it into deploy (see WS5). No schema changes needed.
- Document/verify pooled `DATABASE_URL` for serverless; optionally add explicit pool sizing to `PrismaPg` in [packages/db/src/client.ts](packages/db/src/client.ts).
- Add root `db:*` script aliases (README/AGENTS.md reference them but they don't exist).

## Workstream 4 — Auth hardening (`packages/auth`)

- Set `trustedOrigins` from the prod URL, explicit session `expiresIn`/`updateAge`, and confirm `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` are required by the env schema.
- Enable Better Auth rate limiting on auth endpoints.
- Decide (your call, non-blocking): email verification + password reset need an email provider (e.g. Resend) — I'd scaffold the config behind an optional env var but not block launch on it. OAuth login providers (Google/GitHub/Apple) stay disabled; docs updated to match reality.

## Workstream 5 — CI/CD + deployment

- **New `ci.yml`**: lint + typecheck + build (`turbo build --filter=web`) + full test suite on every PR — current [test.yml](.github/workflows/test.yml) path-filters _out_ `apps/web` and never runs `harmony-engine` tests despite triggering on them. Fix both.
- **Vercel project**: root-directory `apps/web`, install `pnpm install`, build `turbo build --filter=web` (turbo already runs `^db:generate` before build). Commit a minimal `vercel.json` if needed for the monorepo.
- **Migrate-on-deploy**: run `prisma migrate deploy` as part of the production build command (standard Vercel+Prisma pattern), so schema changes ship atomically with the code that needs them.
- Keep existing Changesets release flow untouched (packages are private; it's a changelog/version mechanism).

## Workstream 6 — Observability

- Add **Sentry** (`@sentry/nextjs`) for client + server error reporting; wire it into `global-error.tsx` and `handleApiError` in [apps/web/src/lib/api-utils.ts](apps/web/src/lib/api-utils.ts). Pino stays for structured server logs (Vercel captures stdout).
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

## Sequencing

WS1–WS4 are code changes I can do now in one branch (auth gate first — it's the only true launch blocker). WS5 CI workflow is also code. The Vercel project creation, env secret entry, prod DB provisioning, and domain move are dashboard actions you'll do (I'll write a step-by-step runbook as `docs/DEPLOYMENT.md`). WS6 Sentry needs a DSN from you (or we scaffold it env-gated). WS7 skills/commands ship with the branch.
