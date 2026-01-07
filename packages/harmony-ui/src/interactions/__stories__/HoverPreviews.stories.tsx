import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackHoverPreview } from '../previews/TrackHoverPreview';
import { AlbumHoverPreview } from '../previews/AlbumHoverPreview';
import { ArtistHoverPreview } from '../previews/ArtistHoverPreview';
import {
  mockTrack,
  mockTrackExplicit,
  mockRelease,
  mockArtist,
  mockSoloArtist,
} from '../../__stories__/mock-data';

const meta: Meta = {
  title: 'Interactions/Hover Previews',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hover preview content components shown when hovering over entity cards. Available in mini, full, and links modes.',
      },
    },
  },
};

export default meta;

// Track Previews
export const TrackMini: StoryObj<typeof TrackHoverPreview> = {
  name: 'Track - Mini Mode',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <TrackHoverPreview entity={mockTrack} mode="mini" />
    </div>
  ),
};

export const TrackFull: StoryObj<typeof TrackHoverPreview> = {
  name: 'Track - Full Mode',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <TrackHoverPreview entity={mockTrackExplicit} mode="full" />
    </div>
  ),
};

export const TrackLinks: StoryObj<typeof TrackHoverPreview> = {
  name: 'Track - Links Only Mode',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <TrackHoverPreview entity={mockTrack} mode="links" />
    </div>
  ),
};

export const TrackAllModes: StoryObj<typeof TrackHoverPreview> = {
  name: 'Track - All Modes Comparison',
  render: () => (
    <div className="flex gap-4">
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Mini</h3>
        <div className="border rounded-md p-4 bg-popover">
          <TrackHoverPreview entity={mockTrackExplicit} mode="mini" />
        </div>
      </div>
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Full</h3>
        <div className="border rounded-md p-4 bg-popover">
          <TrackHoverPreview entity={mockTrackExplicit} mode="full" />
        </div>
      </div>
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Links</h3>
        <div className="border rounded-md p-4 bg-popover">
          <TrackHoverPreview entity={mockTrackExplicit} mode="links" />
        </div>
      </div>
    </div>
  ),
};

// Album Previews
export const AlbumMini: StoryObj<typeof AlbumHoverPreview> = {
  name: 'Album - Mini Mode',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <AlbumHoverPreview entity={mockRelease} mode="mini" />
    </div>
  ),
};

export const AlbumFull: StoryObj<typeof AlbumHoverPreview> = {
  name: 'Album - Full Mode',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <AlbumHoverPreview entity={mockRelease} mode="full" />
    </div>
  ),
};

export const AlbumLinks: StoryObj<typeof AlbumHoverPreview> = {
  name: 'Album - Links Only Mode',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <AlbumHoverPreview entity={mockRelease} mode="links" />
    </div>
  ),
};

export const AlbumAllModes: StoryObj<typeof AlbumHoverPreview> = {
  name: 'Album - All Modes Comparison',
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Mini</h3>
        <div className="border rounded-md p-4 bg-popover">
          <AlbumHoverPreview entity={mockRelease} mode="mini" />
        </div>
      </div>
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Full</h3>
        <div className="border rounded-md p-4 bg-popover max-h-96 overflow-auto">
          <AlbumHoverPreview entity={mockRelease} mode="full" />
        </div>
      </div>
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Links</h3>
        <div className="border rounded-md p-4 bg-popover">
          <AlbumHoverPreview entity={mockRelease} mode="links" />
        </div>
      </div>
    </div>
  ),
};

// Artist Previews
export const ArtistMini: StoryObj<typeof ArtistHoverPreview> = {
  name: 'Artist - Mini Mode (Group)',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <ArtistHoverPreview entity={mockArtist} mode="mini" />
    </div>
  ),
};

export const ArtistFull: StoryObj<typeof ArtistHoverPreview> = {
  name: 'Artist - Full Mode (Solo)',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <ArtistHoverPreview entity={mockSoloArtist} mode="full" />
    </div>
  ),
};

export const ArtistLinks: StoryObj<typeof ArtistHoverPreview> = {
  name: 'Artist - Links Only Mode',
  render: () => (
    <div className="w-80 border rounded-md p-4 bg-popover">
      <ArtistHoverPreview entity={mockArtist} mode="links" />
    </div>
  ),
};

export const ArtistAllModes: StoryObj<typeof ArtistHoverPreview> = {
  name: 'Artist - All Modes Comparison',
  render: () => (
    <div className="flex gap-4">
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Mini</h3>
        <div className="border rounded-md p-4 bg-popover">
          <ArtistHoverPreview entity={mockArtist} mode="mini" />
        </div>
      </div>
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Full</h3>
        <div className="border rounded-md p-4 bg-popover">
          <ArtistHoverPreview entity={mockArtist} mode="full" />
        </div>
      </div>
      <div className="w-80">
        <h3 className="text-sm font-medium mb-2">Links</h3>
        <div className="border rounded-md p-4 bg-popover">
          <ArtistHoverPreview entity={mockArtist} mode="links" />
        </div>
      </div>
    </div>
  ),
};
