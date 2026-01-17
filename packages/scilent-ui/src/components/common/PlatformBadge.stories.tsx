import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlatformBadge, PlatformBadgeList } from './PlatformBadge';

const meta: Meta<typeof PlatformBadge> = {
  title: 'Common/PlatformBadge',
  component: PlatformBadge,
  tags: ['autodocs'],
  argTypes: {
    platform: {
      control: 'select',
      options: [
        'spotify',
        'apple_music',
        'musicbrainz',
        'discogs',
        'deezer',
        'tidal',
        'amazon_music',
        'youtube_music',
        'soundcloud',
        'bandcamp',
      ],
      description: 'The platform/provider name',
    },
    display: {
      control: 'select',
      options: ['text', 'icon', 'full'],
      description: 'Display mode: text only, icon only, or icon + text',
    },
    colored: {
      control: 'boolean',
      description: 'Show colored background',
    },
    iconSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Icon size (only applies to icon/full modes)',
    },
    iconColor: {
      control: 'select',
      options: ['brand', 'black', 'white', 'current'],
      description: 'Icon color override',
    },
  },
  args: {
    platform: 'spotify',
    display: 'text',
    colored: false,
  },
};

export default meta;
type Story = StoryObj<typeof PlatformBadge>;

export const Default: Story = {};

export const Colored: Story = {
  args: {
    colored: true,
  },
};

export const IconOnly: Story = {
  args: {
    display: 'icon',
  },
};

export const IconOnlyColored: Story = {
  args: {
    display: 'icon',
    colored: true,
  },
};

export const Full: Story = {
  args: {
    display: 'full',
  },
};

export const FullColored: Story = {
  args: {
    display: 'full',
    colored: true,
  },
};

export const AllPlatformsText: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" />
      <PlatformBadge platform="apple_music" />
      <PlatformBadge platform="musicbrainz" />
      <PlatformBadge platform="discogs" />
      <PlatformBadge platform="deezer" />
      <PlatformBadge platform="tidal" />
      <PlatformBadge platform="amazon_music" />
      <PlatformBadge platform="youtube_music" />
      <PlatformBadge platform="soundcloud" />
      <PlatformBadge platform="bandcamp" />
    </div>
  ),
};

export const AllPlatformsColored: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" colored />
      <PlatformBadge platform="apple_music" colored />
      <PlatformBadge platform="musicbrainz" colored />
      <PlatformBadge platform="discogs" colored />
      <PlatformBadge platform="deezer" colored />
      <PlatformBadge platform="tidal" colored />
      <PlatformBadge platform="amazon_music" colored />
      <PlatformBadge platform="youtube_music" colored />
      <PlatformBadge platform="soundcloud" colored />
      <PlatformBadge platform="bandcamp" colored />
    </div>
  ),
};

export const AllPlatformsIconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" display="icon" />
      <PlatformBadge platform="apple_music" display="icon" />
      <PlatformBadge platform="musicbrainz" display="icon" />
      <PlatformBadge platform="discogs" display="icon" />
      <PlatformBadge platform="deezer" display="icon" />
      <PlatformBadge platform="tidal" display="icon" />
      <PlatformBadge platform="amazon_music" display="icon" />
      <PlatformBadge platform="youtube_music" display="icon" />
      <PlatformBadge platform="soundcloud" display="icon" />
      <PlatformBadge platform="bandcamp" display="icon" />
    </div>
  ),
};

export const AllPlatformsIconOnlyColored: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" display="icon" colored />
      <PlatformBadge platform="apple_music" display="icon" colored />
      <PlatformBadge platform="musicbrainz" display="icon" colored />
      <PlatformBadge platform="discogs" display="icon" colored />
      <PlatformBadge platform="deezer" display="icon" colored />
      <PlatformBadge platform="tidal" display="icon" colored />
      <PlatformBadge platform="amazon_music" display="icon" colored />
      <PlatformBadge platform="youtube_music" display="icon" colored />
      <PlatformBadge platform="soundcloud" display="icon" colored />
      <PlatformBadge platform="bandcamp" display="icon" colored />
    </div>
  ),
};

export const AllPlatformsFull: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" display="full" />
      <PlatformBadge platform="apple_music" display="full" />
      <PlatformBadge platform="musicbrainz" display="full" />
      <PlatformBadge platform="discogs" display="full" />
      <PlatformBadge platform="deezer" display="full" />
      <PlatformBadge platform="tidal" display="full" />
      <PlatformBadge platform="amazon_music" display="full" />
      <PlatformBadge platform="youtube_music" display="full" />
      <PlatformBadge platform="soundcloud" display="full" />
      <PlatformBadge platform="bandcamp" display="full" />
    </div>
  ),
};

export const AllPlatformsFullColored: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" display="full" colored />
      <PlatformBadge platform="apple_music" display="full" colored />
      <PlatformBadge platform="musicbrainz" display="full" colored />
      <PlatformBadge platform="discogs" display="full" colored />
      <PlatformBadge platform="deezer" display="full" colored />
      <PlatformBadge platform="tidal" display="full" colored />
      <PlatformBadge platform="amazon_music" display="full" colored />
      <PlatformBadge platform="youtube_music" display="full" colored />
      <PlatformBadge platform="soundcloud" display="full" colored />
      <PlatformBadge platform="bandcamp" display="full" colored />
    </div>
  ),
};

export const BadgeList: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={['spotify', 'apple_music', 'musicbrainz', 'discogs']}
    />
  ),
};

export const BadgeListColored: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={['spotify', 'apple_music', 'musicbrainz', 'discogs']}
      colored
    />
  ),
};

export const BadgeListIconOnly: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={['spotify', 'apple_music', 'tidal', 'discogs']}
      display="icon"
    />
  ),
};

export const BadgeListFull: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={['spotify', 'apple_music', 'tidal', 'discogs']}
      display="full"
      colored
    />
  ),
};

export const BadgeListWithMax: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={[
        'spotify',
        'apple_music',
        'musicbrainz',
        'discogs',
        'deezer',
        'tidal',
      ]}
      maxVisible={3}
    />
  ),
};

export const CustomPlatform: Story = {
  args: {
    platform: 'Custom Source',
  },
};
