import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '../textarea';
import { Label } from '../label';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here.',
    'aria-label': 'Message',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself" />
      <p className="text-sm text-muted-foreground">
        Your bio will be visible to other users.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'This textarea is disabled',
    'aria-label': 'Disabled textarea',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue:
      'This is a textarea with a default value. You can edit this text.',
    'aria-label': 'Editable message',
  },
};

export const CustomSize: Story = {
  render: () => (
    <div className="grid w-full gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="small">Small</Label>
        <Textarea
          id="small"
          className="min-h-[60px]"
          placeholder="Small textarea"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="large">Large</Label>
        <Textarea
          id="large"
          className="min-h-[200px]"
          placeholder="Large textarea"
        />
      </div>
    </div>
  ),
};

export const WithCharacterCount: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="tweet">Tweet</Label>
      <Textarea
        id="tweet"
        placeholder="What's happening?"
        maxLength={280}
        className="resize-none"
      />
      <p className="text-sm text-muted-foreground text-right">0/280</p>
    </div>
  ),
};
