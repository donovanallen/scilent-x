# TODO - Dependency Audit Follow-up Items

This document tracks technical debt and refactoring opportunities identified during the dependency
audit process.

> **Agent tooling:** Cursor-specific agent configuration (Cloud Agent bootstrap, hooks, skills)
> lives under `.cursor/` — see `docs/AGENT_TOOLING.md` for what's there and why.

---

## ESLint Configuration Modernization

### `packages/tooling/eslint/react.js`

**Status:** ✅ Migrated to flat config format

The React ESLint configuration was migrated from the legacy eslintrc format to ESLint 9's flat
config format during the dependency audit. Monitor for any issues.

**References:**

- [ESLint Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)

### `packages/tooling/eslint/base.mjs`

**Status:** ✅ Migrated to flat config format

The ES Module version of the base config was updated to:

- Remove top-level await (which caused issues)
- Use proper flat config array format
- Import plugins correctly for ESLint 9

**Potential Future Improvement:**

- Consider replacing `eslint-plugin-import` with `eslint-plugin-import-x` which has better ESLint 9
  support and is more actively maintained.

---

## Deprecated Subdependencies

The following deprecated subdependencies were noted during the update (these are transitive
dependencies and not directly controllable):

- `@types/minimatch@6.0.0`
- `glob@7.2.3`
- `inflight@1.0.6`
- `lodash.get@4.4.2`
- `rimraf@3.0.2`

These will be resolved as upstream packages update their dependencies.

---

## Security Audit Findings

The following vulnerabilities were found in transitive dependencies (not directly controllable):

| Severity | Package | Issue                                        | Affected Path                           |
| -------- | ------- | -------------------------------------------- | --------------------------------------- |
| Moderate | js-yaml | Prototype pollution in merge (needs >=4.1.1) | @turbo/gen → @turbo/workspaces          |
| Low      | tmp     | Arbitrary temp file write via symlink        | @turbo/gen → inquirer → external-editor |

These are dependencies of `@turbo/gen` and will be resolved when Turborepo updates their dependencies.

---

## Major Version Updates Applied

The following major version updates were applied during the audit:

| Package                   | From   | To     | Notes                           |
| ------------------------- | ------ | ------ | ------------------------------- |
| next                      | 15.5.2 | 16.1.1 | Major Next.js update            |
| react                     | 19.1.0 | 19.2.3 | React 19 minor update           |
| react-dom                 | 19.1.0 | 19.2.3 | React DOM 19 minor update       |
| eslint-config-next        | 15.5.2 | 16.1.1 | Follows Next.js version         |
| eslint-config-prettier    | 9.1.2  | 10.1.8 | Major version update            |
| eslint-plugin-react-hooks | 5.2.0  | 7.0.1  | Major update (v6 was skipped)   |
| @types/node               | 20.x   | 25.x   | Node.js types major update      |
| @typescript-eslint/\*     | 8.41.0 | 8.50.1 | TypeScript ESLint minor updates |
| turbo                     | 2.5.6  | 2.7.2  | Turborepo minor update          |
| typescript                | 5.9.2  | 5.9.3  | TypeScript patch update         |
| tailwindcss               | 4.1.12 | 4.1.18 | Tailwind CSS patch update       |
| prettier                  | 3.6.2  | 3.7.4  | Prettier minor update           |
| eslint                    | 9.34.0 | 9.39.2 | ESLint minor update             |

---

## Major Version Updates Applied (July 2026 audit)

The following major/tricky version updates were applied during the July 2026 dependency audit,
in addition to a broad batch of in-range minor/patch bumps across the monorepo (Radix UI, Tiptap,
Storybook, Vitest, Prisma, `@typescript-eslint/*`, Turbo, `@types/node`, etc.):

| Package                             | From    | To     | Notes                                                                                                                                                                                                                          |
| ----------------------------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `zod`                               | 3.x     | 4.4.3  | `z.record()` now requires 2 args (`z.record(z.string(), valueType)`); updated `packages/harmony-engine/src/types/harmonized.types.ts` accordingly.                                                                             |
| `eslint`                            | 9.x     | 10.6.0 | Flat config still compatible; some plugins (`eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`) emit peer-dependency warnings for ESLint 9 but lint still passes clean. Monitor for plugin updates.       |
| `lucide-react`                      | 0.562.0 | 1.23.0 | v1 removed brand icons (e.g. `Github`). Fixed by swapping to `Code2` in `packages/ui/src/components/stories/dropdown-menu.stories.tsx`. Bumped peer dependency ranges in `packages/ui` and `packages/scilent-ui` to `>=1.0.0`. |
| `pino`                              | 9.x     | 10.3.1 | No breaking changes hit in `packages/logger` or `packages/harmony-engine` usage.                                                                                                                                               |
| `date-fns`                          | 3.x     | 4.4.0  | No breaking changes hit in `apps/web` usage.                                                                                                                                                                                   |
| `better-auth`                       | 1.4.x   | 1.6.23 | No breaking changes hit in `packages/auth` or `apps/web/src/app/api/auth`.                                                                                                                                                     |
| `prisma` / `@prisma/client`         | 7.2.x   | 7.8.0  | Ran `pnpm --filter @scilent-one/db db:generate` after bumping; generated client checked into `packages/db/prisma/generated/internal/class.ts` as expected.                                                                     |
| `storybook` / `@storybook/*`        | 10.1.x  | 10.4.6 | Storybook/test configs in `packages/ui` and `packages/scilent-ui` unaffected.                                                                                                                                                  |
| `vite`                              | 7.x     | 8.1.3  | Paired with `@vitejs/plugin-react` 5→6 and `vite-plugin-svgr` 4→5.                                                                                                                                                             |
| `vitest`                            | 4.0.x   | 4.1.10 | No config changes required.                                                                                                                                                                                                    |
| `chromatic`                         | 13.x    | 18.0.1 | Config in `packages/ui` unaffected.                                                                                                                                                                                            |
| `@typescript-eslint/*`              | 8.50.x  | 8.63.x | Minor updates, no rule breakage.                                                                                                                                                                                               |
| `p-retry`                           | 6.x     | 8.0.0  | `onFailedAttempt` callback now receives a `RetryContext` object; updated `packages/harmony-engine/src/utils/retry.ts` to read `context.error.message` instead of `error.message`.                                              |
| `isomorphic-dompurify`              | 2.x     | 3.x    | No breaking changes hit.                                                                                                                                                                                                       |
| `html-react-parser`                 | 5.x     | 6.x    | No breaking changes hit.                                                                                                                                                                                                       |
| `eslint-import-resolver-typescript` | 3.x     | 4.x    | No breaking changes hit.                                                                                                                                                                                                       |
| `@types/node`                       | 25.x    | 26.x   | No breaking changes hit.                                                                                                                                                                                                       |
| `dotenv`                            | 16.x    | 17.x   | No breaking changes hit.                                                                                                                                                                                                       |

### Deferred: TypeScript 5.9 → 6.0

**Status:** ⏸️ Deferred, staying on `typescript@5.9.3`.

TypeScript 6.0 deprecates the `downlevelIteration` compiler option (`TS5101`), which is set in the
shared `packages/tooling/tsconfig` base config inherited by every workspace package. Removing it
is not a one-line fix — it requires auditing every package for reliance on down-level iteration
behavior (e.g. spreading `Map`/`Set`/generators when targeting older JS) and would touch the
shared tsconfig base used repo-wide, which is out of scope for a routine dependency-maintenance
pass. Revisit this in a dedicated follow-up once TypeScript 6.0 has had time to stabilize and/or
once there's a change budget for auditing `downlevelIteration` usage across all packages.

### Lint fix: unused `SpotifyProfileCard` import

Fixed the pre-existing `@typescript-eslint/no-unused-vars` lint failure in
`apps/web/src/app/(authenticated)/profile/page.tsx` — the component existed but was never
rendered. Added conditional rendering (mirroring the existing `TidalProfileCard` pattern) so
`SpotifyProfileCard` now renders when a user has a connected Spotify platform, instead of removing
the import.

---

## Future Considerations

### Next.js 16 Changes

Next.js 16 introduced several changes. Monitor for:

- App Router behavior changes
- Turbopack improvements and potential breaking changes
- React 19 compatibility improvements

### eslint-plugin-react-hooks v7

Version 7 of eslint-plugin-react-hooks may have stricter rules. Watch for new warnings in:

- Hook dependency arrays (`exhaustive-deps`)
- Conditional hook usage

### Review ingress: context menus on review-card subjects

Deferred from the review-ingress expansion work. `ReviewCard` / `ReviewSubjectPreview` render the
plain `ReviewSubjectDisplay` shape rather than a `HarmonizedEntity`, so they can't be wrapped with
`InteractiveWrapper` yet. See `docs/REVIEW_INGRESS.md` ("Deferred: context menus on review-card
subjects") for the two adaptation options — hydrating from the stored `ReviewSubject.snapshot` JSON
is preferred.

---

## Automated Audit

For future dependency audits, see: `agents/DEPENDENCY_AUDIT.md`

_Last updated: July 7, 2026_
