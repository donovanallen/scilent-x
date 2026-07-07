import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackCard, TrackCardSkeleton } from './TrackCard';
import { HarmonyInteractionProvider } from '../../interactions';
import {
  mockTrack,
  mockTrackExplicit,
  PLACEHOLDER_ALBUM_ART_SM,
} from '../../__stories__/mock-data';

const meta: Meta<typeof TrackCard> = {
  title: 'Track/TrackCard',
  component: TrackCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['card', 'list', 'compact'],
      description: 'Visual variant - card, list row, or compact row',
    },
    showPosition: {
      control: 'boolean',
      description: 'Show track position number',
    },
    index: {
      control: 'number',
      description: 'Optional display index (1-based)',
    },
    showDiscNumber: {
      control: 'boolean',
      description: 'Show disc number in position',
    },
    showArtwork: {
      control: 'boolean',
      description: 'Show track artwork',
    },
    showIsrc: {
      control: 'boolean',
      description: 'Show ISRC code',
    },
    inlineIsrc: {
      control: 'boolean',
      description: 'Show ISRC inline with artists',
    },
    showSources: {
      control: 'boolean',
      description: 'Show source/provider badges',
    },
    fullProviderNames: {
      control: 'boolean',
      description: 'Show full provider names instead of initials',
    },
    maxSources: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Maximum number of sources to display',
    },
    showDurationIcon: {
      control: 'boolean',
      description: 'Show clock icon before duration',
    },
    showExternalLink: {
      control: 'boolean',
      description: 'Show full hover overlay with external link',
    },
    subtleExternalLink: {
      control: 'boolean',
      description: 'Show subtle external link icon on hover',
    },
    showRemove: {
      control: 'boolean',
      description: 'Show remove button on hover',
    },
    showDragHandle: {
      control: 'boolean',
      description: 'Show drag handle for sortable lists',
    },
    isPlaying: {
      control: 'boolean',
      description: 'Highlight as currently playing',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable context menu and hover preview',
    },
  },
  args: {
    track: mockTrack,
    variant: 'card',
    showPosition: false,
    showDiscNumber: false,
    showArtwork: true,
    showIsrc: false,
    inlineIsrc: false,
    showSources: false,
    fullProviderNames: false,
    showDurationIcon: false,
    showExternalLink: false,
    subtleExternalLink: false,
    showRemove: false,
    showDragHandle: false,
    isPlaying: false,
    interactive: false,
  },
};

export default meta;
type Story = StoryObj<typeof TrackCard>;

export const Default: Story = {};

export const WithArtwork: Story = {
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const Explicit: Story = {
  args: {
    track: mockTrackExplicit,
  },
};

export const Playing: Story = {
  args: {
    isPlaying: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const WithDiscNumber: Story = {
  args: {
    track: { ...mockTrack, discNumber: 2, position: 3 },
    showDiscNumber: true,
  },
};

export const NoPosition: Story = {
  args: {
    showPosition: false,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

// New stories for added options

export const ListVariant: Story = {
  name: 'List Variant',
  args: {
    variant: 'list',
    showArtwork: true,
  },
};

export const ListVariantFull: Story = {
  name: 'List Variant (Full Featured)',
  args: {
    variant: 'list',
    showArtwork: true,
    showDurationIcon: true,
    showSources: true,
    fullProviderNames: true,
    showIsrc: true,
    inlineIsrc: true,
    subtleExternalLink: true,
  },
};

export const CompactVariant: Story = {
  name: 'Compact Variant',
  args: {
    variant: 'compact',
    showArtwork: true,
  },
};

export const WithDragHandle: Story = {
  name: 'With Drag Handle',
  args: {
    variant: 'list',
    showArtwork: true,
    showDragHandle: true,
  },
};

export const WithRemoveButton: Story = {
  name: 'With Remove Button',
  args: {
    variant: 'list',
    showArtwork: true,
    showRemove: true,
    onRemove: (id) => {
      alert(`Remove track: ${id}`);
    },
  },
};

export const WithIndex: Story = {
  name: 'With Display Index',
  args: {
    variant: 'list',
    showArtwork: true,
    index: 1,
  },
};

export const WithSources: Story = {
  name: 'With Source Badges',
  args: {
    showSources: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const WithSourcesFull: Story = {
  name: 'With Full Provider Names',
  args: {
    showSources: true,
    fullProviderNames: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const WithIsrc: Story = {
  name: 'With ISRC Below',
  args: {
    showIsrc: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const WithIsrcInline: Story = {
  name: 'With ISRC Inline',
  args: {
    showIsrc: true,
    inlineIsrc: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const WithDurationIcon: Story = {
  name: 'With Duration Icon',
  args: {
    showDurationIcon: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const WithExternalLinkOverlay: Story = {
  name: 'With External Link Overlay',
  args: {
    showExternalLink: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const WithSubtleExternalLink: Story = {
  name: 'With Subtle External Link',
  args: {
    subtleExternalLink: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const FullFeaturedCard: Story = {
  name: 'Full Featured (Card)',
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
    track: mockTrackExplicit,
    showPosition: true,
    showIsrc: true,
    showSources: true,
    showExternalLink: true,
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <p className="text-sm text-muted-foreground">Card Skeleton:</p>
      <TrackCardSkeleton />
      <p className="text-sm text-muted-foreground mt-4">Card Skeleton with Sources & ISRC:</p>
      <TrackCardSkeleton showSources showIsrc />
      <p className="text-sm text-muted-foreground mt-4">List Skeleton:</p>
      <TrackCardSkeleton variant="list" showArtwork={false} />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART_SM,
    onPlay: (track) => {
      alert(`Playing: ${track.title}`);
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
          previewContent: { track: 'full' },
        }}
      >
        <div className="p-4">
          <Story />
        </div>
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="w-[500px]">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click for context menu, hover for preview
      </p>
      <TrackCard
        track={mockTrackExplicit}
        artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
        interactive
        previewSide="bottom"
        previewAlign="start"
      />
    </div>
  ),
};

export const VariantComparison: Story = {
  name: 'Variant Comparison',
  render: () => (
    <div className="w-[600px] space-y-6">
      <div>
        <p className="text-sm font-medium mb-2">Card Variant (default):</p>
        <TrackCard
          track={mockTrackExplicit}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          showSources
          showIsrc
        />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">List Variant:</p>
        <TrackCard
          track={mockTrackExplicit}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          variant="list"
          showArtwork
          showSources
          fullProviderNames
          showIsrc
          inlineIsrc
          showDurationIcon
          subtleExternalLink
        />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Compact Variant:</p>
        <TrackCard
          track={mockTrackExplicit}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          variant="compact"
          showArtwork
        />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">List with Drag Handle & Remove:</p>
        <TrackCard
          track={mockTrackExplicit}
          artworkUrl={PLACEHOLDER_ALBUM_ART_SM}
          variant="list"
          showArtwork
          showDragHandle
          showRemove
        />
      </div>
    </div>
  ),
};
