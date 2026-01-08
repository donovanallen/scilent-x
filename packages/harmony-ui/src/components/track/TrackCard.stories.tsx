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
    showPosition: {
      control: 'boolean',
      description: 'Show track position number',
    },
    showDiscNumber: {
      control: 'boolean',
      description: 'Show disc number in position',
    },
    isPlaying: {
      control: 'boolean',
      description: 'Highlight as currently playing',
    },
  },
  args: {
    track: mockTrack,
    showPosition: true,
    showDiscNumber: false,
    isPlaying: false,
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

export const Skeleton: Story = {
  render: () => (
    <div className="w-[500px]">
      <TrackCardSkeleton />
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
