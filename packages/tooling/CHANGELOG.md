# Changelog

## 0.1.3

### Patch Changes

- Routine dependency maintenance across the monorepo.

  - Updated all in-range dependencies to their latest minor/patch versions
    (Radix UI, Tiptap, Storybook, Vitest, Prisma, @typescript-eslint, Turbo, etc.)
  - Bumped `next` to 16.2.10, `react`/`react-dom` to 19.2.7, and `lucide-react`
    to 1.23.0 (fixed the one breaking change: the removed `Github` brand icon
    in a Storybook story)
  - Deliberately upgraded several majors after verifying no breaking impact:
    `date-fns` 3 -> 4, `pino` 9 -> 10, `zod` 3 -> 4 (updated `z.record()` calls
    to the new two-argument signature), `eslint` 9 -> 10, `chromatic` 13 -> 18,
    `vite` 7 -> 8, `@vitejs/plugin-react` 5 -> 6, `vite-plugin-svgr` 4 -> 5,
    `p-retry` 6 -> 8 (updated `onFailedAttempt` to the new `RetryContext` shape),
    `@types/node` 25 -> 26, `dotenv` 16 -> 17, `isomorphic-dompurify` 2 -> 3,
    `html-react-parser` 5 -> 6, and `eslint-import-resolver-typescript` 3 -> 4
  - Deferred the TypeScript 5.9 -> 6.0 major upgrade; see `docs/TODO.md` for
    the reason (deprecated `downlevelIteration` compiler option breaks the
    shared tsconfig base repo-wide)

## 0.1.2

### Patch Changes

- 57e05c8: Adds new components (UI), updates linting (Tooling)

## 0.1.1

### Patch Changes

- 77241d6: ALL: Init and configured changesets for versioning. DB: Removed postinstall script.

All notable changes to the `@scilent-one/tooling` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### Added

- **Initial release** of the unified tooling package
- **ESLint configurations**:
  - `eslint/base.js` - Base TypeScript configuration
  - `eslint/react.js` - React-specific rules and best practices
  - `eslint/next.js` - Next.js optimizations and App Router support
- **TypeScript configurations**:
  - `typescript/base.json` - Strict TypeScript settings for any project
  - `typescript/react.json` - React and DOM type definitions
  - `typescript/nextjs.json` - Next.js specific optimizations
- **Prettier configuration**:
  - `prettier/index.js` - Consistent formatting rules
  - File-specific overrides for JSON, Markdown, YAML
  - Comprehensive ignore patterns
- **Documentation**:
  - Complete README with usage examples
  - Setup guide for different project types
  - Migration guide from `@scilent-one/eslint-config`
  - Troubleshooting guide
- **Export system**:
  - Individual exports for tree-shaking
  - Convenience exports through main index
  - TypeScript config path resolution utilities

### Migration Notes

This package replaces the previous `@scilent-one/eslint-config` package with a more comprehensive tooling solution:

- **Breaking Change**: ESLint configurations now use the flat config format
- **New**: TypeScript and Prettier configurations are now included
- **Improved**: Better project-specific configurations
- **Enhanced**: More comprehensive documentation and setup guides

### Dependencies

- `@typescript-eslint/eslint-plugin`: ^8.20.0
- `@typescript-eslint/parser`: ^8.20.0
- `eslint-config-next`: ^15.5.2
- `eslint-config-prettier`: ^9.1.0
- `eslint-plugin-import`: ^2.31.0
- `typescript`: ^5.7.2

### Peer Dependencies

- `eslint`: ^9.0.0
- `prettier`: ^3.0.0
- `typescript`: ^5.0.0
