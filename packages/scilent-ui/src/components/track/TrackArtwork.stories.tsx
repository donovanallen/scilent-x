import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrackArtwork } from "./TrackArtwork";
import { PLACEHOLDER_ALBUM_ART_SM } from "../../__stories__/mock-data";

const meta: Meta<typeof TrackArtwork> = {
  title: "Track/TrackArtwork",
  component: TrackArtwork,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the artwork",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading skeleton",
    },
  },
  args: {
    alt: "Album artwork",
    size: "md",
    isLoading: false,
  },
};

export default meta;
type Story = StoryObj<typeof TrackArtwork>;

export const Default: Story = {
  args: {
    src: PLACEHOLDER_ALBUM_ART_SM,
  },
};

export const Placeholder: Story = {
  args: {
    src: undefined,
  },
};

export const Small: Story = {
  args: {
    src: PLACEHOLDER_ALBUM_ART_SM,
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    src: PLACEHOLDER_ALBUM_ART_SM,
    size: "lg",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="text-center">
        <TrackArtwork size="sm" />
        <p className="text-xs text-muted-foreground mt-2">Small</p>
      </div>
      <div className="text-center">
        <TrackArtwork size="md" />
        <p className="text-xs text-muted-foreground mt-2">Medium</p>
      </div>
      <div className="text-center">
        <TrackArtwork size="lg" />
        <p className="text-xs text-muted-foreground mt-2">Large</p>
      </div>
    </div>
  ),
};
