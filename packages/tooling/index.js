/**
 * @scilent-one/tooling - Comprehensive tooling configurations
 *
 * This package provides shared ESLint, TypeScript, and Prettier configurations
 * for consistent development across the monorepo.
 *
 * @see https://github.com/your-org/monorepo/tree/main/packages/tooling
 */

// Re-export all configurations for convenience
module.exports = {
  // ESLint configurations
  eslint: {
    base: require('./eslint/base'),
    react: require('./eslint/react'),
    next: require('./eslint/next'),
  },

  // Prettier configuration
  prettier: require('./prettier'),

  // Utility function to get TypeScript config path
  typescript: {
    getConfigPath: (type) => {
      const configs = {
        base: require.resolve('./typescript/base.json'),
        react: require.resolve('./typescript/react.json'),
        nextjs: require.resolve('./typescript/nextjs.json'),
      };
      return configs[type] || configs.base;
    },
  },
};

// Also export individual configurations for tree-shaking
module.exports.eslintBase = require('./eslint/base');
module.exports.eslintReact = require('./eslint/react');
module.exports.eslintNext = require('./eslint/next');
module.exports.prettier = require('./prettier');
