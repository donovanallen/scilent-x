import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlbumCard, AlbumCardSkeleton } from './AlbumCard';
import {
  mockRelease,
  mockSingle,
  mockEP,
  PLACEHOLDER_ALBUM_ART,
} from '../../__stories__/mock-data';

const meta: Meta<typeof AlbumCard> = {
  title: 'Album/AlbumCard',
  component: AlbumCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    showYear: {
      control: 'boolean',
      description: 'Show release year',
    },
    showType: {
      control: 'boolean',
      description: 'Show release type badge',
    },
  },
  args: {
    release: mockRelease,
    showYear: true,
    showType: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlbumCard>;

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

export const NoTypeBadge: Story = {
  args: {
    showType: false,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const NoYear: Story = {
  args: {
    showYear: false,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const Interactive: Story = {
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART,
    onClick: (release) => {
      alert(`Clicked: ${release.title}`);
    },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[200px]">
      <AlbumCardSkeleton />
    </div>
  ),
};

export const Grid: Story = {
  decorators: [
    () => (
      <div className="grid grid-cols-4 gap-4 w-[900px]">
        <AlbumCard
          release={mockRelease}
          previewSide="bottom"
          previewAlign="start"
        />
        <AlbumCard
          release={mockSingle}
          previewSide="bottom"
          previewAlign="start"
        />
        <AlbumCard release={mockEP} previewSide="bottom" previewAlign="start" />
        <AlbumCard
          release={{
            ...mockRelease,
            title: 'OK Computer',
            releaseType: 'album',
          }}
          previewSide="bottom"
          previewAlign="start"
        />
        <AlbumCardSkeleton />
        <AlbumCardSkeleton />
        <AlbumCardSkeleton />
        <AlbumCardSkeleton />
      </div>
    ),
  ],
};
