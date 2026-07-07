# Scilent X

[![Unit Tests](https://codecov.io/github/donovanallen/scilent-x/graph/badge.svg?token=BEPTXH1JIK)](https://codecov.io/github/donovanallen/scilent-x)

Based on [Scilent One](https://www.github.com/scilentdigital/scilent-one) Template

**scilent-x** is a pnpm + Turborepo monorepo for a music-focused social platform: a Next.js 16
web application (`apps/web`) backed by shared packages for UI, authentication, database access,
logging, social features, and music-metadata harmonization.

## 🚀 Tech Stack

- **[Next.js 16.2.10](https://nextjs.org/)** - React framework with App Router + Turbopack
- **[React 19.2.7](https://react.dev/)** - UI library
- **[TypeScript 5.9.3](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo](https://turbo.build/repo)** - Monorepo build orchestration
- **[pnpm 10](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[Prisma 7](https://www.prisma.io/)** + PostgreSQL (`@prisma/adapter-pg`) - Database ORM
- **[Better Auth](https://www.better-auth.com/)** - Authentication (email/password + OAuth)
- **[Radix UI](https://www.radix-ui.com/)** primitives with shadcn/ui-style patterns
- **[Vitest](https://vitest.dev/)** - Unit testing, **[Storybook 10](https://storybook.js.org/)** - Component development
- **[Changesets](https://github.com/changesets/changesets)** - Versioning and changelogs for packages
- **[@scilent-one/tooling](./packages/tooling)** - Unified ESLint, TypeScript, and Prettier configurations

## 📁 Project Structure

```bash
scilent-x/
├── apps/
│   └── web/                       # Next.js 16 application (Turbopack, App Router)
│       ├── src/
│       │   ├── app/                # App Router routes
│       │   │   ├── (authenticated)/  # admin, explore, feed, post, profile, search, settings, users
│       │   │   ├── (unauthenticated)/ # login, signup
│       │   │   └── api/            # Route handlers (incl. Better Auth)
│       │   └── components/         # App-specific components
│       └── public/                 # Static assets
├── packages/
│   ├── ui/                        # @scilent-one/ui - shared UI primitives (Radix + shadcn patterns)
│   ├── scilent-ui/                # @scilent-one/scilent-ui - composite UI for harmonized music data
│   ├── db/                        # @scilent-one/db - Prisma 7 + PostgreSQL client
│   ├── auth/                      # @scilent-one/auth - Better Auth server/client config
│   ├── logger/                    # @scilent-one/logger - structured logging (pino)
│   ├── social/                    # @scilent-one/social - posts, comments, follows, feeds
│   ├── harmony-engine/            # @scilent-one/harmony-engine - music metadata harmonization
│   └── tooling/                   # @scilent-one/tooling - shared ESLint/TypeScript/Prettier configs
├── docs/                          # Product/process docs (auth, database, release, setup)
├── agents/                        # Claude-Code-oriented docs (tech stack, DB, dependency audit, specs)
├── .cursor/                       # Cursor Cloud Agent config, hooks, skills
├── package.json                   # Root package.json (turbo scripts)
├── pnpm-workspace.yaml             # pnpm workspace + dependency catalogs
├── turbo.json                     # Turborepo task pipeline
└── AGENTS.md                      # Entry point for AI coding agents
```

## 🛠 Getting Started

### Prerequisites

- **Node.js** - version pinned in [`.nvmrc`](./.nvmrc) (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** - version pinned in the root `package.json` `packageManager` field (use [Corepack](https://pnpm.io/installation#using-corepack) to pick it up automatically)
- **PostgreSQL** - only required if you want to run the app with a live database (see [Database Setup](#-database-setup))

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/donovanallen/scilent-x.git
   cd scilent-x
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Start the development server**:

   ```bash
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

Run from the repo root via Turborepo; add `--filter <package>` to scope to a single package.

| Script                | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `pnpm dev`            | Start development servers for all apps                 |
| `pnpm dev:ui`         | Run the `@scilent-one/ui` sandbox (Vite)               |
| `pnpm storybook:ui`   | Run Storybook for `@scilent-one/ui`                    |
| `pnpm storybook:h-ui` | Run Storybook for `@scilent-one/scilent-ui`            |
| `pnpm build`          | Build all apps and packages                            |
| `pnpm lint`           | Run ESLint across all packages                         |
| `pnpm format`         | Format code with Prettier                              |
| `pnpm typecheck`      | Run TypeScript type checking                           |
| `pnpm test`           | Run unit tests (Vitest)                                |
| `pnpm test:coverage`  | Run unit tests with coverage                           |
| `pnpm fix`            | Run `lint` + `format` + `typecheck`                    |
| `pnpm db:generate`    | Generate the Prisma client                             |
| `pnpm db:migrate`     | Run Prisma migrations (dev)                            |
| `pnpm db:push`        | Push schema changes without migrations                 |
| `pnpm db:studio`      | Open Prisma Studio                                     |
| `pnpm changeset`      | Author a changeset for a package change                |
| `pnpm version`        | Apply pending changesets to package versions           |
| `pnpm release`        | Publish packages (private packages are skipped)        |
| `pnpm reinstall`      | Clean all build artifacts/`node_modules` and reinstall |

See [`package.json`](./package.json) and [`turbo.json`](./turbo.json) for the authoritative list.

## 🗄 Database Setup

The app uses Prisma 7 with PostgreSQL via `@scilent-one/db`. To run it locally:

```bash
cp packages/db/.env.example packages/db/.env
# edit packages/db/.env with your DATABASE_URL

pnpm --filter @scilent-one/db db:generate
pnpm --filter @scilent-one/db db:push
```

A live database status dashboard is available at [`/db`](http://localhost:3000/db) once the app
is running. See [`docs/DATABASE.mdx`](./docs/DATABASE.mdx) for full setup, schema, and
troubleshooting details.

## 🔐 Authentication Setup

Authentication is handled by [Better Auth](https://www.better-auth.com/) via `@scilent-one/auth`,
supporting email/password and OAuth (Google, GitHub, Apple). Configure `apps/web/.env` (see
`apps/web/.env.example`) with `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`, plus any
OAuth provider credentials you need. Full setup instructions and API reference are in
[`docs/AUTH.md`](./docs/AUTH.md).

## 🧰 Tooling Package

`@scilent-one/tooling` centralizes code-quality configuration across the monorepo:

- **ESLint**: layered configs — `eslint/base.js` (TypeScript) → `eslint/react.js` (React/hooks/a11y) → `eslint/next.js` (Next.js + Core Web Vitals)
- **TypeScript**: layered `tsconfig` bases — `typescript/base.json` → `typescript/react.json` → `typescript/nextjs.json`
- **Prettier**: shared formatting rules with file-specific overrides (JSON, Markdown, YAML)

For detailed setup instructions when adding a new app/package, see
[`packages/tooling/SETUP.md`](./packages/tooling/SETUP.md).

## 🎯 Development Workflow

### Code Quality

- **Static Analysis**: ESLint catches bugs and enforces best practices
- **Type Safety**: TypeScript provides compile-time checking
- **Formatting**: Prettier ensures consistent code style
- **Testing**: Vitest for unit tests, Storybook for isolated component development
- **CI**: GitHub Actions run tests, changeset status checks, and releases (see [`.github/workflows`](./.github/workflows))

### Versioning (Changesets)

Any change under `packages/*` (except `packages/tooling`) requires a changeset:

```bash
pnpm changeset
```

See [`docs/RELEASE.md`](./docs/RELEASE.md) for the full release flow. `apps/web` changes are
excluded from changeset versioning.

### Editor Setup

For the best development experience, install:

- **ESLint** (`ms-vscode.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

## 📚 Documentation

| Doc                                                                | Description                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| [`AGENTS.md`](./AGENTS.md)                                         | Entry point for AI coding agents (Cursor et al.)     |
| [`agents/CLAUDE.md`](./agents/CLAUDE.md)                           | Tech stack + commands for Claude Code                |
| [`docs/INITIAL_SETUP.md`](./docs/INITIAL_SETUP.md)                 | Detailed onboarding/customization guide              |
| [`docs/AUTH.md`](./docs/AUTH.md)                                   | Better Auth setup, OAuth providers, API reference    |
| [`docs/DATABASE.mdx`](./docs/DATABASE.mdx)                         | Prisma/PostgreSQL setup, schema, troubleshooting     |
| [`docs/RELEASE.md`](./docs/RELEASE.md)                             | Changesets versioning and release flow               |
| [`docs/AGENT_TOOLING.md`](./docs/AGENT_TOOLING.md)                 | Cursor Cloud Agent config, hooks, and skills         |
| [`docs/TODO.md`](./docs/TODO.md)                                   | Dependency audit history and technical debt tracking |
| [`agents/HARMONY_ENGINE_SPEC.md`](./agents/HARMONY_ENGINE_SPEC.md) | Music metadata harmonization engine spec             |
| [`agents/HARMONY_IX_SPEC.md`](./agents/HARMONY_IX_SPEC.md)         | Harmony interaction/UX spec                          |
| [`packages/tooling/SETUP.md`](./packages/tooling/SETUP.md)         | Step-by-step guide for adding new apps/packages      |

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect the repository** to Vercel
2. **Configure build settings**:
   - Build Command: `pnpm turbo build --filter=web`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`

### Self-Hosted

```bash
pnpm build
cd apps/web
pnpm start
```

## 🤝 Contributing

1. **Create a feature branch** from `main`
2. **Make your changes**, following the existing conventions (see [`AGENTS.md`](./AGENTS.md))
3. **Run quality checks**:

   ```bash
   pnpm fix
   pnpm build
   pnpm test
   ```

4. **Add a changeset** if your change touches a versioned package: `pnpm changeset`
5. **Submit a pull request** with a clear description
