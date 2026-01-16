import type { Meta, StoryObj } from '@storybook/react-vite';
import { Artwork } from './Artwork';
import {
  PLACEHOLDER_ALBUM_ART,
  PLACEHOLDER_ALBUM_ART_SM,
  PLACEHOLDER_ARTIST_IMAGE,
} from '../../__stories__/mock-data';

const meta: Meta<typeof Artwork> = {
  title: 'Common/Artwork',
  component: Artwork,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the artwork',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius style',
    },
  },
  args: {
    alt: 'Artwork',
    size: 'md',
    rounded: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Artwork>;

export const Default: Story = {
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    alt: 'Album artwork',
  },
};

export const NoImage: Story = {
  name: 'No Image (Placeholder)',
  args: {
    src: undefined,
    alt: 'Missing artwork',
  },
};

export const NullImage: Story = {
  name: 'Null Image',
  args: {
    src: null,
    alt: 'Null artwork',
  },
};

export const BrokenImage: Story = {
  name: 'Broken Image (Error State)',
  args: {
    src: 'https://invalid-url-that-will-fail.jpg',
    alt: 'Broken image',
  },
};

export const SizeSmall: Story = {
  name: 'Size: Small (40x40)',
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
  name: 'Size: Large (96x96)',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    size: 'lg',
  },
};

export const SizeXL: Story = {
  name: 'Size: XL (128x128)',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    size: 'xl',
  },
};

export const RoundedNone: Story = {
  name: 'Rounded: None',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'none',
    size: 'lg',
  },
};

export const RoundedSmall: Story = {
  name: 'Rounded: Small',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'sm',
    size: 'lg',
  },
};

export const RoundedMedium: Story = {
  name: 'Rounded: Medium',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'md',
    size: 'lg',
  },
};

export const RoundedLarge: Story = {
  name: 'Rounded: Large',
  args: {
    src: PLACEHOLDER_ALBUM_ART,
    rounded: 'lg',
    size: 'lg',
  },
};

export const RoundedFull: Story = {
  name: 'Rounded: Full (Circle)',
  args: {
    src: PLACEHOLDER_ARTIST_IMAGE,
    rounded: 'full',
    size: 'lg',
    alt: 'Artist photo',
  },
};

export const AllSizes: Story = {
  name: 'All Sizes Comparison',
  render: () => (
    <div className="flex gap-4 items-end">
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART_SM} size="sm" alt="Small" />
        <p className="text-xs text-muted-foreground mt-1">sm (40px)</p>
      </div>
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART_SM} size="md" alt="Medium" />
        <p className="text-xs text-muted-foreground mt-1">md (64px)</p>
      </div>
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART} size="lg" alt="Large" />
        <p className="text-xs text-muted-foreground mt-1">lg (96px)</p>
      </div>
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART} size="xl" alt="XL" />
        <p className="text-xs text-muted-foreground mt-1">xl (128px)</p>
      </div>
    </div>
  ),
};

export const AllRounded: Story = {
  name: 'All Rounded Variants',
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART} size="lg" rounded="none" alt="None" />
        <p className="text-xs text-muted-foreground mt-1">none</p>
      </div>
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART} size="lg" rounded="sm" alt="Small" />
        <p className="text-xs text-muted-foreground mt-1">sm</p>
      </div>
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART} size="lg" rounded="md" alt="Medium" />
        <p className="text-xs text-muted-foreground mt-1">md</p>
      </div>
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ALBUM_ART} size="lg" rounded="lg" alt="Large" />
        <p className="text-xs text-muted-foreground mt-1">lg</p>
      </div>
      <div className="text-center">
        <Artwork src={PLACEHOLDER_ARTIST_IMAGE} size="lg" rounded="full" alt="Full" />
        <p className="text-xs text-muted-foreground mt-1">full</p>
      </div>
    </div>
  ),
};

export const PlaceholderVariants: Story = {
  name: 'Placeholder Variants',
  render: () => (
    <div className="flex gap-4 items-end">
      <div className="text-center">
        <Artwork src={undefined} size="sm" alt="Small placeholder" />
        <p className="text-xs text-muted-foreground mt-1">sm</p>
      </div>
      <div className="text-center">
        <Artwork src={undefined} size="md" alt="Medium placeholder" />
        <p className="text-xs text-muted-foreground mt-1">md</p>
      </div>
      <div className="text-center">
        <Artwork src={undefined} size="lg" alt="Large placeholder" />
        <p className="text-xs text-muted-foreground mt-1">lg</p>
      </div>
      <div className="text-center">
        <Artwork src={undefined} size="xl" alt="XL placeholder" />
        <p className="text-xs text-muted-foreground mt-1">xl</p>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  name: 'In Context (List Items)',
  render: () => (
    <div className="space-y-2 w-[350px]">
      <div className="flex items-center gap-3 p-2 rounded-lg border">
        <Artwork src={PLACEHOLDER_ALBUM_ART_SM} size="sm" alt="Track artwork" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">Everything In Its Right Place</p>
          <p className="text-sm text-muted-foreground">Radiohead</p>
        </div>
        <span className="text-sm text-muted-foreground">4:11</span>
      </div>
      <div className="flex items-center gap-3 p-2 rounded-lg border">
        <Artwork src={PLACEHOLDER_ALBUM_ART_SM} size="md" alt="Album artwork" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">Kid A</p>
          <p className="text-sm text-muted-foreground">Radiohead • 2000</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 rounded-lg border">
        <Artwork src={PLACEHOLDER_ARTIST_IMAGE} size="md" rounded="full" alt="Artist" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">Radiohead</p>
          <p className="text-sm text-muted-foreground">Artist • Rock</p>
        </div>
      </div>
    </div>
  ),
};

export const MixedContent: Story = {
  name: 'Mixed (With and Without Images)',
  render: () => (
    <div className="space-y-2 w-[350px]">
      <div className="flex items-center gap-3 p-2 rounded-lg border">
        <Artwork src={PLACEHOLDER_ALBUM_ART_SM} size="md" alt="Has image" />
        <div className="flex-1">
          <p className="font-medium">Track with artwork</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 rounded-lg border">
        <Artwork src={undefined} size="md" alt="Missing image" />
        <div className="flex-1">
          <p className="font-medium">Track without artwork</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 rounded-lg border">
        <Artwork src="https://broken.url/image.jpg" size="md" alt="Broken image" />
        <div className="flex-1">
          <p className="font-medium">Track with broken image</p>
        </div>
      </div>
    </div>
  ),
};
