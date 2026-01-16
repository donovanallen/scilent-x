import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@scilent-one/ui';
import {
  PlatformProfileCard,
  PlatformProfileCardSkeleton,
  type PlatformProfile,
  type FollowedArtistsData,
} from './PlatformProfileCard';

const sampleProfile: PlatformProfile = {
  displayName: 'John Doe',
  username: 'johndoe',
  profileImage: {
    url: 'https://i.pravatar.cc/150?u=johndoe',
  },
  country: 'United States',
  subscription: {
    type: 'HiFi Plus',
  },
};

const sampleFollowedArtists: FollowedArtistsData = {
  artists: [
    { id: '1', name: 'Radiohead' },
    { id: '2', name: 'Aphex Twin' },
    { id: '3', name: 'Boards of Canada' },
    { id: '4', name: 'Portishead' },
    { id: '5', name: 'Massive Attack' },
  ],
  total: 127,
  hasMore: true,
};

const meta: Meta<typeof PlatformProfileCard> = {
  title: 'Common/PlatformProfileCard',
  component: PlatformProfileCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    platform: {
      control: 'select',
      options: ['tidal', 'spotify', 'apple_music', 'deezer', 'soundcloud'],
      description: 'The platform/provider name',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading skeleton when true',
    },
    isReconnecting: {
      control: 'boolean',
      description: 'Shows reconnecting state in error view',
    },
    showFollowedArtists: {
      control: 'boolean',
      description: 'Whether to show the followed artists section',
    },
    maxArtistBadges: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of artist badges to show',
    },
    hideWhenNotConnected: {
      control: 'boolean',
      description: 'Hide card when error code is NOT_CONNECTED',
    },
  },
  args: {
    platform: 'tidal',
    // onReconnect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof PlatformProfileCard>;

export const Default: Story = {
  args: {
    profile: sampleProfile,
  },
};

export const WithFollowedArtists: Story = {
  args: {
    profile: sampleProfile,
    followedArtists: sampleFollowedArtists,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    error: {
      message: 'Unable to load profile',
      code: 'PROVIDER_ERROR',
    },
  },
};

export const TokenExpired: Story = {
  args: {
    error: {
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    },
  },
};

export const Reconnecting: Story = {
  args: {
    error: {
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    },
    isReconnecting: true,
  },
};

export const WithoutSubscription: Story = {
  args: {
    profile: {
      ...sampleProfile,
      subscription: null,
    },
  },
};

export const WithoutProfileImage: Story = {
  args: {
    profile: {
      ...sampleProfile,
      profileImage: null,
    },
  },
};

export const MinimalProfile: Story = {
  args: {
    profile: {
      username: 'musicfan',
    },
  },
};

export const Spotify: Story = {
  args: {
    platform: 'spotify',
    profile: {
      ...sampleProfile,
      subscription: { type: 'Premium' },
    },
    followedArtists: sampleFollowedArtists,
  },
};

export const AppleMusic: Story = {
  args: {
    platform: 'apple_music',
    profile: {
      ...sampleProfile,
      subscription: { type: 'Individual' },
    },
  },
};

export const CustomPlatform: Story = {
  args: {
    platform: 'soundcloud',
    profile: {
      displayName: 'DJ Producer',
      username: 'djproducer',
      profileImage: {
        url: 'https://i.pravatar.cc/150?u=djproducer',
      },
    },
  },
};

export const CustomFooter: Story = {
  args: {
    profile: sampleProfile,
    footer: (
      <div className="flex gap-2 w-full">
        <Button variant="outline" size="sm" className="flex-1">
          Disconnect
        </Button>
        <Button variant="default" size="sm" className="flex-1">
          Sync Library
        </Button>
      </div>
    ),
  },
};

export const CustomLabels: Story = {
  args: {
    profile: sampleProfile,
    externalLinkLabel: 'Open in Tidal App',
    error: null,
  },
};

export const HiddenFollowedArtists: Story = {
  args: {
    profile: sampleProfile,
    followedArtists: sampleFollowedArtists,
    showFollowedArtists: false,
  },
};

export const ManyArtists: Story = {
  args: {
    profile: sampleProfile,
    followedArtists: {
      artists: [
        { id: '1', name: 'Radiohead' },
        { id: '2', name: 'Aphex Twin' },
        { id: '3', name: 'Boards of Canada' },
        { id: '4', name: 'Portishead' },
        { id: '5', name: 'Massive Attack' },
        { id: '6', name: 'Bjork' },
        { id: '7', name: 'Thom Yorke' },
      ],
      total: 250,
      hasMore: true,
    },
    maxArtistBadges: 3,
  },
};

// Skeleton stories
export const Skeleton: Story = {
  render: () => <PlatformProfileCardSkeleton />,
};

export const SkeletonWithPlatform: Story = {
  render: () => <PlatformProfileCardSkeleton platform="tidal" />,
};

// Comparison stories
export const AllPlatforms: Story = {
  decorators: [
    (Story) => (
      <div className="grid gap-4 max-w-2xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <PlatformProfileCard
        platform="tidal"
        profile={{
          ...sampleProfile,
          subscription: { type: 'HiFi Plus' },
        }}
      />
      <PlatformProfileCard
        platform="spotify"
        profile={{
          ...sampleProfile,
          subscription: { type: 'Premium' },
        }}
      />
      <PlatformProfileCard
        platform="apple_music"
        profile={{
          ...sampleProfile,
          subscription: { type: 'Individual' },
        }}
      />
    </>
  ),
};

export const AllStates: Story = {
  decorators: [
    (Story) => (
      <div className="grid gap-4 max-w-2xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Loading</p>
        <PlatformProfileCard platform="tidal" isLoading />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Error</p>
        <PlatformProfileCard
          platform="tidal"
          error={{ message: 'Failed to load', code: 'PROVIDER_ERROR' }}
          onReconnect={() => {}}
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Connected</p>
        <PlatformProfileCard
          platform="tidal"
          profile={sampleProfile}
          followedArtists={sampleFollowedArtists}
        />
      </div>
    </>
  ),
};
