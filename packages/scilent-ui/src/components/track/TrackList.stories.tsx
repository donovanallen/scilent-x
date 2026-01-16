import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrackList, TrackListSkeleton } from "./TrackList";
import { mockTracks, mockDoubleAlbum } from "../../__stories__/mock-data";

const meta: Meta<typeof TrackList> = {
  title: "Track/TrackList",
  component: TrackList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    showPositions: {
      control: "boolean",
      description: "Show track position numbers",
    },
    groupByDisc: {
      control: "boolean",
      description: "Group tracks by disc number",
    },
  },
  args: {
    tracks: mockTracks,
    showPositions: true,
    groupByDisc: false,
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
type Story = StoryObj<typeof TrackList>;

export const Default: Story = {};

export const WithPlayingTrack: Story = {
  args: {
    playingTrackId: mockTracks[1]?.isrc,
  },
};

export const MultiDisc: Story = {
  args: {
    tracks: mockDoubleAlbum.media.flatMap((m) => m.tracks),
    groupByDisc: true,
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
      <TrackListSkeleton count={5} />
    </div>
  ),
};

export const SkeletonLong: Story = {
  render: () => (
    <div className="w-[600px]">
      <TrackListSkeleton count={12} />
    </div>
  ),
};
