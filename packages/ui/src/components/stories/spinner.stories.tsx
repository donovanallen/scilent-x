import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '../spinner';
import { Button } from '../button';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <Spinner className="size-4" />
        <p className="text-xs text-muted-foreground mt-2">size-4</p>
      </div>
      <div className="text-center">
        <Spinner className="size-6" />
        <p className="text-xs text-muted-foreground mt-2">size-6</p>
      </div>
      <div className="text-center">
        <Spinner className="size-8" />
        <p className="text-xs text-muted-foreground mt-2">size-8</p>
      </div>
      <div className="text-center">
        <Spinner className="size-10" />
        <p className="text-xs text-muted-foreground mt-2">size-10</p>
      </div>
      <div className="text-center">
        <Spinner className="size-12" />
        <p className="text-xs text-muted-foreground mt-2">size-12</p>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="text-foreground" aria-label="Loading default" />
      <Spinner className="text-primary" aria-label="Loading primary" />
      <Spinner className="text-muted-foreground" aria-label="Loading muted" />
      <Spinner className="text-destructive" aria-label="Loading destructive" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button disabled>
        <Spinner className="mr-2" />
        Loading...
      </Button>
      <Button variant="outline" disabled>
        <Spinner className="mr-2" />
        Please wait
      </Button>
      <Button variant="secondary" disabled>
        <Spinner className="mr-2" />
        Processing
      </Button>
    </div>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8 rounded-lg border">
      <Spinner className="size-8" />
      <p className="text-sm text-muted-foreground">Loading content...</p>
    </div>
  ),
};

export const InlineLoading: Story = {
  render: () => (
    <p className="text-sm">
      Your request is being processed <Spinner className="inline size-4 ml-1" />
    </p>
  ),
};

export const FullPageLoader: Story = {
  render: () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
      <Spinner className="size-12 text-primary" />
      <p className="mt-4 text-lg font-medium">Loading application...</p>
      <p className="text-sm text-muted-foreground">Please wait while we prepare everything</p>
    </div>
  ),
};
