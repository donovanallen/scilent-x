import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { FollowButton } from '../../social/follow-button';

const meta: Meta<typeof FollowButton> = {
  title: 'Social/FollowButton',
  component: FollowButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onFollow: fn(),
    onUnfollow: fn(),
  },
  argTypes: {
    isFollowing: {
      control: 'boolean',
      description: 'Whether the user is currently following',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Show only the icon without text',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Button size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FollowButton>;

export const NotFollowing: Story = {
  args: {
    isFollowing: false,
    isLoading: false,
    iconOnly: false,
  },
};

export const Following: Story = {
  args: {
    isFollowing: true,
    isLoading: false,
    iconOnly: false,
  },
};

export const Loading: Story = {
  args: {
    isFollowing: false,
    isLoading: true,
    iconOnly: false,
  },
};

export const LoadingWhileFollowing: Story = {
  args: {
    isFollowing: true,
    isLoading: true,
    iconOnly: false,
  },
};

export const IconOnly: Story = {
  args: {
    isFollowing: false,
    isLoading: false,
    iconOnly: true,
  },
};

export const IconOnlyFollowing: Story = {
  args: {
    isFollowing: true,
    isLoading: false,
    iconOnly: true,
  },
};

export const IconOnlyLoading: Story = {
  args: {
    isFollowing: false,
    isLoading: true,
    iconOnly: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <FollowButton
        isFollowing={false}
        onFollow={fn()}
        onUnfollow={fn()}
        size="sm"
      />
      <FollowButton
        isFollowing={false}
        onFollow={fn()}
        onUnfollow={fn()}
        size="default"
      />
      <FollowButton
        isFollowing={false}
        onFollow={fn()}
        onUnfollow={fn()}
        size="lg"
      />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm">Not Following:</span>
        <FollowButton isFollowing={false} onFollow={fn()} onUnfollow={fn()} />
        <FollowButton
          isFollowing={false}
          iconOnly
          onFollow={fn()}
          onUnfollow={fn()}
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm">Following:</span>
        <FollowButton isFollowing={true} onFollow={fn()} onUnfollow={fn()} />
        <FollowButton
          isFollowing={true}
          iconOnly
          onFollow={fn()}
          onUnfollow={fn()}
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm">Loading:</span>
        <FollowButton
          isFollowing={false}
          isLoading
          onFollow={fn()}
          onUnfollow={fn()}
        />
        <FollowButton
          isFollowing={false}
          isLoading
          iconOnly
          onFollow={fn()}
          onUnfollow={fn()}
        />
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 rounded-lg border w-[350px]">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <span className="text-lg font-medium">JD</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">John Doe</p>
        <p className="text-sm text-muted-foreground truncate">@johndoe</p>
      </div>
      <FollowButton isFollowing={false} onFollow={fn()} onUnfollow={fn()} />
    </div>
  ),
};
