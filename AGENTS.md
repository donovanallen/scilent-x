# AGENTS.md

This is the root entry point Cursor (and other AGENTS.md-aware tools) read automatically. It's
intentionally short — it orients an agent and links out to the detailed docs that already exist in
this repo rather than duplicating them.

## Project

**scilent-x** is a pnpm + Turborepo monorepo: a Next.js 16 / React 19 web app (`apps/web`) plus
shared packages for UI, auth, database access, logging, and music-domain logic.

```
apps/
  web/                # Next.js 16 app (Turbopack, App Router)
packages/
  ui/                 # @scilent-one/ui - shared UI primitives
  scilent-ui/         # @scilent-one/scilent-ui - app-specific UI layer
  db/                 # @scilent-one/db - Prisma 7 + Postgres client
  auth/               # @scilent-one/auth - Better Auth config
  logger/             # @scilent-one/logger
  social/             # @scilent-one/social
  harmony-engine/      # @scilent-one/harmony-engine - music/matching domain logic
  tooling/            # @scilent-one/tooling - shared ESLint/TS/Prettier configs
```

Tech: TypeScript, Tailwind v4, Prisma 7 + Postgres, Better Auth, Vitest, Storybook 10, Changesets.

## Commands

Run everything from the repo root via Turborepo; add `--filter <package>` to scope to one package.

```bash
pnpm install                # install workspace deps
pnpm dev                     # turbo dev (all apps)
pnpm build                   # turbo build
pnpm lint                    # turbo lint
pnpm format                  # turbo format
pnpm typecheck                # turbo typecheck
pnpm test                    # turbo test
pnpm test:coverage           # turbo test:coverage
pnpm fix                     # lint + format + typecheck

pnpm db:generate             # prisma generate (packages/db)
pnpm db:migrate              # prisma migrate dev
pnpm db:push                 # prisma db push
pnpm db:studio               # prisma studio

pnpm changeset                # author a changeset for a packages/* or apps/* (non-web) change
pnpm version                 # apply pending changesets to package versions
pnpm release                  # publish (private packages are skipped)
```

See `package.json` and `turbo.json` at the root for the authoritative list — don't invent scripts
that aren't there.

## Versioning: Changesets is required for package changes

This repo uses [Changesets](https://github.com/changesets/changesets), **not** a Cursor
command/hook that auto-generates changelogs. If your change touches anything under `packages/*`
(except `packages/tooling`, which has no external consumers) or `apps/*` other than `apps/web`
(excluded via `.changeset/config.json` `ignore`), run `pnpm changeset` and describe the change
before you consider the work done — see `docs/RELEASE.md` for the full flow and existing files
under `.changeset/*.md` for the expected format. A `beforeShellExecution` hook
(`.cursor/hooks/changeset-reminder.sh`) will prompt you about this before `git commit` if it looks
like you forgot; treat that prompt as a real checklist item, not noise to dismiss.

## Where things live

- **Claude-Code-oriented docs**: `agents/CLAUDE.md` (tech stack + commands, same source of truth as
  this file, kept for Claude Code's native `CLAUDE.md` convention), plus `agents/DB.md`,
  `agents/DEPENDENCY_AUDIT.md`, `agents/HARMONY_ENGINE_SPEC.md`, `agents/HARMONY_IX_SPEC.md` for
  deep-dives on specific subsystems.
- **Product/process docs**: `docs/AUTH.md`, `docs/DATABASE.mdx`, `docs/INITIAL_SETUP.md`,
  `docs/RELEASE.md`, `docs/TODO.md`.
- **Cursor-specific agent config**: lives under `.cursor/` — see `docs/AGENT_TOOLING.md` for what's
  there and why (Cloud Agent bootstrap, hooks, the `vercel-react-best-practices` skill).

## Skills

- `.cursor/skills/vercel-react-best-practices/SKILL.md` — React/Next.js performance guidelines.
  Apply when writing or reviewing components, data fetching, or bundle-affecting code.

## Conventions worth knowing before you edit code

- Internal packages import via the `@scilent-one/*` workspace protocol — check `pnpm-workspace.yaml`
  and a package's `package.json` `exports` before assuming a subpath import works.
- `packages/db/prisma/generated/**` and other build outputs are generated — don't hand-edit them;
  regenerate via the relevant `db:*`/build script instead.
- Follow the existing conventional-commit-style messages in `git log` (e.g. `chore(agents): ...`,
  `docs: ...`, `fix(ui): ...`).
