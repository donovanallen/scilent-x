import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserAvatar } from '../../social/user-avatar';

const meta: Meta<typeof UserAvatar> = {
  title: 'Social/UserAvatar',
  component: UserAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    username: 'johndoe',
  },
};

export const WithImage: Story = {
  args: {
    name: 'Jane Smith',
    username: 'janesmith',
    avatarUrl: 'https://github.com/shadcn.png',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <UserAvatar name="Small" username="sm" size="sm" />
      <UserAvatar name="Medium" username="md" size="md" />
      <UserAvatar name="Large" username="lg" size="lg" />
      <UserAvatar name="Extra Large" username="xl" size="xl" />
    </div>
  ),
};

export const WithUsername: Story = {
  args: {
    username: 'developer',
  },
};

export const Anonymous: Story = {
  args: {},
};

export const NameInitials: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <UserAvatar name="John Doe" />
        <p className="text-xs text-muted-foreground mt-1">John Doe</p>
      </div>
      <div className="text-center">
        <UserAvatar name="Alice" />
        <p className="text-xs text-muted-foreground mt-1">Alice</p>
      </div>
      <div className="text-center">
        <UserAvatar name="Bob Smith Jr" />
        <p className="text-xs text-muted-foreground mt-1">Bob Smith Jr</p>
      </div>
      <div className="text-center">
        <UserAvatar username="dev_user" />
        <p className="text-xs text-muted-foreground mt-1">@dev_user</p>
      </div>
    </div>
  ),
};

export const ProfileRow: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4 rounded-lg border">
      <UserAvatar
        name="Sarah Connor"
        username="sconnor"
        avatarUrl="https://github.com/shadcn.png"
        size="lg"
      />
      <div>
        <p className="font-medium">Sarah Connor</p>
        <p className="text-sm text-muted-foreground">@sconnor</p>
      </div>
    </div>
  ),
};
