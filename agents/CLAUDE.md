# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**scilent-x** is a monorepo for a Next.js web application with shared packages for UI components, authentication, and database access.

## Tech Stack

- **Runtime**: Node.js with pnpm 10.26.2 as package manager
- **Build System**: Turborepo for monorepo orchestration
- **Framework**: Next.js 16 with Turbopack (React 19)
- **Styling**: Tailwind CSS v4
- **Database**: Prisma 7 with PostgreSQL (pg adapter)
- **Authentication**: Better Auth
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Testing**: Vitest, Playwright, Storybook 10

## Monorepo Structure

```bash
apps/
  web/              # Next.js 16 web application
packages/
  ui/               # @scilent-one/ui - Shared UI component library
  db/               # @scilent-one/db - Prisma database client
  auth/             # @scilent-one/auth - Better Auth configuration
  tooling/          # @scilent-one/tooling - Shared ESLint, TypeScript, Prettier configs
```

## Common Commands

```bash
# Development
pnpm dev                    # Run all apps in dev mode
pnpm dev:ui                 # Run UI sandbox (Vite)
pnpm dev:ui:storybook       # Run Storybook for UI package

# Build & Quality
pnpm build                  # Build all packages/apps
pnpm lint                   # Lint all packages
pnpm format                 # Format all packages
pnpm typecheck              # Type check all packages
pnpm fix                    # Run lint + format + typecheck

# Database (from packages/db or via turbo)
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run migrations (dev)
pnpm db:push                # Push schema changes
pnpm db:studio              # Open Prisma Studio

# Versioning & Release
pnpm changeset              # Create a changeset
pnpm version                # Apply changesets to versions
pnpm release                # Publish packages

# Maintenance
pnpm clean:full             # Remove node_modules and build artifacts
pnpm reinstall              # Clean and reinstall dependencies
```

## Package Imports

Internal packages use workspace protocol:

- `@scilent-one/ui` - UI components, exports `/utils` and `/globals.css`
- `@scilent-one/db` - Prisma client
- `@scilent-one/auth` - Exports `/server` and `/client` for auth
- `@scilent-one/tooling` - Config exports for eslint, typescript, prettier

## Key Patterns

- UI components follow shadcn/ui patterns with Radix primitives
- Shared tooling configs are extended from `@scilent-one/tooling`
- Database migrations are in `packages/db/prisma/`
- Environment variables: check `.env.example` files in packages/db and packages/ui
