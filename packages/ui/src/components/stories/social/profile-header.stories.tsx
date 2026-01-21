import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileHeader } from '../../social/profile-header';

const meta: Meta<typeof ProfileHeader> = {
  title: 'Social/ProfileHeader',
  component: ProfileHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isFollowing: {
      control: 'boolean',
      description: 'Whether the current user is following this profile',
    },
    isCurrentUser: {
      control: 'boolean',
      description: "Whether this is the current user's profile",
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the follow action is loading',
    },
  },
  args: {
    id: 'user-1',
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Music lover and vinyl collector. Always looking for new sounds.',
    avatarUrl: null,
    image: null,
    followersCount: 1234,
    followingCount: 567,
    postsCount: 89,
    isFollowing: false,
    isCurrentUser: false,
    isLoading: false,
    connectedPlatforms: [],
    onFollow: async () => {},
    onUnfollow: async () => {},
    onEditProfile: () => {},
    onFollowersClick: () => {},
    onFollowingClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ProfileHeader>;

export const Default: Story = {};

export const Following: Story = {
  args: {
    isFollowing: true,
  },
};

export const CurrentUser: Story = {
  args: {
    isCurrentUser: true,
  },
};

export const LongBio: Story = {
  args: {
    bio: `Music enthusiast with a passion for discovering new artists across all genres.

I love exploring the intersection of technology and music, from vinyl to streaming.

Currently building my collection of rare jazz records from the 1960s.

Let's connect and share our favorite finds!`,
  },
};

// Mobile viewport stories
export const MobileDefault: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobileM',
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-2">
        <Story />
      </div>
    ),
  ],
};

export const MobileCurrentUser: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobileM',
    },
    layout: 'fullscreen',
  },
  args: {
    isCurrentUser: true,
  },
  decorators: [
    (Story) => (
      <div className="p-2">
        <Story />
      </div>
    ),
  ],
};

export const MobileSmall: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobileS',
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-2">
        <Story />
      </div>
    ),
  ],
};

export const TabletDefault: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
};
