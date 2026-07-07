import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArtistHeader, ArtistHeaderSkeleton } from "./ArtistHeader";
import { mockArtist, mockSoloArtist, PLACEHOLDER_ARTIST_IMAGE } from "../../__stories__/mock-data";

const meta: Meta<typeof ArtistHeader> = {
  title: "Artist/ArtistHeader",
  component: ArtistHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    showMetadata: {
      control: "boolean",
      description: "Show country and dates",
    },
    showGenres: {
      control: "boolean",
      description: "Show genre badges",
    },
    showConfidence: {
      control: "boolean",
      description: "Show confidence score",
    },
  },
  args: {
    artist: mockArtist,
    showMetadata: true,
    showGenres: true,
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
type Story = StoryObj<typeof ArtistHeader>;

export const Default: Story = {};

export const WithImage: Story = {
  args: {
    imageUrl: PLACEHOLDER_ARTIST_IMAGE,
  },
};

export const SoloArtist: Story = {
  args: {
    artist: mockSoloArtist,
    imageUrl: PLACEHOLDER_ARTIST_IMAGE,
  },
};

export const WithConfidence: Story = {
  args: {
    showConfidence: true,
    imageUrl: PLACEHOLDER_ARTIST_IMAGE,
  },
};

export const Minimal: Story = {
  args: {
    showMetadata: false,
    showGenres: false,
    artist: {
      ...mockArtist,
      aliases: undefined,
    },
  },
};

export const WithAliases: Story = {
  args: {
    artist: {
      ...mockArtist,
      aliases: ["On a Friday", "Radiohead UK"],
    },
    imageUrl: PLACEHOLDER_ARTIST_IMAGE,
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[800px]">
      <ArtistHeaderSkeleton />
    </div>
  ),
};
