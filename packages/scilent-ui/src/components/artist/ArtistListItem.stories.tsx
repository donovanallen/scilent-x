import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArtistListItem, ArtistListItemSkeleton } from './ArtistListItem';
import { HarmonyInteractionProvider } from '../../interactions';
import { mockArtist, mockSoloArtist } from '../../__stories__/mock-data';

const meta: Meta<typeof ArtistListItem> = {
  title: 'Artist/ArtistListItem',
  component: ArtistListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    showProviders: {
      control: 'boolean',
      description: 'Show provider badges',
    },
    abbreviatedProviders: {
      control: 'boolean',
      description: 'Use abbreviated platform badges (initials)',
    },
    showExternalLink: {
      control: 'boolean',
      description: 'Show external link icon on hover',
    },
    maxGenres: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of genres to display',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable context menu and hover preview',
    },
    previewSide: {
      control: 'radio',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Side to position the hover preview',
    },
    previewAlign: {
      control: 'radio',
      options: ['start', 'center', 'end'],
      description: 'Alignment for the hover preview',
    },
  },
  args: {
    artist: mockArtist,
    showProviders: false,
    abbreviatedProviders: true,
    showExternalLink: true,
    maxGenres: 3,
    interactive: false,
    previewSide: 'right',
    previewAlign: 'start',
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
type Story = StoryObj<typeof ArtistListItem>;

export const Default: Story = {};

export const WithProviders: Story = {
  args: {
    showProviders: true,
  },
};

export const WithFullProviderNames: Story = {
  name: 'With Full Provider Names',
  args: {
    showProviders: true,
    abbreviatedProviders: false,
  },
};

export const SoloArtist: Story = {
  args: {
    artist: mockSoloArtist,
    showProviders: true,
  },
};

export const NoExternalLink: Story = {
  name: 'Without External Link',
  args: {
    showExternalLink: false,
    showProviders: true,
  },
};

export const MoreGenres: Story = {
  name: 'With More Genres Visible',
  args: {
    maxGenres: 5,
    showProviders: true,
  },
};

export const Interactive: Story = {
  args: {
    showProviders: true,
    onClick: (artist) => {
      alert(`Clicked: ${artist.name}`);
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
          onOpenExternal: (_url, platform) => alert(`Open in ${platform}`),
          onCopyLink: () => alert('Link copied!'),
          previewContent: { artist: 'full' },
        }}
      >
        <div className="p-4">
          <Story />
        </div>
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="w-[600px]">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click for context menu, hover for preview
      </p>
      <ArtistListItem
        artist={mockArtist}
        showProviders
        interactive
        previewSide="bottom"
        previewAlign="start"
      />
    </div>
  ),
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[600px] space-y-4">
      <p className="text-sm text-muted-foreground">Default Skeleton:</p>
      <ArtistListItemSkeleton />
      <p className="text-sm text-muted-foreground mt-4">With Providers:</p>
      <ArtistListItemSkeleton showProviders />
      <p className="text-sm text-muted-foreground mt-4">Without Genres:</p>
      <ArtistListItemSkeleton showGenres={false} />
    </div>
  ),
};

export const List: Story = {
  decorators: [
    () => (
      <div className="w-[600px] divide-y">
        <ArtistListItem artist={mockArtist} showProviders />
        <ArtistListItem artist={mockSoloArtist} showProviders />
        <ArtistListItem
          artist={{
            ...mockArtist,
            name: 'Atoms for Peace',
            type: 'group',
            disambiguation: 'Thom Yorke supergroup',
            genres: ['Electronic', 'Experimental', 'Trip hop'],
          }}
          showProviders
        />
        <ArtistListItemSkeleton showProviders />
        <ArtistListItemSkeleton showProviders />
      </div>
    ),
  ],
};

export const AlternatingBackground: Story = {
  name: 'Alternating Background (Search Results Style)',
  decorators: [
    () => (
      <div className="w-[600px]">
        {[mockArtist, mockSoloArtist, mockArtist, mockSoloArtist].map(
          (artist, index) => (
            <div
              key={`${artist.name}-${index}`}
              className={index % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
            >
              <ArtistListItem artist={artist} showProviders />
            </div>
          )
        )}
      </div>
    ),
  ],
};
