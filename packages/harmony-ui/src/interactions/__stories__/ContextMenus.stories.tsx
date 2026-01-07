import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  Button,
} from '@scilent-one/ui';
import { HarmonyInteractionProvider } from '../provider';
import { TrackContextMenu } from '../menus/TrackContextMenu';
import { AlbumContextMenu } from '../menus/AlbumContextMenu';
import { ArtistContextMenu } from '../menus/ArtistContextMenu';
import {
  mockTrack,
  mockTrackExplicit,
  mockRelease,
  mockArtist,
} from '../../__stories__/mock-data';

const meta: Meta = {
  title: 'Interactions/Context Menus',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Context menu components for entity interactions. These menus provide actions like navigation, external links, and copy operations.',
      },
    },
  },
  decorators: [
    (Story) => (
      <HarmonyInteractionProvider
        config={{
          platform: 'web',
          enableContextMenu: true,
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
            alert(`Link copied!`);
          },
          onViewCredits: (entity, type) => {
            console.log(`View ${type} credits:`, entity);
            alert(`View credits for ${type}`);
          },
        }}
      >
        <Story />
      </HarmonyInteractionProvider>
    ),
  ],
};

export default meta;

export const TrackMenu: StoryObj = {
  name: 'Track Context Menu',
  render: () => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click the area below to open the track context menu
      </p>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-context-menu hover:bg-accent/50 transition-colors">
            <p className="font-medium">{mockTrack.title}</p>
            <p className="text-sm text-muted-foreground">Right-click here</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <TrackContextMenu entity={mockTrack} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const TrackMenuWithCredits: StoryObj = {
  name: 'Track Context Menu (With Credits)',
  render: () => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Track with credits shows &quot;View Credits&quot; option
      </p>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-context-menu hover:bg-accent/50 transition-colors">
            <p className="font-medium">{mockTrackExplicit.title}</p>
            <p className="text-sm text-muted-foreground">Right-click here</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <TrackContextMenu entity={mockTrackExplicit} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const AlbumMenu: StoryObj = {
  name: 'Album Context Menu',
  render: () => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click the area below to open the album context menu
      </p>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-context-menu hover:bg-accent/50 transition-colors">
            <p className="font-medium">{mockRelease.title}</p>
            <p className="text-sm text-muted-foreground">Right-click here</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <AlbumContextMenu entity={mockRelease} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const ArtistMenu: StoryObj = {
  name: 'Artist Context Menu',
  render: () => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Right-click the area below to open the artist context menu
      </p>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-context-menu hover:bg-accent/50 transition-colors">
            <p className="font-medium">{mockArtist.name}</p>
            <p className="text-sm text-muted-foreground">Right-click here</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ArtistContextMenu entity={mockArtist} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const MobileDropdownMenu: StoryObj = {
  name: 'Mobile Dropdown Menu (Simulated)',
  decorators: [
    (Story) => (
      <HarmonyInteractionProvider
        config={{
          platform: 'mobile',
          enableContextMenu: true,
          onNavigate: (type) => alert(`Navigate to ${type} details`),
          onOpenExternal: (url, platform) => alert(`Open in ${platform}`),
          onCopyLink: () => alert('Link copied!'),
        }}
      >
        <Story />
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">
        On mobile, menus appear as dropdown menus. Click the button below.
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Open Track Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <TrackContextMenu entity={mockTrack} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const WithCustomMenuItems: StoryObj = {
  name: 'With Custom Menu Items',
  decorators: [
    (Story) => (
      <HarmonyInteractionProvider
        config={{
          platform: 'web',
          enableContextMenu: true,
          onNavigate: (type) => alert(`Navigate to ${type}`),
          customMenuItems: {
            track: [
              {
                id: 'add-to-playlist',
                label: 'Add to Playlist',
                onClick: () => alert('Added to playlist!'),
              },
              {
                id: 'download',
                label: 'Download',
                onClick: () => alert('Downloading...'),
              },
              {
                id: 'delete',
                label: 'Remove from Library',
                destructive: true,
                onClick: () => alert('Removed!'),
              },
            ],
          },
        }}
      >
        <Story />
      </HarmonyInteractionProvider>
    ),
  ],
  render: () => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Custom menu items are appended to the default items
      </p>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-context-menu hover:bg-accent/50 transition-colors">
            <p className="font-medium">{mockTrack.title}</p>
            <p className="text-sm text-muted-foreground">Right-click here</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <TrackContextMenu entity={mockTrack} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const AllMenusComparison: StoryObj = {
  name: 'All Entity Menus',
  render: () => (
    <div className="flex gap-8">
      <div className="text-center">
        <p className="text-sm font-medium mb-2">Track</p>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 cursor-context-menu hover:bg-accent/50 transition-colors">
              <p className="text-sm text-muted-foreground">Right-click</p>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <TrackContextMenu entity={mockTrack} />
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium mb-2">Album</p>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 cursor-context-menu hover:bg-accent/50 transition-colors">
              <p className="text-sm text-muted-foreground">Right-click</p>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <AlbumContextMenu entity={mockRelease} />
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium mb-2">Artist</p>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 cursor-context-menu hover:bg-accent/50 transition-colors">
              <p className="text-sm text-muted-foreground">Right-click</p>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ArtistContextMenu entity={mockArtist} />
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  ),
};
