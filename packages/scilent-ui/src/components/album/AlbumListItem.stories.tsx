import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlbumListItem, AlbumListItemSkeleton } from './AlbumListItem';
import { HarmonyInteractionProvider } from '../../interactions';
import {
  mockRelease,
  mockSingle,
  mockEP,
  PLACEHOLDER_ALBUM_ART,
} from '../../__stories__/mock-data';

const meta: Meta<typeof AlbumListItem> = {
  title: 'Album/AlbumListItem',
  component: AlbumListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    artworkSize: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the artwork',
    },
    showYear: {
      control: 'boolean',
      description: 'Show release year',
    },
    showYearIcon: {
      control: 'boolean',
      description: 'Show calendar icon before year',
    },
    showTrackCount: {
      control: 'boolean',
      description: 'Show track count',
    },
    showTrackCountIcon: {
      control: 'boolean',
      description: 'Show music icon before track count',
    },
    showDuration: {
      control: 'boolean',
      description: 'Show total duration',
    },
    showDurationIcon: {
      control: 'boolean',
      description: 'Show disc icon before duration',
    },
    showType: {
      control: 'boolean',
      description: 'Show release type badge',
    },
    typePlacement: {
      control: 'radio',
      options: ['title', 'metadata'],
      description: 'Placement of release type badge',
    },
    showProviders: {
      control: 'boolean',
      description: 'Show provider badges',
    },
    abbreviatedProviders: {
      control: 'boolean',
      description: 'Use abbreviated provider names',
    },
    coloredProviders: {
      control: 'boolean',
      description: 'Use colored provider badges',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable context menu and hover preview',
    },
  },
  args: {
    release: mockRelease,
    artworkSize: 'md',
    showYear: true,
    showYearIcon: true,
    showTrackCount: true,
    showTrackCountIcon: true,
    showDuration: false,
    showDurationIcon: true,
    showType: true,
    typePlacement: 'metadata',
    showProviders: false,
    abbreviatedProviders: true,
    coloredProviders: false,
    interactive: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlbumListItem>;

export const Default: Story = {};

export const WithArtwork: Story = {
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const Single: Story = {
  args: {
    release: mockSingle,
  },
};

export const EP: Story = {
  args: {
    release: mockEP,
  },
};

export const WithProviders: Story = {
  name: 'With Provider Badges',
  args: {
    showProviders: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const WithProvidersColored: Story = {
  name: 'With Colored Provider Badges',
  args: {
    showProviders: true,
    coloredProviders: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const WithProvidersFull: Story = {
  name: 'With Full Provider Names',
  args: {
    showProviders: true,
    abbreviatedProviders: false,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const WithDuration: Story = {
  name: 'With Duration',
  args: {
    showDuration: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const TypeInTitle: Story = {
  name: 'Type Badge in Title',
  args: {
    typePlacement: 'title',
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const NoIcons: Story = {
  name: 'Without Icons',
  args: {
    showYearIcon: false,
    showTrackCountIcon: false,
    showDurationIcon: false,
    showDuration: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const SmallArtwork: Story = {
  name: 'Small Artwork',
  args: {
    artworkSize: 'sm',
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const LargeArtwork: Story = {
  name: 'Large Artwork',
  args: {
    artworkSize: 'lg',
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const FullFeatured: Story = {
  name: 'Full Featured',
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART,
    showDuration: true,
    showProviders: true,
    typePlacement: 'title',
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[600px] space-y-4">
      <p className="text-sm text-muted-foreground">Default Skeleton:</p>
      <AlbumListItemSkeleton />
      <p className="text-sm text-muted-foreground mt-4">With Providers:</p>
      <AlbumListItemSkeleton showProviders />
      <p className="text-sm text-muted-foreground mt-4">Small Artwork:</p>
      <AlbumListItemSkeleton artworkSize="sm" />
      <p className="text-sm text-muted-foreground mt-4">Large Artwork:</p>
      <AlbumListItemSkeleton artworkSize="lg" />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART,
    onClick: (release) => {
      alert(`Clicked: ${release.title}`);
    },
  },
};

export const WithInteractiveFeatures: Story = {
  name: 'With Interactive Features (Right-click, Hover)',
  decorators: [
    (Story) => (
      <HarmonyInteractionProvider
        config={{
          platform: 'web',
          enableContextMenu: true,
          enableHoverPreview: true,
          hoverDelay: 200,
          onNavigate: (type, _entity) => alert(`Navigate to ${type} details`),
          onOpenExternal: (url, platform) => alert(`Open in ${platform}`),
          onCopyLink: () => alert('Link copied!'),
          previewContent: { album: 'full' },
        }}
      >
        <div className="p-4 w-[600px]">
          <Story />
        </div>
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click for context menu, hover for preview
      </p>
      <AlbumListItem
        release={mockRelease}
        artworkUrl={PLACEHOLDER_ALBUM_ART}
        showProviders
        showDuration
        interactive
        previewSide="bottom"
        previewAlign="start"
      />
      <AlbumListItem
        release={mockSingle}
        showProviders
        showDuration
        interactive
        previewSide="bottom"
        previewAlign="start"
      />
      <AlbumListItem
        release={mockEP}
        showProviders
        showDuration
        interactive
        previewSide="bottom"
        previewAlign="start"
      />
    </div>
  ),
};

export const List: Story = {
  name: 'List View',
  decorators: [
    () => (
      <div className="w-[700px] divide-y">
        <AlbumListItem
          release={mockRelease}
          showProviders
          showDuration
        />
        <AlbumListItem
          release={mockSingle}
          showProviders
          showDuration
        />
        <AlbumListItem
          release={mockEP}
          showProviders
          showDuration
        />
        <AlbumListItem
          release={{
            ...mockRelease,
            title: 'OK Computer',
            releaseType: 'album',
          }}
          showProviders
          showDuration
        />
        <AlbumListItemSkeleton showProviders />
        <AlbumListItemSkeleton showProviders />
      </div>
    ),
  ],
};
