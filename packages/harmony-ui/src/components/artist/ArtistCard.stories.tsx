import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArtistCard, ArtistCardSkeleton } from './ArtistCard';
import {
  mockArtist,
  mockSoloArtist,
  PLACEHOLDER_ARTIST_IMAGE,
} from '../../__stories__/mock-data';

const meta: Meta<typeof ArtistCard> = {
  title: 'Artist/ArtistCard',
  component: ArtistCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    showGenres: {
      control: 'boolean',
      description: 'Show genre badges',
    },
  },
  args: {
    artist: mockArtist,
    showGenres: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[220px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArtistCard>;

export const Default: Story = {};

export const WithImage: Story = {
  args: {
    imageUrl: PLACEHOLDER_ARTIST_IMAGE,
  },
};

export const SoloArtist: Story = {
  args: {
    artist: mockSoloArtist,
  },
};

export const NoGenres: Story = {
  args: {
    showGenres: false,
    imageUrl: PLACEHOLDER_ARTIST_IMAGE,
  },
};

export const Interactive: Story = {
  args: {
    imageUrl: PLACEHOLDER_ARTIST_IMAGE,
    onClick: (artist) => {
      alert(`Clicked: ${artist.name}`);
    },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[220px]">
      <ArtistCardSkeleton />
    </div>
  ),
};

export const Grid: Story = {
  decorators: [
    () => (
      <div className="grid grid-cols-3 gap-4 w-[720px]">
        <ArtistCard
          artist={mockArtist}
          previewSide="bottom"
          previewAlign="start"
        />
        <ArtistCard
          artist={mockSoloArtist}
          imageUrl={PLACEHOLDER_ARTIST_IMAGE}
          previewSide="bottom"
          previewAlign="start"
        />
        <ArtistCard
          artist={{
            ...mockArtist,
            name: 'Atoms for Peace',
            genres: ['Electronic', 'Experimental'],
          }}
          previewSide="bottom"
          previewAlign="start"
        />
        <ArtistCardSkeleton />
        <ArtistCardSkeleton />
        <ArtistCardSkeleton />
      </div>
    ),
  ],
};
