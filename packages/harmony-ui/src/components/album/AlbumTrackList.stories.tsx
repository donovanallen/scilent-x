import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlbumTrackList, AlbumTrackListSkeleton } from "./AlbumTrackList";
import { mockRelease, mockDoubleAlbum } from "../../__stories__/mock-data";

const meta: Meta<typeof AlbumTrackList> = {
  title: "Album/AlbumTrackList",
  component: AlbumTrackList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    showPositions: {
      control: "boolean",
      description: "Show track position numbers",
    },
  },
  args: {
    release: mockRelease,
    showPositions: true,
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
type Story = StoryObj<typeof AlbumTrackList>;

export const Default: Story = {};

export const WithPlayingTrack: Story = {
  args: {
    playingTrackId: mockRelease.media[0]?.tracks[1]?.isrc,
  },
};

export const MultiDisc: Story = {
  args: {
    release: mockDoubleAlbum,
  },
};

export const NoPositions: Story = {
  args: {
    showPositions: false,
  },
};

export const Interactive: Story = {
  args: {
    onTrackPlay: (track) => {
      console.log("Playing:", track.title);
    },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[600px]">
      <AlbumTrackListSkeleton trackCount={10} />
    </div>
  ),
};
