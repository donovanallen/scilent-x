import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, getViolations } from 'axe-playwright';

/**
 * Test-runner configuration with accessibility checks.
 *
 * @see https://storybook.js.org/docs/writing-tests/test-runner
 * @see https://github.com/abhinaba-ghosh/axe-playwright
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    // Inject axe-core into the page before each test
    await injectAxe(page);
  },

  async postVisit(page, context) {
    // Get violations with detailed information
    const violations = await getViolations(page, '#storybook-root', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
      },
    });

    // Report violations with detailed info
    if (violations.length > 0) {
      console.log(`\n[A11y] Story: ${context.title} / ${context.name}`);
      violations.forEach((violation) => {
        console.log(`\n  Rule: ${violation.id} (${violation.impact})`);
        console.log(`  Description: ${violation.description}`);
        console.log(`  Help: ${violation.helpUrl}`);
        violation.nodes.forEach((node) => {
          console.log(`    Element: ${node.html.substring(0, 200)}`);
          console.log(`    Issue: ${node.failureSummary}`);
        });
      });

      throw new Error(`${violations.length} accessibility violation(s) detected`);
    }
  },
};

export default config;
