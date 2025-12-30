import type { Preview } from '@storybook/react-vite';
import type { DecoratorFunction } from 'storybook/internal/types';
import '../src/globals.css';

const withDarkMode: DecoratorFunction = (Story, context) => {
  // Apply dark class based on selected background
  const isDark = context.globals?.backgrounds?.value === 'hsl(240 10% 3.9%)';
  document.documentElement.classList.toggle('dark', isDark);
  return (
    <div>
      <Story />
    </div>
  );
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
  },
  decorators: [withDarkMode],
};

export default preview;
