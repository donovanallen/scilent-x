import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from '../separator';

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Blog</div>
      <Separator orientation="vertical" />
      <div>Docs</div>
      <Separator orientation="vertical" />
      <div>Source</div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">Item 1</span>
        <span className="text-muted-foreground">$10.00</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="font-medium">Item 2</span>
        <span className="text-muted-foreground">$15.00</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="font-medium">Item 3</span>
        <span className="text-muted-foreground">$20.00</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span className="font-semibold">$45.00</span>
      </div>
    </div>
  ),
};
