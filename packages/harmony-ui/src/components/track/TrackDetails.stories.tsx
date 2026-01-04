import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrackDetails, TrackDetailsSkeleton } from "./TrackDetails";
import { mockTrack, mockTrackExplicit, PLACEHOLDER_ALBUM_ART } from "../../__stories__/mock-data";

const meta: Meta<typeof TrackDetails> = {
  title: "Track/TrackDetails",
  component: TrackDetails,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    showSources: {
      control: "boolean",
      description: "Show source providers",
    },
    showCredits: {
      control: "boolean",
      description: "Show track credits",
    },
  },
  args: {
    track: mockTrack,
    showSources: false,
    showCredits: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[450px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TrackDetails>;

export const Default: Story = {};

export const WithArtwork: Story = {
  args: {
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const WithCredits: Story = {
  args: {
    track: mockTrackExplicit,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const WithSources: Story = {
  args: {
    showSources: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const FullDetails: Story = {
  args: {
    track: mockTrackExplicit,
    showSources: true,
    showCredits: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[450px]">
      <TrackDetailsSkeleton />
    </div>
  ),
};
