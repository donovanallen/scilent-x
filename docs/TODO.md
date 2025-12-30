# TODO - Dependency Audit Follow-up Items

This document tracks technical debt and refactoring opportunities identified during the dependency
audit process.

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

| Severity | Package   | Issue                                        | Affected Path              |
| -------- | --------- | -------------------------------------------- | -------------------------- |
| Moderate | js-yaml   | Prototype pollution in merge (needs >=4.1.1) | @turbo/gen → @turbo/workspaces |
| Low      | tmp       | Arbitrary temp file write via symlink        | @turbo/gen → inquirer → external-editor |

These are dependencies of `@turbo/gen` and will be resolved when Turborepo updates their dependencies.

---

## Major Version Updates Applied

The following major version updates were applied during the audit:

| Package                    | From     | To       | Notes                           |
| -------------------------- | -------- | -------- | ------------------------------- |
| next                       | 15.5.2   | 16.1.1   | Major Next.js update            |
| react                      | 19.1.0   | 19.2.3   | React 19 minor update           |
| react-dom                  | 19.1.0   | 19.2.3   | React DOM 19 minor update       |
| eslint-config-next         | 15.5.2   | 16.1.1   | Follows Next.js version         |
| eslint-config-prettier     | 9.1.2    | 10.1.8   | Major version update            |
| eslint-plugin-react-hooks  | 5.2.0    | 7.0.1    | Major update (v6 was skipped)   |
| @types/node                | 20.x     | 25.x     | Node.js types major update      |
| @typescript-eslint/\*      | 8.41.0   | 8.50.1   | TypeScript ESLint minor updates |
| turbo                      | 2.5.6    | 2.7.2    | Turborepo minor update          |
| typescript                 | 5.9.2    | 5.9.3    | TypeScript patch update         |
| tailwindcss                | 4.1.12   | 4.1.18   | Tailwind CSS patch update       |
| prettier                   | 3.6.2    | 3.7.4    | Prettier minor update           |
| eslint                     | 9.34.0   | 9.39.2   | ESLint minor update             |

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

---

## Automated Audit

For future dependency audits, see: `agents/DEPENDENCY_AUDIT.md`

_Last updated: December 28, 2025_
