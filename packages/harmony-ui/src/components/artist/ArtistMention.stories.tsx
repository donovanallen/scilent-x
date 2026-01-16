import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArtistMention } from './ArtistMention';
import { HarmonyInteractionProvider } from '../../interactions';

const meta: Meta<typeof ArtistMention> = {
  title: 'Artist/ArtistMention',
  component: ArtistMention,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline artist mention component that wraps artist references with interactive behaviors like context menus and hover previews.',
      },
    },
  },
  argTypes: {
    id: {
      control: 'text',
      description: 'Artist ID (provider-specific)',
    },
    name: {
      control: 'text',
      description: 'Artist name to display',
    },
    provider: {
      control: 'select',
      options: ['spotify', 'tidal', 'apple_music', 'musicbrainz'],
      description: 'Provider name',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the mention',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    id: '4Z8W4fKeB5YxbusRsdQVPb',
    name: 'Radiohead',
    provider: 'spotify',
  },
};

export default meta;
type Story = StoryObj<typeof ArtistMention>;

// ============================================================================
// Basic Stories
// ============================================================================

export const Default: Story = {};

export const CustomChildren: Story = {
  args: {
    children: '@Radiohead',
  },
};

export const DifferentProvider: Story = {
  args: {
    id: 'a74b1b7f-71a5-4011-9441-d0b5e4122711',
    name: 'Radiohead',
    provider: 'musicbrainz',
  },
};

export const WithExternalIds: Story = {
  args: {
    externalIds: {
      spotify: '4Z8W4fKeB5YxbusRsdQVPb',
      musicbrainz: 'a74b1b7f-71a5-4011-9441-d0b5e4122711',
      tidal: '1234567',
    },
  },
};

// ============================================================================
// Interactive Stories
// ============================================================================

export const WithClickHandler: Story = {
  args: {
    onClick: (artistId, provider) => {
      alert(`Clicked artist: ${artistId} (${provider})`);
    },
  },
};

// ============================================================================
// With Provider Context
// ============================================================================

export const WithInteractionProvider: Story = {
  decorators: [
    (Story) => (
      <HarmonyInteractionProvider
        config={{
          platform: 'web',
          enableContextMenu: true,
          enableHoverPreview: true,
          hoverDelay: 200,
          onNavigate: (type, entity) => {
            console.log(`Navigate to ${type}:`, entity);
            alert(`Navigate to ${type} details`);
          },
          onOpenExternal: (url, platform) => {
            console.log(`Open ${platform}:`, url);
            alert(`Open in ${platform}: ${url}`);
          },
          onCopyLink: (entity, type) => {
            console.log(`Copy ${type} link:`, entity);
            alert('Link copied!');
          },
          previewContent: {
            artist: 'mini',
          },
        }}
      >
        <div className="p-4">
          <Story />
        </div>
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Right-click the mention for context menu. Hover for preview.
      </p>
      <p className="text-base">
        Check out the new album by{' '}
        <ArtistMention
          id="4Z8W4fKeB5YxbusRsdQVPb"
          name="Radiohead"
          provider="spotify"
          externalIds={{
            spotify: '4Z8W4fKeB5YxbusRsdQVPb',
            musicbrainz: 'a74b1b7f-71a5-4011-9441-d0b5e4122711',
          }}
        />
        !
      </p>
    </div>
  ),
};

// ============================================================================
// In Context
// ============================================================================

export const InParagraph: Story = {
  render: () => (
    <div className="max-w-md">
      <p className="text-base leading-relaxed">
        The track &quot;Everything In Its Right Place&quot; by{' '}
        <ArtistMention
          id="4Z8W4fKeB5YxbusRsdQVPb"
          name="Radiohead"
          provider="spotify"
        />{' '}
        opens with an iconic vocoder effect, setting the tone for the entire
        album. It marked a significant departure from their previous rock sound.
      </p>
    </div>
  ),
};

export const MultipleMentions: Story = {
  render: () => (
    <div className="max-w-md">
      <p className="text-base leading-relaxed">
        Collaboration between{' '}
        <ArtistMention
          id="4Z8W4fKeB5YxbusRsdQVPb"
          name="Radiohead"
          provider="spotify"
        />{' '}
        and{' '}
        <ArtistMention
          id="4CvTDPKA6W06DRfBnZKrau"
          name="Thom Yorke"
          provider="spotify"
        />{' '}
        solo work shows the range of their creative output. Both have influenced
        countless artists in the alternative and electronic genres.
      </p>
    </div>
  ),
};

export const WithCustomStyling: Story = {
  args: {
    className: 'text-lg font-bold',
  },
};
