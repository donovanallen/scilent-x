import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlbumDetails, AlbumDetailsSkeleton } from "./AlbumDetails";
import { mockRelease, mockSingle, PLACEHOLDER_ALBUM_ART } from "../../__stories__/mock-data";

const meta: Meta<typeof AlbumDetails> = {
  title: "Album/AlbumDetails",
  component: AlbumDetails,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    showLabels: {
      control: "boolean",
      description: "Show label information",
    },
    showGenres: {
      control: "boolean",
      description: "Show genre badges",
    },
    showSources: {
      control: "boolean",
      description: "Show source providers",
    },
    showConfidence: {
      control: "boolean",
      description: "Show confidence score",
    },
  },
  args: {
    release: mockRelease,
    showLabels: true,
    showGenres: true,
    showSources: false,
    showConfidence: false,
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
type Story = StoryObj<typeof AlbumDetails>;

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

export const WithSources: Story = {
  args: {
    showSources: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const WithConfidence: Story = {
  args: {
    showConfidence: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const FullDetails: Story = {
  args: {
    showLabels: true,
    showGenres: true,
    showSources: true,
    showConfidence: true,
    artworkUrl: PLACEHOLDER_ALBUM_ART,
  },
};

export const Minimal: Story = {
  args: {
    showLabels: false,
    showGenres: false,
    release: {
      ...mockRelease,
      gtin: undefined,
    },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[800px]">
      <AlbumDetailsSkeleton />
    </div>
  ),
};
