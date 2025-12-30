# Dependency Audit Agent Instructions

This document provides step-by-step instructions for AI agents to efficiently audit and update
dependencies in the **scilent-one** monorepo.

---

## Repository Overview

This is a **pnpm monorepo** with the following structure:

```bash
├── apps/
│   └── web/          # Next.js web application
├── packages/
│   ├── db/           # Prisma database client (@scilent-one/db)
│   └── tooling/      # Shared ESLint, TypeScript, and Prettier configs
├── package.json      # Root workspace configuration
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo configuration
```

### Key Technologies

- **Package Manager:** pnpm (version specified in `packageManager` field)
- **Build System:** Turborepo
- **Framework:** Next.js (with Turbopack)
- **UI:** React 19 + Tailwind CSS v4
- **Database:** Prisma v7 with PostgreSQL
- **Language:** TypeScript
- **Linting:** ESLint 9 (flat config format)
- **Formatting:** Prettier

---

## Pre-Audit Checklist

Before starting the audit, understand:

1. **Read all `package.json` files:**
   - `/package.json` (root)
   - `/apps/web/package.json`
   - `/packages/db/package.json`
   - `/packages/tooling/package.json`

2. **Understand the workspace relationships:**
   - `@scilent-one/tooling` is an internal workspace package used by `web` and `db`
   - `@scilent-one/db` is used by `web` for database access

3. **Check current pnpm version:**
   - Defined in root `package.json` under `packageManager`

---

## Step-by-Step Audit Process

### Step 1: Install Current Dependencies

```bash
cd /path/to/nhb
pnpm install
```

This ensures you have a clean baseline.

### Step 2: Check for Outdated Dependencies

```bash
pnpm outdated -r
```

This shows all outdated packages across all workspaces. The output includes:

- Package name
- Current version
- Latest version
- Which workspace depends on it

### Step 3: Identify Breaking Changes

Before updating, categorize the outdated packages:

#### Safe Updates (Patch/Minor)

- Patch: `x.y.Z` → `x.y.Z+1` (bug fixes)
- Minor: `x.Y.z` → `x.Y+1.z` (new features, backwards compatible)

#### Breaking Updates (Major)

- Major: `X.y.z` → `X+1.y.z` (breaking changes)

**Common major update concerns in this repo:**

| Package               | Watch For                                     |
| --------------------- | --------------------------------------------- |
| `next`                | App Router changes, API changes, build config |
| `react` / `react-dom` | Hook changes, rendering behavior              |
| `eslint`              | Flat config changes, rule changes             |
| `typescript`          | Stricter type checking, new errors            |
| `tailwindcss`         | v4 uses different config approach than v3     |
| `eslint-plugin-*`     | Rule changes, new warnings                    |
| `prisma`              | Schema changes, client API, adapter changes   |
| `@prisma/client`      | Query API changes, type generation            |

### Step 4: Update Dependencies

#### Option A: Update All at Once (Recommended for minor updates)

```bash
pnpm update -r --latest
```

#### Option B: Update Specific Package

```bash
pnpm update <package-name> --latest -r
```

#### Option C: Interactive Update (if available)

```bash
pnpm update -r -i --latest
```

### Step 5: Verify Updates

Run all verification commands:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build
pnpm build

# Format check (optional)
pnpm format
```

**All commands must pass before considering the audit complete.**

### Step 6: Fix Breaking Changes

If any verification step fails:

1. **Read the error message carefully**
2. **Check the package's changelog/migration guide**
3. **Common fixes:**
   - ESLint config format changes → Update to flat config
   - TypeScript errors → Check compiler options
   - Build failures → Check Next.js config or Tailwind setup

### Step 7: Document Changes

Update `/docs/TODO.md` with:

- Any issues encountered
- Workarounds applied
- Future refactoring needs

---

## Package-Specific Notes

### Next.js Updates

Next.js major versions often have significant changes. Check:

- [Next.js Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- App Router vs Pages Router differences
- `next.config.ts` option changes

### ESLint 9+ (Flat Config)

This repo uses ESLint 9 with flat config format. Key points:

- Configs are arrays of config objects
- No more `.eslintrc` format
- Plugins are imported directly

The tooling configs are in:

- `packages/tooling/eslint/base.js` (CommonJS)
- `packages/tooling/eslint/base.mjs` (ESM)
- `packages/tooling/eslint/next.js`
- `packages/tooling/eslint/react.js`

### Tailwind CSS v4

Tailwind CSS v4 uses a different approach:

- CSS-first configuration via `@theme` directive
- `@import 'tailwindcss';` in CSS files
- No `tailwind.config.js` by default

### TypeScript ESLint

When updating `@typescript-eslint/*` packages:

- Both `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` should be same version
- Check for deprecated rules

### Prisma

When updating `prisma` and `@prisma/client`:

- Both packages should be the same version
- Run `pnpm --filter @scilent-one/db db:generate` after updating
- Check the [Prisma upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides) for breaking changes
- Prisma v7 uses `prisma-client` generator (not `prisma-client-js`)
- The `@prisma/adapter-pg` package should match the Prisma version

For database-specific agent instructions, see: `agents/DB.md`

---

## Quick Reference Commands

```bash
# Install dependencies
pnpm install

# Check outdated packages
pnpm outdated -r

# Update all to latest
pnpm update -r --latest

# Verify - run all checks
pnpm typecheck && pnpm lint && pnpm build

# Clean install (if issues)
rm -rf node_modules apps/*/node_modules packages/*/node_modules pnpm-lock.yaml
pnpm install

# Check for security vulnerabilities
pnpm audit
```

---

## Troubleshooting

### "Cannot find module" errors after update

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### ESLint config errors

- Ensure all configs export arrays (flat config format)
- Check that plugins are correctly imported with `require()` or `import`

### TypeScript errors after update

- Check `tsconfig.json` for deprecated options
- Review strict mode settings

### Build failures with Next.js

- Check `next.config.ts` for deprecated options
- Ensure React versions are compatible

---

## Post-Audit Checklist

- [ ] All `pnpm outdated -r` shows no critical updates
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] `docs/TODO.md` updated with any notes
- [ ] `agents/DEPENDENCY_AUDIT.md` updated with any changes/updates to this process
- [ ] Test the dev server: `pnpm dev`

---

## Audit Schedule Recommendation

- **Weekly:** Check for security patches (`pnpm audit`)
- **Monthly:** Review outdated packages
- **Quarterly:** Apply major updates with full testing

---

_Last updated: December 28, 2025_
