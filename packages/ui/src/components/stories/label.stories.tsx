import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../label';
import { Input } from '../input';
import { Textarea } from '../textarea';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Label text',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => <Label htmlFor="input">Email address</Label>,
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">
        Name <span className="text-destructive">*</span>
      </Label>
      <Input type="text" id="name" placeholder="Enter your name" required />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="disabled" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Disabled field
      </Label>
      <Input type="text" id="disabled" placeholder="Can't edit this" disabled className="peer" />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="username">Username</Label>
      <Input type="text" id="username" placeholder="johndoe" />
      <p className="text-sm text-muted-foreground">
        This will be your public display name.
      </p>
    </div>
  ),
};
