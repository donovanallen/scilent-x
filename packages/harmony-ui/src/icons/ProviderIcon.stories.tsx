import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProviderIcon } from './ProviderIcon';
import { SpotifyIcon } from './SpotifyIcon';
import { AppleMusicIcon } from './AppleMusicIcon';
import { TidalIcon } from './TidalIcon';
import {
  type Provider,
  type IconVariant,
  type IconColor,
  SIZE_PRESETS,
  PROVIDER_LABELS,
} from './types';

const meta: Meta<typeof ProviderIcon> = {
  title: 'Icons/ProviderIcon',
  component: ProviderIcon,
  tags: ['autodocs'],
  argTypes: {
    provider: {
      control: 'select',
      options: ['spotify', 'apple_music', 'tidal'] as Provider[],
      description: 'The music streaming provider',
    },
    variant: {
      control: 'select',
      options: ['icon', 'wordmark', 'wordmark-vertical'] as IconVariant[],
      description: 'Icon display variant',
    },
    color: {
      control: 'select',
      options: ['brand', 'black', 'white', 'current'] as IconColor[],
      description: 'Icon color scheme',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 24, 32, 48, 64],
      description: 'Icon size (preset or pixel value)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    provider: 'spotify',
    variant: 'icon',
    color: 'brand',
    size: 'lg',
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ProviderIcon>;

// ============================================================================
// Basic Stories
// ============================================================================

export const Default: Story = {};

export const SpotifyBrand: Story = {
  args: {
    provider: 'spotify',
    color: 'brand',
  },
};

export const AppleMusicBrand: Story = {
  args: {
    provider: 'apple_music',
    color: 'brand',
  },
};

export const TidalBlack: Story = {
  args: {
    provider: 'tidal',
    color: 'black',
  },
};

// ============================================================================
// All Providers Grid
// ============================================================================

export const AllProviders: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Brand Colors
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <SpotifyIcon size="xl" color="brand" />
            <span className="text-xs text-muted-foreground">Spotify</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <AppleMusicIcon size="xl" color="brand" />
            <span className="text-xs text-muted-foreground">Apple Music</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TidalIcon size="xl" color="black" />
            <span className="text-xs text-muted-foreground">Tidal</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Black Variants
        </h3>
        <div className="flex items-center gap-6">
          <SpotifyIcon size="xl" color="black" />
          <AppleMusicIcon size="xl" color="black" />
          <TidalIcon size="xl" color="black" />
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">
          White Variants
        </h3>
        <div className="flex items-center gap-6">
          <SpotifyIcon size="xl" color="white" />
          <AppleMusicIcon size="xl" color="white" />
          <TidalIcon size="xl" color="white" />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Variant Showcase
// ============================================================================

export const SpotifyVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Icon:</span>
        <SpotifyIcon variant="icon" size="lg" color="brand" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Wordmark:</span>
        <SpotifyIcon variant="wordmark" size="lg" color="brand" />
      </div>
    </div>
  ),
};

export const TidalVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Icon:</span>
        <TidalIcon variant="icon" size="lg" color="black" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Wordmark:</span>
        <TidalIcon variant="wordmark" size="lg" color="black" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Vertical:</span>
        <TidalIcon variant="wordmark-vertical" size={64} color="black" />
      </div>
    </div>
  ),
};

// ============================================================================
// Size Scale
// ============================================================================

export const SizeScale: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['spotify', 'apple_music', 'tidal'] as Provider[]).map((provider) => (
        <div key={provider} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {PROVIDER_LABELS[provider]}
          </h3>
          <div className="flex items-end gap-4">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <ProviderIcon
                  provider={provider}
                  size={size}
                  color={provider === 'tidal' ? 'black' : 'brand'}
                />
                <span className="text-xs text-muted-foreground">
                  {size} ({SIZE_PRESETS[size]}px)
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const CustomSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <SpotifyIcon size={16} color="brand" />
      <SpotifyIcon size={24} color="brand" />
      <SpotifyIcon size={32} color="brand" />
      <SpotifyIcon size={48} color="brand" />
      <SpotifyIcon size={64} color="brand" />
      <SpotifyIcon size={96} color="brand" />
    </div>
  ),
};
