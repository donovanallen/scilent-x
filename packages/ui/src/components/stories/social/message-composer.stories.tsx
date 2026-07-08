import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { MessageComposer } from '../../social/message-composer';

const meta: Meta<typeof MessageComposer> = {
  title: 'Social/MessageComposer',
  component: MessageComposer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof MessageComposer>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[420px] rounded-lg border">
      <MessageComposer {...args} />
    </div>
  ),
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
  render: (args) => (
    <div className="w-[420px] rounded-lg border">
      <MessageComposer {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    disabledMessage: 'You can only message users who follow you back.',
  },
  render: (args) => (
    <div className="w-[420px] rounded-lg border">
      <MessageComposer {...args} />
    </div>
  ),
};
