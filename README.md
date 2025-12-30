# Scilent One - Digital Project Template

A modern, production-ready web application template built with the latest technologies and best practices. This template emphasizes code quality, developer experience, and maintainability through comprehensive tooling and configuration.

## 🚀 Tech Stack

- **[Next.js 15.5.2](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://react.dev/)** - UI library
- **[TypeScript 5.7.2](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4.1.12](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo 2.3.1](https://turbo.build/repo)** - Monorepo management
- **[pnpm 10.15.0](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[@scilent-one/tooling](./packages/tooling)** - Unified ESLint, TypeScript, and Prettier configurations

## 📁 Project Structure

```bash
scilent-one/
├── apps/
│   └── web/                     # Next.js application
│       ├── src/
│       │   ├── app/             # App Router pages
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   └── globals.css
│       │   └── components/      # Reusable components
│       ├── public/              # Static assets
│       ├── package.json
│       ├── tsconfig.json        # Uses @scilent-one/tooling/typescript/nextjs
│       ├── eslint.config.mjs    # Uses @scilent-one/tooling/eslint/next
│       ├── .prettierrc.js       # Uses @scilent-one/tooling/prettier
│       ├── next.config.ts
│       └── tailwind.config.ts
├── packages/
│   └── tooling/                 # Shared development tooling
│       ├── eslint/              # ESLint configurations
│       │   ├── base.js          # Base TypeScript rules
│       │   ├── react.js         # React-specific rules
│       │   └── next.js          # Next.js optimizations
│       ├── typescript/          # TypeScript configurations
│       │   ├── base.json        # Base TypeScript config
│       │   ├── react.json       # React projects
│       │   └── nextjs.json      # Next.js projects
│       ├── prettier/            # Prettier configuration
│       │   └── index.js         # Formatting rules
│       ├── package.json
│       ├── README.md            # Detailed tooling documentation
│       └── SETUP.md             # Step-by-step setup guide
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── turbo.json                   # Turborepo configuration
├── eslint.config.mjs            # Root ESLint config
├── .prettierrc.js               # Root Prettier config
├── .prettierignore              # Prettier ignore patterns
└── README.md
```

## 🛠 Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- pnpm (will be installed automatically)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url> my-project
   cd my-project
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

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run ESLint on all packages
- `pnpm lint:check` - Check for linting issues without fixing
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Run TypeScript type checking

## 🧰 Tooling Package

This template includes a comprehensive tooling package (`@scilent-one/tooling`) that provides:

### Features

- **ESLint Configurations**: Multiple configurations for different project types
  - Base TypeScript configuration with import rules and strict type checking
  - React configuration with hooks and accessibility rules
  - Next.js configuration with performance and Core Web Vitals optimizations

- **TypeScript Configurations**: Reusable tsconfig.json files
  - Strict type checking with modern JavaScript support
  - Project-specific optimizations for React and Next.js
  - Path mapping and incremental compilation support

- **Prettier Configuration**: Consistent code formatting
  - Modern JavaScript defaults (single quotes, trailing commas)
  - File-specific rules for JSON, Markdown, and YAML
  - Comprehensive ignore patterns for build outputs and dependencies

### Quick Setup for New Projects

When adding a new package or app to the monorepo:

1. **Install the tooling package**:

   ```bash
   pnpm add -D @scilent-one/tooling eslint prettier typescript
   ```

2. **For Next.js apps**, create `eslint.config.mjs`:

   ```javascript
   import nextConfig from '@scilent-one/tooling/eslint/next';
   export default nextConfig;
   ```

3. **Create `tsconfig.json`**:

   ```json
   {
     "extends": "@scilent-one/tooling/typescript/nextjs"
   }
   ```

4. **Create `.prettierrc.js`**:

```javascript
module.exports = require('@scilent-one/tooling/prettier');
```

For detailed setup instructions, see [`packages/tooling/SETUP.md`](./packages/tooling/SETUP.md).

## 🎯 Development Workflow

### Code Quality

This template enforces high code quality through:

- **Static Analysis**: ESLint catches potential bugs and enforces best practices
- **Type Safety**: TypeScript provides compile-time error checking
- **Code Formatting**: Prettier ensures consistent code style
- **Import Organization**: Automatic import sorting and unused import removal

### Editor Setup

For the best development experience, install these VS Code extensions:

- **ESLint** (`ms-vscode.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **TypeScript Importer** (`pmneo.tsimporter`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

The repository includes `.vscode/settings.json` with optimized configuration.

### Monorepo Benefits

- **Shared Dependencies**: Common packages are hoisted to the root
- **Consistent Tooling**: Same ESLint, TypeScript, and Prettier configs across all packages
- **Fast Builds**: Turborepo caches and parallelizes builds
- **Type Safety**: Cross-package type checking and imports

## 🏗 Architecture Decisions

### Why This Structure?

- **Scalability**: Easy to add new apps and packages
- **Maintainability**: Shared tooling reduces configuration drift
- **Developer Experience**: Consistent setup across all projects
- **Performance**: Optimized build pipeline with caching

### Package Organization

- **`apps/`**: Deployable applications (web apps, mobile apps, etc.)
- **`packages/`**: Shared libraries and tooling
- **`tooling/`**: Development configurations and tools

### Technology Choices

- **Next.js**: Full-stack React framework with excellent DX
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **TypeScript**: Type safety and better developer experience
- **Turborepo**: Efficient monorepo management with smart caching
- **pnpm**: Fast package manager with efficient disk usage

## 📦 Adding New Packages

### Creating a New App

1. **Create the app directory**:

   ```bash
   mkdir apps/my-new-app
   cd apps/my-new-app
   ```

2. **Initialize package.json**:

   ```bash
   pnpm init
   ```

3. **Install dependencies** including the tooling package:

   ```bash
   pnpm add -D @scilent-one/tooling eslint prettier typescript
   ```

4. **Set up configurations** following the [setup guide](./packages/tooling/SETUP.md)

5. **Add to Turborepo** by updating `turbo.json` if needed

### Creating a Shared Package

1. **Create the package directory**:

   ```bash
   mkdir packages/my-package
   cd packages/my-package
   ```

2. **Follow the same setup process** as above

3. **Export the package** in the main `package.json` if it should be publishable

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure build settings**:
   - Build Command: `pnpm turbo build --filter=web`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`

### Self-Hosted

1. **Build the application**:

   ```bash
   pnpm build
   ```

2. **Start the production server**:

   ```bash
   cd apps/web
   pnpm start
   ```

## 🤝 Contributing

### Development Guidelines

- Follow the established code style (enforced by ESLint/Prettier)
- Write TypeScript for all new code
- Add tests for new functionality
- Update documentation for significant changes

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the coding standards
3. **Run quality checks**:

   ```bash
   pnpm lint:check
   pnpm format:check
   pnpm typecheck
   pnpm build
   ```

4. **Submit a pull request** with a clear description

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tooling Package Guide](./packages/tooling/README.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
