# Setup Guide for @scilent-one/tooling

This guide will walk you through setting up the tooling package for different types of projects. Follow the instructions that match your project type.

## 🚀 Quick Setup

### For New Projects

When creating a new project that will use the tooling package:

1. **Install the tooling package**:

   ```bash
   pnpm add -D @scilent-one/tooling eslint prettier typescript
   ```

2. **Choose your project type** and follow the appropriate setup section below.

3. **Install editor extensions** for ESLint and Prettier.

4. **Run initial setup**:

   ```bash
   # Format all files
   pnpm format

   # Check for linting issues
   pnpm lint:check

   # Check types
   pnpm type-check
   ```

## 📝 Project-Specific Setup

### Next.js Applications

Perfect for full-stack React applications with SSR/SSG capabilities.

#### 1. ESLint Configuration

Create `eslint.config.mjs`:

```javascript
import nextConfig from '@scilent-one/tooling/eslint/next';

export default [
  ...nextConfig,
  {
    // Optional: Add project-specific rules
    rules: {
      // Your custom rules here
    },
  },
];
```

#### 2. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "extends": "@scilent-one/tooling/typescript/nextjs",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

#### 3. Package Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:check": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

### React Applications (Vite/CRA)

For client-side React applications without Next.js features.

#### 1. ESLint Configuration

Create `eslint.config.mjs`:

```javascript
import reactConfig from '@scilent-one/tooling/eslint/react';

export default [
  ...reactConfig,
  {
    // Optional: Add project-specific rules
    env: {
      browser: true,
    },
  },
];
```

#### 2. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "extends": "@scilent-one/tooling/typescript/react",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Node.js Libraries/Packages

For backend services, CLI tools, or npm packages.

#### 1. ESLint Configuration

Create `eslint.config.mjs`:

```javascript
import baseConfig from '@scilent-one/tooling/eslint/base';

export default [
  ...baseConfig,
  {
    env: {
      node: true,
    },
    rules: {
      // Allow console in Node.js applications
      'no-console': 'off',
    },
  },
];
```

#### 2. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "extends": "@scilent-one/tooling/typescript/base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "ES2020",
    "module": "CommonJS",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

## 🎨 Prettier Setup (All Projects)

### 1. Configuration File

Create `.prettierrc.js`:

```javascript
const config = require('@scilent-one/tooling/prettier');

module.exports = {
  ...config,
  // Optional: Project-specific overrides
  // printWidth: 120,
};
```

### 2. Ignore File

Create `.prettierignore`:

```
# Use the shared patterns
node_modules/
dist/
build/
.next/
*.min.js
*.min.css
.turbo/
coverage/

# Add project-specific patterns here
```

## 🔧 Editor Integration

### VS Code

Install the following extensions:

- **ESLint**: `ms-vscode.vscode-eslint`
- **Prettier**: `esbenp.prettier-vscode`
- **TypeScript Importer**: `pmneo.tsimporter`

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "pmneo.tsimporter",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### WebStorm/IntelliJ

1. **Enable ESLint**:
   - Go to `Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
   - Check "Automatic ESLint configuration"
   - Check "Run eslint --fix on save"

2. **Enable Prettier**:
   - Go to `Settings > Languages & Frameworks > JavaScript > Prettier`
   - Set "Prettier package" to the installed prettier
   - Check "On 'Reformat Code' action"
   - Check "On save"

## 🚀 CI/CD Integration

### GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint check
        run: pnpm lint:check

      - name: Format check
        run: pnpm format:check

      - name: Build
        run: pnpm build
```

### Pre-commit Hooks (Optional)

Install `husky` and `lint-staged`:

```bash
pnpm add -D husky lint-staged
```

Add to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## 🐛 Troubleshooting

### Common Issues

#### ESLint: "Cannot find module '@scilent-one/tooling'"

**Solution**: Make sure the tooling package is installed and the workspace is properly configured.

```bash
# Install the package
pnpm add -D @scilent-one/tooling

# Verify workspace setup
pnpm list @scilent-one/tooling
```

#### TypeScript: "Cannot find module" for path mappings

**Solution**: Ensure your `tsconfig.json` paths match your folder structure.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"] // Make sure ./src exists
    }
  }
}
```

#### Prettier: Not formatting files

**Solution**: Check your `.prettierignore` file and editor settings.

```bash
# Test prettier directly
npx prettier --check .

# Format a specific file
npx prettier --write src/app/page.tsx
```

#### ESLint: Rules conflicts with Prettier

**Solution**: Make sure you're extending the correct config that includes prettier integration.

```javascript
// ✅ Correct - prettier is included in the configs
import nextConfig from '@scilent-one/tooling/eslint/next';

// ❌ Wrong - would need to add prettier manually
import baseConfig from '@scilent-one/tooling/eslint/base';
```

### Getting More Help

1. **Check the main README**: `/packages/tooling/README.md`
2. **Look at example configurations**: Check other apps in the monorepo
3. **Open an issue**: Create an issue in the monorepo repository
4. **Check official docs**: ESLint, TypeScript, and Prettier documentation

## 🔄 Migration from Other Configs

### From `@scilent-one/eslint-config`

The old package has been superseded by `@scilent-one/tooling`. Here's how to migrate:

1. **Remove old dependency**:

   ```bash
   pnpm remove @scilent-one/eslint-config
   ```

2. **Install new dependency**:

   ```bash
   pnpm add -D @scilent-one/tooling
   ```

3. **Update ESLint config**:

   ```javascript
   // Old
   module.exports = {
     extends: ['@scilent-one/eslint-config/next.js'],
   };

   // New
   import nextConfig from '@scilent-one/tooling/eslint/next';
   export default nextConfig;
   ```

### From Custom Configs

If you have custom ESLint, TypeScript, or Prettier configs:

1. **Review current rules**: Document any custom rules you want to keep
2. **Adopt the tooling package**: Follow the setup guide for your project type
3. **Add custom rules**: Extend the base configurations with your specific needs
4. **Test thoroughly**: Run linting, formatting, and type checking on your codebase

## 📊 Performance Tips

### ESLint Performance

- **Use `.eslintignore`** or the `ignores` field to exclude unnecessary files
- **Enable caching** with `--cache` flag in CI
- **Parallel processing** in monorepos with tools like `turbo`

### TypeScript Performance

- **Use project references** for large monorepos
- **Enable incremental compilation** with `"incremental": true`
- **Use `skipLibCheck`** to speed up builds (already enabled in base config)

### Prettier Performance

- **Use `.prettierignore`** to skip large files and build outputs
- **Cache results** in CI with actions cache
- **Format on save** in your editor instead of running on entire codebase
