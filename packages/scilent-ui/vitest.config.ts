import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      include: ['src/utils/**/*.ts', 'src/icons/types.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.stories.tsx',
        'src/index.ts',
        'src/**/index.ts',
        'src/types/**',
        'src/interactions/types.ts',
        'src/__stories__/**',
        'src/svg.d.ts',
      ],
    },
  },
});
