# Cursor Agent Tooling

This documents what lives under `.cursor/` in this repo, where it came from, and how it relates to
the Claude-Code-oriented docs in `agents/`.

## Origin

Ported from `catalyst-ed/cams-web-client` branch `cursor/cams-cursor-plugin-53c9`, adapted to
scilent-x's stack (pnpm + Turborepo + Prisma, Changesets for versioning) instead of copied
verbatim. That branch's actual Cursor-specific additions were narrow: a `.cursor/environment.json`
Cloud Agent config, two self-contained bootstrap scripts, and updated `CLAUDE.md` docs describing
an internal `@catalyst-ed/cams-plugin` package that generates `.cursor/rules/`, `.cursor/commands/`,
`.cursor/mcp.json`, and skills for that repo via a sync step. scilent-x has no equivalent external
plugin package, so those generated-file categories weren't ported — see "What was intentionally
excluded" below.

## What's here

### `.cursor/environment.json` — Cursor Cloud Agent bootstrap

Tells a Cursor Cloud Agent how to install dependencies and start a shell for this repo:

```json
{
  "install": "bash scripts/cloud-agent-install.sh",
  "start": "bash scripts/cloud-agent-startup.sh"
}
```

- `scripts/cloud-agent-install.sh` — activates the Node version pinned in `.nvmrc` via `nvm`
  (falling back to whatever `node` is already on `PATH`), enables `corepack` so the `pnpm` version
  pinned in `package.json`'s `packageManager` field is used, runs `pnpm install --frozen-lockfile`,
  then runs `pnpm --filter @scilent-one/db run db:generate` so the Prisma client exists before
  turbo's build/typecheck graph needs it (`prisma generate` only reads the schema — it does not
  need a live `DATABASE_URL`).
- `scripts/cloud-agent-startup.sh` — re-activates the pinned Node version in every shell the cloud
  agent opens, and installs a small `.bashrc`/`.bash_profile` hook so that stays true for
  shells opened later in the session.

Both scripts are self-contained (no `node_modules` dependency) since `install` runs before
`pnpm install` completes.

### `.cursor/hooks.json` + `.cursor/hooks/*` — quality gates, Cursor-native

cams-web-client enforces quality gates with Husky git hooks: `pre-commit` runs `lint-staged` +
`typecheck`, `pre-push` runs `lint:fix` + `typecheck` + `build`. scilent-x doesn't use Husky, and
this port intentionally didn't add it — instead it expresses the same intent as native
[Cursor hooks](https://cursor.com/docs) that run inside the agent session rather than at the git
level:

- **`changeset-reminder.sh`** (`beforeShellExecution`, matched on `git commit`): scilent-x uses
  [Changesets](https://github.com/changesets/changesets) for versioning, which Husky-style
  lint/typecheck gates don't cover — a package change with no changeset silently produces no
  version bump or changelog entry at release time. This hook inspects staged files before a
  `git commit` runs; if they touch a versioned package (`packages/*` other than `packages/tooling`)
  or app (`apps/*` other than `apps/web`, which `.changeset/config.json` already excludes) with no
  new `.changeset/*.md` file staged, it asks the agent to consider running `pnpm changeset` first.
  It never blocks the commit outright (`failClosed: false`) — it's a reminder, not a hard gate,
  matching how the existing "Changeset Status" CI check already nudges PRs (see
  `docs/RELEASE.md`).
- **`format-on-edit.sh`** (`afterFileEdit`): runs `prettier --write` on the file the agent just
  edited (respects `.prettierignore`), for the file types Prettier already covers in this repo.
  This is the Cursor-native analogue of the `lint-staged` auto-fix step in cams-web-client's
  `pre-commit` hook, applied continuously during the session instead of only at commit time.

Both hooks fail open (`failClosed: false`): a missing `jq`, an unformattable file, or a hook script
crash never blocks the agent's work.

### `.cursor/skills/production-readiness/`

Pre-deploy audit checklist (auth gate, env schema, headers, DB migrations, CI,
health, Sentry, trustedOrigins). Pair with `.cursor/commands/deploy-check.md`
before promoting builds. After WS8, prefer Vercel MCP + Sentry MCP for live
deploy/error inspection.

### `.cursor/skills/vercel-react-best-practices/`

Pre-existing in this repo (not part of this port) — React/Next.js performance guidance from
Vercel Engineering. Referenced here because any new skill should follow its same structure:
`SKILL.md` with YAML frontmatter (`name`, `description`, `license`, `metadata`) plus a `rules/`
subfolder of granular, single-topic files, and an `AGENTS.md` compiling the full guide.

### `.cursor/skills/{emil-design-eng,review-animations,improve-animations,find-animation-opportunities,animation-vocabulary,apple-design}/`

Ported verbatim (unmodified `SKILL.md` + companion files) from
[emilkowalski/skills](https://github.com/emilkowalski/skills), Emil Kowalski's (ex-Vercel/Linear)
public skill pack for design engineers, mostly focused on animation/motion craft:

- **`emil-design-eng`** — the main skill: taste-driven review/build guidance for UI polish,
  component design, and animation decisions in general. Loads a required Before/After/Why table
  format for review output.
- **`review-animations`** (+ `STANDARDS.md`) — reviews animation/motion _code_ against a strict,
  opinionated bar (justified motion, frequency-appropriate, `ease-out` not `ease-in`, sub-300ms UI,
  correct `transform-origin`, GPU-only properties, reduced-motion, etc.) and outputs a Block/Approve
  verdict. `disable-model-invocation: true` upstream — the agent must be asked for it explicitly, it
  won't self-trigger.
- **`improve-animations`** (+ `AUDIT.md`, `PLAN-TEMPLATE.md`) — audits animations across a whole
  codebase (not a single diff) and writes self-contained, exact-values implementation plans to
  `plans/` for another agent to execute; never edits source itself.
- **`find-animation-opportunities`** — read-only sweep for places that would genuinely benefit from
  motion (and, just as importantly, a documented list of what it rejected and why). Never edits
  source.
- **`animation-vocabulary`** — reverse-lookup glossary ("the bouncy thing when a popover opens" →
  _Pop in_) for naming an effect precisely when prompting an agent or a designer.
- **`apple-design`** — Apple's interface-design and fluid-motion principles (from WWDC design
  talks), translated for the web.

The upstream repo (`npx skills@latest add emilkowalski/skills`) ships exactly these six skills as
of this port - all of them were carried over unmodified. Apply them when writing, reviewing, or
auditing motion or general UI polish in `packages/ui`, `packages/scilent-ui`, or
`apps/web` — this repo's `packages/ui/src/globals.css` already defines a shared `--ease-*`/
`duration-*` motion scale (see the comments there) and a global `prefers-reduced-motion`/mobile
clamp, so new animations should extend those tokens rather than inventing parallel ones or adding
bespoke reduced-motion handling.

## What was intentionally excluded

- **MCP config** (`.cursor/mcp.json`): the source branch has none committed — in cams-web-client
  it's generated by the external `@catalyst-ed/cams-plugin` package's `sync.mjs`, not checked in.
  Nothing concrete to port. Per explicit instruction, Atlassian/Jira/Confluence and Slack MCP
  entries were excluded from consideration regardless.
- **Commands** (`.cursor/commands/*.md`): same story — generated by the external plugin, not
  present as static files on the branch. None ported.
- **Rules** (`.cursor/rules/*.mdc`): same — generated, not present as static files. None ported.
- **GitHub Actions workflow restructuring** (`act-*.yaml` renames, CDK/Docker/Cypress-specific
  jobs): not Cursor-specific, and tied to infrastructure (AWS CDK, Docker, GraphQL codegen) this
  repo doesn't use.
- **`.github/pull_request_template.md`**: tied to Jira ticket linking (`CAT-###`), which this repo
  doesn't use, and isn't Cursor-specific tooling.
- **Husky** (`.husky/pre-commit`, `.husky/pre-push`): not added. Their _intent_ (format/lint/
  typecheck before commit, plus the changeset requirement) is covered by the two Cursor hooks
  above instead of introducing a new git-hook dependency.

## Relationship to `agents/*.md`

`agents/CLAUDE.md` remains the source of truth Claude Code reads natively. The root `AGENTS.md`
is the Cursor-native equivalent (Cursor reads `AGENTS.md` at the repo root automatically) and
stays intentionally short, linking out to `agents/*.md` and `docs/*.md` rather than duplicating
them. If you update tech stack or top-level commands in one, update the other.
