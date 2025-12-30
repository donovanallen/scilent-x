/**
 * Prettier configuration for consistent code formatting
 * This configuration ensures consistent code style across all projects
 */

/** @type {import("prettier").Config} */
const config = {
  // Core formatting options
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,

  // Object/Array formatting
  bracketSpacing: true,
  bracketSameLine: false,

  // Function formatting
  arrowParens: 'always',

  // Line endings
  endOfLine: 'lf',

  // JSX-specific options
  jsxSingleQuote: true,

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};

module.exports = config;
