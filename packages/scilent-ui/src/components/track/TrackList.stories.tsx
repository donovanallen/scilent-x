import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackList, TrackListSkeleton } from './TrackList';
import { mockTracks, mockDoubleAlbum } from '../../__stories__/mock-data';

const meta: Meta<typeof TrackList> = {
  title: 'Track/TrackList',
  component: TrackList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'grid'],
      description: 'Layout variant - list or grid',
    },
    showPositions: {
      control: 'boolean',
      description: 'Show track position numbers',
    },
    showArtwork: {
      control: 'boolean',
      description: 'Show track artwork',
    },
    groupByDisc: {
      control: 'boolean',
      description: 'Group tracks by disc number',
    },
    filterQuery: {
      control: 'text',
      description: 'Text filter for tracks',
    },
    emptyLabel: {
      control: 'text',
      description: 'Label shown when list is empty',
    },
    emptyDescription: {
      control: 'text',
      description: 'Description shown in empty state',
    },
  },
  args: {
    tracks: mockTracks,
    variant: 'default',
    showPositions: false,
    showArtwork: true,
    groupByDisc: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TrackList>;

export const Default: Story = {};

export const GridVariant: Story = {
  name: 'Grid Variant',
  args: {
    variant: 'grid',
  },
};

export const WithPositions: Story = {
  name: 'With Position Numbers',
  args: {
    showPositions: true,
  },
};

export const WithPlayingTrack: Story = {
  args: {
    playingTrackId: mockTracks[1]?.isrc,
  },
};

export const MultiDisc: Story = {
  args: {
    tracks: mockDoubleAlbum.media.flatMap((m) => m.tracks),
    groupByDisc: true,
    showPositions: true,
  },
};

export const NoArtwork: Story = {
  args: {
    showArtwork: false,
    showPositions: true,
  },
};

export const WithFiltering: Story = {
  name: 'With Text Filter',
  args: {
    filterQuery: 'love',
  },
};

export const EmptyState: Story = {
  name: 'Empty State',
  args: {
    tracks: [],
    emptyLabel: 'No tracks in queue',
    emptyDescription: 'Add some tracks to get started',
  },
};

export const WithRemoval: Story = {
  name: 'With Remove Action',
  args: {
    onTrackRemove: (id) => {
      console.log('Remove track:', id);
    },
  },
};

export const Interactive: Story = {
  args: {
    onTrackSelect: (index, track) => {
      console.log('Selected:', index, track?.title);
    },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[800px]">
      <TrackListSkeleton count={5} showArtwork />
    </div>
  ),
};

export const SkeletonGrid: Story = {
  name: 'Skeleton (Grid)',
  render: () => (
    <div className="w-[800px]">
      <TrackListSkeleton count={10} variant="grid" />
    </div>
  ),
};
