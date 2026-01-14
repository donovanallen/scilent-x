import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import type { UserConfig as ViteConfig } from 'vite';

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@chromatic-com/storybook'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite') as '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config: ViteConfig) => {
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss());
    config.plugins.push(
      svgr({
        svgrOptions: {
          // Keep viewBox for proper scaling
          svgoConfig: {
            plugins: [
              { name: 'removeViewBox', active: false },
              { name: 'removeDimensions', active: true },
            ],
          },
        },
        include: '**/*.svg', // Apply to all SVG imports
      })
    );
    return config;
  },
};

export default config;
