import type { Preview } from '@storybook/react-vite';
import type { DecoratorFunction } from 'storybook/internal/types';
import '@scilent-one/ui/globals.css';

const withDarkMode: DecoratorFunction = (Story, context) => {
  const isDark = context.globals?.backgrounds?.value === 'oklch(0.09 0 0)';
  document.documentElement.classList.toggle('dark', isDark);
  return (
    <div>
      <Story />
    </div>
  );
};

// Custom viewport definitions for mobile testing
const CUSTOM_VIEWPORTS = {
  mobileS: {
    name: 'Mobile S (320px)',
    styles: {
      width: '320px',
      height: '568px',
    },
  },
  mobileM: {
    name: 'Mobile M (375px)',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  mobileL: {
    name: 'Mobile L (425px)',
    styles: {
      width: '425px',
      height: '812px',
    },
  },
  tablet: {
    name: 'Tablet (768px)',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  laptop: {
    name: 'Laptop (1024px)',
    styles: {
      width: '1024px',
      height: '768px',
    },
  },
  desktop: {
    name: 'Desktop (1440px)',
    styles: {
      width: '1440px',
      height: '900px',
    },
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: 'hsl(0 0% 100%)' },
        { name: 'dark', value: 'hsl(240 10% 3.9%)' },
      ],
    },
    a11y: {
      test: 'warn',
    },
    viewport: {
      viewports: CUSTOM_VIEWPORTS,
      defaultViewport: 'responsive',
    },
  },
  decorators: [withDarkMode],
};

export default preview;
