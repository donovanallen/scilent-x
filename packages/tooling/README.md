# @scilent-one/tooling

A comprehensive tooling package that provides shared ESLint, TypeScript, and Prettier configurations for consistent development across the monorepo. This package is designed to be a template for other projects, providing battle-tested configurations that promote code quality, consistency, and developer experience.

## 📦 What's Included

- **ESLint Configurations**: Multiple configurations for different project types
- **TypeScript Configurations**: Reusable tsconfig.json files with sensible defaults
- **Prettier Configuration**: Consistent code formatting rules
- **Complete Documentation**: Setup guides and usage examples

## 🚀 Quick Start

### Installation

In your app or package, install the tooling package:

```bash
pnpm add -D @scilent-one/tooling
```

### ESLint Setup

Choose the appropriate ESLint configuration for your project:

#### For Next.js Projects

Create `eslint.config.mjs`:

```javascript
import nextConfig from '@scilent-one/tooling/eslint/next';

export default nextConfig;
```

#### For React Projects

Create `eslint.config.mjs`:

```javascript
import reactConfig from '@scilent-one/tooling/eslint/react';

export default reactConfig;
```

#### For Base TypeScript Projects

Create `eslint.config.mjs`:

```javascript
import baseConfig from '@scilent-one/tooling/eslint/base';

export default baseConfig;
```

### TypeScript Setup

Create `tsconfig.json` and extend the appropriate base configuration:

#### For Next.js Projects

```json
{
  "extends": "@scilent-one/tooling/typescript/nextjs",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

#### For React Projects

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

#### For Base TypeScript Projects

```json
{
  "extends": "@scilent-one/tooling/typescript/base",
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist"
  }
}
```

### Prettier Setup

Create `.prettierrc.js`:

```javascript
const config = require('@scilent-one/tooling/prettier');

module.exports = config;
```

Create `.prettierignore`:

```javascript
const { ignorePatterns } = require('@scilent-one/tooling/prettier');

module.exports = ignorePatterns.join('\n');
```

Or simply create a `.prettierignore` file with:

```
node_modules/
.next/
dist/
build/
*.min.js
*.min.css
.turbo/
coverage/
```

## 📋 Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

## 🔧 Configuration Details

### ESLint Configurations

#### Base Configuration (`eslint/base.js`)

- **Target**: General TypeScript projects
- **Features**:
  - TypeScript support with `@typescript-eslint`
  - Import ordering and validation
  - Consistent code style rules
  - Proper ignore patterns

#### React Configuration (`eslint/react.js`)

- **Target**: React applications and libraries
- **Extends**: Base configuration
- **Additional Features**:
  - React-specific rules and best practices
  - React Hooks rules
  - JSX accessibility rules
  - React 17+ optimizations (no React import required)

#### Next.js Configuration (`eslint/next.js`)

- **Target**: Next.js applications
- **Extends**: React configuration
- **Additional Features**:
  - Next.js Core Web Vitals rules
  - Performance optimizations
  - Next.js specific patterns (App Router, Pages Router)
  - Built-in TypeScript support

### TypeScript Configurations

#### Base Configuration (`typescript/base.json`)

- **Strict Type Checking**: Enabled for maximum type safety
- **Modern JavaScript**: Targets ES2022 with full feature support
- **Module System**: ESNext modules with bundler resolution
- **Development Features**: Source maps, declaration files, incremental compilation

#### React Configuration (`typescript/react.json`)

- **Extends**: Base configuration
- **Additional Features**:
  - DOM type definitions
  - JSX support with React 17+ transform
  - Browser environment optimizations

#### Next.js Configuration (`typescript/nextjs.json`)

- **Extends**: React configuration
- **Additional Features**:
  - Next.js plugin integration
  - App Router type support
  - Path mapping for `@/*` imports
  - Incremental compilation optimizations

### Prettier Configuration

- **Consistent Formatting**: Standardized across all file types
- **Modern Defaults**: Single quotes, trailing commas, semicolons
- **File-Specific Rules**: Different settings for JSON, Markdown, YAML
- **Comprehensive Ignore Patterns**: Excludes build outputs, dependencies, cache files

## 🛠 Customization

### Extending Configurations

You can extend any configuration with additional rules:

```javascript
// eslint.config.mjs
import nextConfig from '@scilent-one/tooling/eslint/next';

export default [
  ...nextConfig,
  {
    rules: {
      // Your custom rules
      'no-console': 'error',
    },
  },
];
```

```json
// tsconfig.json
{
  "extends": "@scilent-one/tooling/typescript/nextjs",
  "compilerOptions": {
    // Your custom options
    "strict": false
  }
}
```

### Overriding Rules

For project-specific requirements, you can override any rule:

```javascript
// .prettierrc.js
const config = require('@scilent-one/tooling/prettier');

module.exports = {
  ...config,
  printWidth: 120, // Override default
  semi: false, // Override default
};
```

## 🔄 Migration Guide

### From Existing ESLint Config

If you're migrating from the old `@scilent-one/eslint-config`:

1. Remove the old dependency:

   ```bash
   pnpm remove @scilent-one/eslint-config
   ```

2. Install the new tooling package:

   ```bash
   pnpm add -D @scilent-one/tooling
   ```

3. Update your ESLint configuration file as shown in the setup guide above.

### Adding to New Projects

For new projects in the monorepo:

1. Add the tooling package as a dev dependency
2. Follow the appropriate setup guide for your project type
3. Add the recommended scripts to your `package.json`
4. Configure your editor to use ESLint and Prettier

## 📚 Best Practices

### Development Workflow

1. **Pre-commit Hooks**: Consider using `husky` and `lint-staged` for automated checks
2. **Editor Integration**: Install ESLint and Prettier extensions for your editor
3. **CI/CD Integration**: Run `lint:check`, `format:check`, and `type-check` in CI

### Code Organization

- Use the import ordering rules to maintain clean file structures
- Leverage TypeScript's strict mode for better code quality
- Follow the accessibility rules for better user experience

### Performance

- The configurations are optimized for development speed
- Incremental TypeScript compilation reduces build times
- ESLint caching is enabled by default

## 🐛 Troubleshooting

### Common Issues

#### ESLint Not Finding TypeScript Files

Make sure your `tsconfig.json` is in the project root and includes all TypeScript files.

#### Prettier Conflicts with ESLint

The configurations are designed to work together. Make sure you're using the correct ESLint config that includes Prettier integration.

#### TypeScript Path Mapping Issues

Ensure your `paths` configuration in `tsconfig.json` matches your project structure.

### Getting Help

1. Check the configuration files for inline comments explaining rules
2. Refer to the official documentation for [ESLint](https://eslint.org/), [TypeScript](https://www.typescriptlang.org/), and [Prettier](https://prettier.io/)
3. Open an issue in the monorepo for configuration-specific questions

## 🔮 Future Enhancements

- [ ] Stylelint configuration for CSS/SCSS
- [ ] Jest configuration for testing
- [ ] Commitlint configuration for conventional commits
- [ ] Bundle analyzer configuration
- [ ] Storybook configuration

## 📄 License

This package is part of the monorepo template and is licensed under MIT.
