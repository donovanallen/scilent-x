# Initial Setup Guide for Template Users

Welcome to the Scilent One template! This guide will help you get started after forking or cloning this template repository.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (recommended: [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** (will be installed automatically)
- **Git** for version control

### Initial Setup

1. **Clone or fork the repository**:

   ```bash
   # If you forked it:
   git clone https://github.com/your-username/your-project-name.git
   cd your-project-name

   # Or if you're using it as a template:
   # Download and extract, then:
   git init
   git add .
   git commit -m "Initial commit from Scilent One template"
   ```

2. **Update package information**:

   ```bash
   # Update the root package.json name
   # Replace "scilent-one" with your project name
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Start development**:

   ```bash
   pnpm dev
   ```

5. **Set up database** (optional, if using `@scilent-one/db`):

   ```bash
   # Copy the environment template
   cp packages/db/.env.example packages/db/.env

   # Edit packages/db/.env with your PostgreSQL connection string
   # Then generate the Prisma client and push schema
   pnpm --filter @scilent-one/db db:generate
   pnpm --filter @scilent-one/db db:push
   ```

   See [DATABASE.md](./DATABASE.md) for detailed database setup instructions.

6. **Verify everything works**:

   ```bash
   # Run all quality checks
   pnpm lint
   pnpm format
   pnpm typecheck

   # Build the project
   pnpm build
   ```

## 🛠 Customizing the Template

### Project Configuration

1. **Update project names** in these files:
   - Root `package.json`: Update the `"name"` field
   - `apps/web/package.json`: Update the `"name"` field
   - `README.md`: Update the title and repository references

2. **Customize tooling configurations**:
   - The `@scilent-one/tooling` package contains all ESLint, TypeScript, and Prettier configurations
   - Configurations are designed to be minimal and reusable
   - You can extend them in individual apps/packages as needed

3. **Update repository URLs**:
   - Update any GitHub links in documentation
   - Update CI/CD configurations if needed
   - Update license information

### Adding New Apps or Packages

Follow the comprehensive guide in [`packages/tooling/SETUP.md`](../packages/tooling/SETUP.md) for adding new:

- Next.js applications
- React applications
- Node.js packages/libraries

## 🎯 Development Workflow

### Code Quality Standards

This template enforces high code quality through:

- **ESLint**: Catches bugs and enforces best practices
- **TypeScript**: Provides type safety and better developer experience
- **Prettier**: Ensures consistent code formatting
- **Turborepo**: Optimizes build and development workflows

### Recommended Workflow

1. **Make changes** to your code
2. **Run formatting**: `pnpm format`
3. **Run linting**: `pnpm lint`
4. **Type check**: `pnpm typecheck`
5. **Test build**: `pnpm build`
6. **Commit changes**

### Editor Setup

For the best development experience:

1. **Install VS Code extensions**:
   - ESLint (`ms-vscode.vscode-eslint`)
   - Prettier (`esbenp.prettier-vscode`)
   - TypeScript Importer (`pmneo.tsimporter`)

2. **The template includes** `.vscode/` configuration for optimal development experience

## 📦 Understanding the Packages

### `@scilent-one/tooling`

The tooling package is the heart of code quality in this template:

### What's Included

- **ESLint Configurations**:
  - `eslint/base.js` - Base TypeScript rules
  - `eslint/react.js` - React-specific rules (extends base)
  - `eslint/next.js` - Next.js optimizations (extends React)

- **TypeScript Configurations**:
  - `typescript/base.json` - Strict TypeScript settings
  - `typescript/react.json` - React projects (extends base)
  - `typescript/nextjs.json` - Next.js projects (extends React)

- **Prettier Configuration**:
  - `prettier/index.js` - Consistent formatting rules

### Customization Options

You can customize configurations at different levels:

1. **Global level**: Modify configurations in `packages/tooling/`
2. **App level**: Extend configurations in individual apps
3. **File level**: Override specific rules for specific files

Example of extending ESLint config in an app:

```javascript
// apps/my-app/eslint.config.mjs
import nextConfig from '@scilent-one/tooling/eslint/next';

export default [
  ...nextConfig,
  {
    rules: {
      'no-console': 'error', // Stricter than default
    },
  },
];
```

### `@scilent-one/db`

The database package provides a pre-configured Prisma ORM setup:

- **Prisma v7** with the new `prisma-client` generator
- **PostgreSQL** adapter (`@prisma/adapter-pg`) for optimal performance
- **Singleton pattern** to prevent connection pool exhaustion in development
- **Auth-ready schema** with User, Account, Session, and VerificationToken models

For detailed setup and usage, see [DATABASE.md](./DATABASE.md).

Quick usage example:

```typescript
import { db } from '@scilent-one/db';

// In Next.js server components or API routes
const users = await db.user.findMany();
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure build settings**:
   - Framework Preset: Next.js
   - Build Command: `pnpm turbo build --filter=web`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`

### Other Platforms

The template works with any hosting provider that supports Node.js:

- **Netlify**: Use the same build commands
- **Railway**: Configure with the build settings above
- **Self-hosted**: Use `pnpm build` and deploy the `.next` folder

## 🔧 Advanced Configuration

### Adding New Dependencies

When adding new dependencies that affect code quality:

1. **Add to the appropriate package**:
   - Shared dependencies: Root `package.json`
   - App-specific: Individual app `package.json`
   - Tooling-related: `packages/tooling/package.json`

2. **Update configurations** if needed:
   - ESLint plugins: Add to tooling package
   - TypeScript types: Add to appropriate package
   - Prettier plugins: Add to tooling package

### Monorepo Management

This template uses Turborepo for efficient monorepo management:

- **Caching**: Build outputs are cached for faster subsequent builds
- **Parallelization**: Tasks run in parallel when possible
- **Dependency awareness**: Builds happen in the correct order

### CI/CD Setup

The template is ready for CI/CD with example GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml (create this file)
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint:check
      - run: pnpm format:check
      - run: pnpm typecheck
      - run: pnpm build
```

## 📚 Additional Resources

- **[Main README](../README.md)**: Overview of the entire template
- **[Tooling Guide](../packages/tooling/README.md)**: Detailed tooling documentation
- **[Setup Guide](../packages/tooling/SETUP.md)**: Step-by-step configuration instructions
- **[Database Guide](./DATABASE.md)**: Prisma setup and usage instructions
- **[Database Package README](../packages/db/README.md)**: Quick reference for `@scilent-one/db`

## ❓ Common Questions

### Q: Can I remove or change the tooling package?

A: Yes! The tooling package is designed to be modular. You can:

- Modify configurations in `packages/tooling/`
- Replace it entirely with your own configurations
- Add additional tools like Stylelint, Commitlint, etc.

### Q: How do I add a new linting rule?

A: You can add rules at different levels:

- **Project-wide**: Modify `packages/tooling/eslint/` files
- **App-specific**: Extend the config in your app's `eslint.config.mjs`

### Q: Can I use a different package manager?

A: The template is designed for pnpm, but you can adapt it:

- Update `package.json` scripts
- Replace `pnpm-workspace.yaml` with appropriate config
- Update CI/CD configurations

### Q: How do I add Storybook/Jest/other tools?

A: The template is designed to be extended:

1. Install the tools in the appropriate package
2. Add configurations following the same pattern as existing tools
3. Update package.json scripts
4. Add to Turborepo pipeline if needed

## 🎉 You're Ready!

You now have a fully configured, production-ready development environment with:

- ✅ Code quality tools (ESLint, TypeScript, Prettier)
- ✅ Monorepo management (Turborepo, pnpm)
- ✅ Development server with hot reload
- ✅ Build optimization and caching
- ✅ Database layer (Prisma ORM with PostgreSQL)
- ✅ Comprehensive documentation

Start building your amazing project! 🚀
