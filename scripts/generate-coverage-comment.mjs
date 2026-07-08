#!/usr/bin/env node
/**
 * Builds a per-package coverage summary as a Markdown table, suitable for
 * posting as a sticky PR comment (see .github/workflows/test.yml).
 *
 * Packages are rolled out one at a time: an entry with a `summaryPath` is
 * read from its Vitest `coverage-summary.json` and rendered with real
 * numbers, while every other configured package renders as "TBA" until it
 * gets the same treatment. Update the `PACKAGES` list below as more packages
 * are wired up.
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

/** @typedef {{ name: string, summaryPath?: string }} PackageConfig */

/** @type {PackageConfig[]} */
const PACKAGES = [
  {
    name: '@scilent-one/social',
    summaryPath: 'packages/social/coverage/coverage-summary.json',
  },
  { name: '@scilent-one/scilent-ui' },
  { name: '@scilent-one/ui' },
  { name: '@scilent-one/db' },
  { name: '@scilent-one/harmony-engine' },
];

const METRICS = /** @type {const} */ ([
  'lines',
  'statements',
  'functions',
  'branches',
]);

function formatMetric(metric) {
  if (!metric) return 'N/A';
  const pct =
    typeof metric.pct === 'number' ? metric.pct.toFixed(2) : metric.pct;
  return `${pct}% (${metric.covered}/${metric.total})`;
}

function readSummary(summaryPath) {
  const absolutePath = resolve(REPO_ROOT, summaryPath);
  if (!existsSync(absolutePath)) {
    return null;
  }

  try {
    const raw = readFileSync(absolutePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.total ?? null;
  } catch (error) {
    console.error(`Failed to read/parse ${summaryPath}:`, error);
    return null;
  }
}

function buildRow(pkg) {
  if (!pkg.summaryPath) {
    return [`\`${pkg.name}\``, ...METRICS.map(() => 'TBA')];
  }

  const total = readSummary(pkg.summaryPath);
  if (!total) {
    return [`\`${pkg.name}\``, ...METRICS.map(() => '_no report_')];
  }

  return [
    `\`${pkg.name}\``,
    ...METRICS.map((metric) => formatMetric(total[metric])),
  ];
}

function buildComment() {
  const header = ['Package', 'Lines', 'Statements', 'Functions', 'Branches'];
  const separator = header.map(() => '---');
  const rows = PACKAGES.map(buildRow);

  const table = [header, separator, ...rows]
    .map((row) => `| ${row.join(' | ')} |`)
    .join('\n');

  return `## Per-package test coverage

${table}

<sub>Coverage is rolled out incrementally, one package at a time — packages marked \`TBA\` don't report coverage in this comment yet. Generated from \`vitest --coverage\` output by \`.github/workflows/test.yml\`.</sub>
`;
}

function main() {
  const comment = buildComment();
  const outputPath =
    process.argv[2] ?? resolve(REPO_ROOT, 'coverage-comment.md');
  writeFileSync(outputPath, comment, 'utf-8');
  console.log(comment);
  console.log(`\nWrote coverage comment to ${outputPath}`);
}

main();
