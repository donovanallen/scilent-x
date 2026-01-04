import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlatformBadge, PlatformBadgeList } from "./PlatformBadge";

const meta: Meta<typeof PlatformBadge> = {
  title: "Common/PlatformBadge",
  component: PlatformBadge,
  tags: ["autodocs"],
  argTypes: {
    platform: {
      control: "select",
      options: [
        "spotify",
        "apple_music",
        "musicbrainz",
        "discogs",
        "deezer",
        "tidal",
        "amazon_music",
        "youtube_music",
        "soundcloud",
        "bandcamp",
      ],
      description: "The platform/provider name",
    },
    abbreviated: {
      control: "boolean",
      description: "Show abbreviated name",
    },
    colored: {
      control: "boolean",
      description: "Show colored background",
    },
  },
  args: {
    platform: "spotify",
    abbreviated: false,
    colored: false,
  },
};

export default meta;
type Story = StoryObj<typeof PlatformBadge>;

export const Default: Story = {};

export const Colored: Story = {
  args: {
    colored: true,
  },
};

export const Abbreviated: Story = {
  args: {
    abbreviated: true,
  },
};

export const ColoredAbbreviated: Story = {
  args: {
    colored: true,
    abbreviated: true,
  },
};

export const AllPlatforms: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" />
      <PlatformBadge platform="apple_music" />
      <PlatformBadge platform="musicbrainz" />
      <PlatformBadge platform="discogs" />
      <PlatformBadge platform="deezer" />
      <PlatformBadge platform="tidal" />
      <PlatformBadge platform="amazon_music" />
      <PlatformBadge platform="youtube_music" />
      <PlatformBadge platform="soundcloud" />
      <PlatformBadge platform="bandcamp" />
    </div>
  ),
};

export const AllPlatformsColored: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="spotify" colored />
      <PlatformBadge platform="apple_music" colored />
      <PlatformBadge platform="musicbrainz" colored />
      <PlatformBadge platform="discogs" colored />
      <PlatformBadge platform="deezer" colored />
      <PlatformBadge platform="tidal" colored />
      <PlatformBadge platform="amazon_music" colored />
      <PlatformBadge platform="youtube_music" colored />
      <PlatformBadge platform="soundcloud" colored />
      <PlatformBadge platform="bandcamp" colored />
    </div>
  ),
};

export const BadgeList: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={["spotify", "apple_music", "musicbrainz", "discogs"]}
    />
  ),
};

export const BadgeListColored: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={["spotify", "apple_music", "musicbrainz", "discogs"]}
      colored
    />
  ),
};

export const BadgeListWithMax: Story = {
  render: () => (
    <PlatformBadgeList
      platforms={[
        "spotify",
        "apple_music",
        "musicbrainz",
        "discogs",
        "deezer",
        "tidal",
      ]}
      maxVisible={3}
    />
  ),
};

export const CustomPlatform: Story = {
  args: {
    platform: "Custom Source",
  },
};
