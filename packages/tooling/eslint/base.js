/**
 * Base ESLint configuration for TypeScript projects
 * Flat config format for ESLint 9+
 */

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    name: 'base/javascript',
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // Basic rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    name: 'base/typescript',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',

      // Disable conflicting rules
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
    },
  },
  {
    name: 'base/ignores',
    ignores: [
      // Build outputs
      'dist/',
      'build/',
      '.next/',
      'out/',
      'coverage/',

      // Dependencies
      'node_modules/',

      // Misc
      '*.min.js',
      '*.min.css',
      '.turbo/',
      '.cache/',
    ],
  },
];
