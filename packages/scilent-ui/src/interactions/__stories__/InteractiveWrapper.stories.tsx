import type { Meta, StoryObj } from '@storybook/react-vite';
import { HarmonyInteractionProvider } from '../provider';
import { InteractiveWrapper } from '../InteractiveWrapper';
import { TrackCard } from '../../components/track/TrackCard';
import { AlbumCard } from '../../components/album/AlbumCard';
import { ArtistCard } from '../../components/artist/ArtistCard';
import {
  mockTrack,
  mockRelease,
  mockArtist,
  PLACEHOLDER_ALBUM_ART_SM,
  PLACEHOLDER_ARTIST_IMAGE,
} from '../../__stories__/mock-data';

const meta: Meta<typeof InteractiveWrapper> = {
  title: 'Interactions/InteractiveWrapper',
  component: InteractiveWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Wrapper component that adds interactive behaviors (context menus, hover previews) to entity components.',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { platform = 'web' } = context.args as {
        platform?: 'web' | 'mobile';
      };
      return (
        <HarmonyInteractionProvider
          config={{
            platform,
            enableContextMenu: true,
            enableHoverPreview: true,
            hoverDelay: 200,
            onNavigate: (type, entity) => {
              console.log(`Navigate to ${type}:`, entity);
              alert(`Navigate to ${type} details`);
            },
            onOpenExternal: (url, platform) => {
              console.log(`Open ${platform}:`, url);
              alert(`Open in ${platform}: ${url}`);
            },
            onCopyLink: (entity, type) => {
              console.log(`Copy ${type} link:`, entity);
              alert(`Link copied!`);
            },
            previewContent: {
              track: 'mini',
              album: 'full',
              artist: 'mini',
            },
          }}
        >
          <div className="p-4">
            <Story />
          </div>
        </HarmonyInteractionProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof InteractiveWrapper>;

export const WithTrackCard: Story = {
  name: 'Track Card (Right-click for menu, Hover for preview)',
  render: () => (
    <div className="max-w-md">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click the track card to see the context menu. Hover to see the
        preview.
      </p>
      <InteractiveWrapper entityType="track" entity={mockTrack}>
        <TrackCard
          track={mockTrack}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          previewSide="bottom"
          previewAlign="start"
        />
      </InteractiveWrapper>
    </div>
  ),
};

export const WithAlbumCard: Story = {
  name: 'Album Card (Right-click for menu, Hover for preview)',
  render: () => (
    <div className="max-w-xs">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click the album card to see the context menu. Hover to see the
        preview.
      </p>
      <InteractiveWrapper entityType="album" entity={mockRelease}>
        <AlbumCard
          release={mockRelease}
          previewSide="bottom"
          previewAlign="start"
        />
      </InteractiveWrapper>
    </div>
  ),
};

export const WithArtistCard: Story = {
  name: 'Artist Card (Right-click for menu, Hover for preview)',
  render: () => (
    <div className="max-w-xs">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click the artist card to see the context menu. Hover to see the
        preview.
      </p>
      <InteractiveWrapper entityType="artist" entity={mockArtist}>
        <ArtistCard
          artist={mockArtist}
          imageUrl={PLACEHOLDER_ARTIST_IMAGE}
          previewSide="bottom"
          previewAlign="start"
        />
      </InteractiveWrapper>
    </div>
  ),
};

export const MultipleCards: Story = {
  name: 'Multiple Interactive Cards',
  render: () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        All cards below are interactive. Right-click for context menus, hover
        for previews.
      </p>

      <div>
        <h3 className="text-sm font-medium mb-2">Track</h3>
        <div className="max-w-md">
          <InteractiveWrapper entityType="track" entity={mockTrack}>
            <TrackCard
              track={mockTrack}
              artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
              previewSide="bottom"
              previewAlign="start"
            />
          </InteractiveWrapper>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <h3 className="text-sm font-medium mb-2">Album</h3>
          <InteractiveWrapper entityType="album" entity={mockRelease}>
            <AlbumCard
              release={mockRelease}
              previewSide="bottom"
              previewAlign="start"
            />
          </InteractiveWrapper>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Artist</h3>
          <InteractiveWrapper entityType="artist" entity={mockArtist}>
            <ArtistCard
              artist={mockArtist}
              imageUrl={PLACEHOLDER_ARTIST_IMAGE}
              previewSide="bottom"
              previewAlign="start"
            />
          </InteractiveWrapper>
        </div>
      </div>
    </div>
  ),
};

export const ContextMenuOnly: Story = {
  name: 'Context Menu Only (No Hover Preview)',
  decorators: [
    (Story) => (
      <HarmonyInteractionProvider
        config={{
          platform: 'web',
          enableContextMenu: true,
          enableHoverPreview: false,
          onNavigate: (type) => alert(`Navigate to ${type}`),
        }}
      >
        <Story />
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="max-w-md">
      <p className="text-sm text-muted-foreground mb-4">
        Only context menu is enabled. Right-click to see the menu.
      </p>
      <InteractiveWrapper entityType="track" entity={mockTrack}>
        <TrackCard
          track={mockTrack}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          previewSide="bottom"
          previewAlign="start"
        />
      </InteractiveWrapper>
    </div>
  ),
};

export const HoverPreviewOnly: Story = {
  name: 'Hover Preview Only (No Context Menu)',
  decorators: [
    (Story) => (
      <HarmonyInteractionProvider
        config={{
          platform: 'web',
          enableContextMenu: false,
          enableHoverPreview: true,
          hoverDelay: 200,
        }}
      >
        <Story />
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="max-w-md">
      <p className="text-sm text-muted-foreground mb-4">
        Only hover preview is enabled. Hover to see the preview.
      </p>
      <InteractiveWrapper entityType="track" entity={mockTrack}>
        <TrackCard
          track={mockTrack}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          previewSide="bottom"
          previewAlign="start"
        />
      </InteractiveWrapper>
    </div>
  ),
};

export const Disabled: Story = {
  name: 'Interactions Disabled',
  render: () => (
    <div className="max-w-md">
      <p className="text-sm text-muted-foreground mb-4">
        Interactions are disabled on this wrapper. Right-click and hover do
        nothing extra.
      </p>
      <InteractiveWrapper entityType="track" entity={mockTrack} disabled>
        <TrackCard
          track={mockTrack}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          previewSide="bottom"
          previewAlign="start"
        />
      </InteractiveWrapper>
    </div>
  ),
};

export const WithoutProvider: Story = {
  name: 'Without Provider (Graceful Fallback)',
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="max-w-md">
      <p className="text-sm text-muted-foreground mb-4">
        No provider is present. The component renders normally without
        interactions.
      </p>
      <InteractiveWrapper entityType="track" entity={mockTrack}>
        <TrackCard
          track={mockTrack}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          previewSide="bottom"
          previewAlign="start"
        />
      </InteractiveWrapper>
    </div>
  ),
};
