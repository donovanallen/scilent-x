import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComposerHint } from '../../social/composer-hint';

const meta: Meta<typeof ComposerHint> = {
  title: 'Social/ComposerHint',
  component: ComposerHint,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ComposerHint>;

/**
 * Frames the hint the way a composer would: a relatively-positioned input-like
 * box with the hint inset on the left, mirroring how `TiptapEditor` renders it.
 */
const Frame = ({ children }: { children: ReactNode }) => (
  <div className="relative h-16 w-[420px] rounded-md border bg-background">
    {children}
  </div>
);

export const SingleHint: Story = {
  args: {
    hints: 'Type @ to mention a user',
  },
  render: (args) => (
    <Frame>
      <ComposerHint
        {...args}
        className="absolute left-3 top-1/2 -translate-y-1/2 max-w-[calc(100%-1.5rem)]"
      />
    </Frame>
  ),
};

export const CyclingHints: Story = {
  args: {
    hints: ['Type @ to mention a user', 'Type # to mention an Artist'],
    intervalMs: 2000,
  },
  render: (args) => (
    <Frame>
      <ComposerHint
        {...args}
        className="absolute left-3 top-1/2 -translate-y-1/2 max-w-[calc(100%-1.5rem)]"
      />
    </Frame>
  ),
};

export const Hidden: Story = {
  args: {
    hints: ['Type @ to mention a user', 'Type # to mention an Artist'],
    visible: false,
  },
  render: (args) => (
    <Frame>
      <ComposerHint
        {...args}
        className="absolute left-3 top-1/2 -translate-y-1/2 max-w-[calc(100%-1.5rem)]"
      />
    </Frame>
  ),
};
