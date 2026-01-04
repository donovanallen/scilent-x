import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArtistDiscography,
  ArtistDiscographySkeleton,
} from "./ArtistDiscography";
import { mockReleases } from "../../__stories__/mock-data";

const meta: Meta<typeof ArtistDiscography> = {
  title: "Artist/ArtistDiscography",
  component: ArtistDiscography,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    defaultTab: {
      control: "select",
      options: ["all", "album", "single", "ep"],
      description: "Default selected tab",
    },
  },
  args: {
    releases: mockReleases,
    defaultTab: "all",
  },
  decorators: [
    (Story) => (
      <div className="w-[900px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArtistDiscography>;

export const Default: Story = {};

export const AlbumsOnly: Story = {
  args: {
    releaseTypes: ["album"],
    defaultTab: "album",
  },
};

export const Interactive: Story = {
  args: {
    onReleaseClick: (release) => {
      alert(`Clicked: ${release.title} (${release.releaseType})`);
    },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[900px]">
      <ArtistDiscographySkeleton count={6} />
    </div>
  ),
};
