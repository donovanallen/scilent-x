import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlbumArtwork, AlbumArtworkSkeleton } from './AlbumArtwork';
import {
  PLACEHOLDER_ALBUM_ART,
  PLACEHOLDER_ALBUM_ART_SM,
} from '../../__stories__/mock-data';

const meta: Meta<typeof AlbumArtwork> = {
  title: 'Album/AlbumArtwork',
  component: AlbumArtwork,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Size of the artwork',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Border radius style',
    },
    shadow: {
      control: 'boolean',
      description: 'Add shadow to the artwork',
    },
    hoverEffect: {
      control: 'boolean',
      description: 'Enable hover scale effect',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
  },
  args: {
    alt: 'Album artwork',
    size: 'lg',
    rounded: 'md',
    shadow: false,
    hoverEffect: false,
    isLoading: false,
  },
};

export default meta;
type Story = StoryObj<typeof AlbumArtwork>;

export const Default: Story = {
  args: {
    src: PLACEHOLDER_ALBUM_ART,
  },
};

export const NoImage: Story = {
  name: 'No Image (Placeholder)',
  args: {
    src: undefined,
  },
};

export const BrokenImage: Story = {
  name: 'Broken Image (Error State)',
  args: {
    src: 'https://invalid-url-that-will-fail.jpg',
  },
};

export const Loading: Story = {
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    isLoading: true,
  },
};

export const WithShadow: Story = {
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    shadow: true,
  },
};

export const WithHoverEffect: Story = {
  name: 'With Hover Effect',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    hoverEffect: true,
  },
  decorators: [
    (Story) => (
      <div className="group">
        <Story />
      </div>
    ),
  ],
};

export const SizeSmall: Story = {
  name: 'Size: Small (48x48)',
  args: {
    src: PLACEHOLDER_ALBUM_ART_SM,
    size: 'sm',
  },
};

export const SizeMedium: Story = {
  name: 'Size: Medium (64x64)',
  args: {
    src: PLACEHOLDER_ALBUM_ART_SM,
    size: 'md',
  },
};

export const SizeLarge: Story = {
  name: 'Size: Large (128x128)',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    size: 'lg',
  },
};

export const SizeXL: Story = {
  name: 'Size: XL (192x192)',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    size: 'xl',
  },
};

export const Size2XL: Story = {
  name: 'Size: 2XL (256x256)',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    size: '2xl',
  },
};

export const SizeFull: Story = {
  name: 'Size: Full Width',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    size: 'full',
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export const RoundedNone: Story = {
  name: 'Rounded: None',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'none',
  },
};

export const RoundedSmall: Story = {
  name: 'Rounded: Small',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'sm',
  },
};

export const RoundedMedium: Story = {
  name: 'Rounded: Medium',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'md',
  },
};

export const RoundedLarge: Story = {
  name: 'Rounded: Large',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'lg',
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <div className="text-center">
        <AlbumArtworkSkeleton size="sm" />
        <p className="text-xs text-muted-foreground mt-1">sm</p>
      </div>
      <div className="text-center">
        <AlbumArtworkSkeleton size="md" />
        <p className="text-xs text-muted-foreground mt-1">md</p>
      </div>
      <div className="text-center">
        <AlbumArtworkSkeleton size="lg" />
        <p className="text-xs text-muted-foreground mt-1">lg</p>
      </div>
      <div className="text-center">
        <AlbumArtworkSkeleton size="xl" />
        <p className="text-xs text-muted-foreground mt-1">xl</p>
      </div>
      <div className="text-center">
        <AlbumArtworkSkeleton size="2xl" />
        <p className="text-xs text-muted-foreground mt-1">2xl</p>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'All Sizes Comparison',
  render: () => (
    <div className="flex gap-4 items-end">
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART_SM} size="sm" />
        <p className="text-xs text-muted-foreground mt-1">sm (48px)</p>
      </div>
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART_SM} size="md" />
        <p className="text-xs text-muted-foreground mt-1">md (64px)</p>
      </div>
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART} size="lg" />
        <p className="text-xs text-muted-foreground mt-1">lg (128px)</p>
      </div>
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART} size="xl" />
        <p className="text-xs text-muted-foreground mt-1">xl (192px)</p>
      </div>
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART} size="2xl" />
        <p className="text-xs text-muted-foreground mt-1">2xl (256px)</p>
      </div>
    </div>
  ),
};

export const AllRounded: Story = {
  name: 'All Rounded Variants',
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART} rounded="none" />
        <p className="text-xs text-muted-foreground mt-1">none</p>
      </div>
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART} rounded="sm" />
        <p className="text-xs text-muted-foreground mt-1">sm</p>
      </div>
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART} rounded="md" />
        <p className="text-xs text-muted-foreground mt-1">md</p>
      </div>
      <div className="text-center">
        <AlbumArtwork src={PLACEHOLDER_ALBUM_ART} rounded="lg" />
        <p className="text-xs text-muted-foreground mt-1">lg</p>
      </div>
    </div>
  ),
};
