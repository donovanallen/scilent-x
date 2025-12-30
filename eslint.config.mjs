// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Root ESLint configuration for the monorepo
 * Uses the shared base configuration from @scilent-one/tooling
 */

// Import the base configuration
const baseConfigs = require('@scilent-one/tooling/eslint/base');

const eslintConfig = [...baseConfigs, {
  name: 'monorepo/root-specific',
  files: ['**/*.{js,jsx,ts,tsx}'],
  rules: {
    // Monorepo-specific rules can be added here
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
