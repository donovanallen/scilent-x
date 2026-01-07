# @scilent-one/harmony-ui

Composite UI components for displaying harmonized music metadata. Built on top of `@scilent-one/ui` and designed to work seamlessly with data from `@scilent-one/harmony-engine`.

## Features

- **Entity Components** - Ready-to-use cards and detail views for tracks, albums, and artists
- **Interactive Behaviors** - Context menus, hover previews, and platform-adaptive interactions
- **Provider Pattern** - Configure interaction behaviors once at the app level
- **Graceful Degradation** - Components work without the provider, interactions are simply disabled
- **Platform Adaptive** - Automatically switches between web (hover/right-click) and mobile (tap/long-press) patterns

## Installation

```bash
pnpm add @scilent-one/harmony-ui
```

### Peer Dependencies

```bash
pnpm add react react-dom lucide-react
```

## Quick Start

### Basic Usage (Without Interactions)

```tsx
import { TrackCard, AlbumCard, ArtistCard } from '@scilent-one/harmony-ui';

function MusicLibrary({ track, album, artist }) {
  return (
    <div>
      <TrackCard track={track} />
      <AlbumCard release={album} />
      <ArtistCard artist={artist} />
    </div>
  );
}
```

### With Interactive Features

Wrap your app with `HarmonyInteractionProvider` to enable context menus and hover previews:

```tsx
import {
  HarmonyInteractionProvider,
  TrackCard,
  AlbumCard,
  ArtistCard,
} from '@scilent-one/harmony-ui';

function App() {
  return (
    <HarmonyInteractionProvider
      config={{
        platform: 'web',
        enableContextMenu: true,
        enableHoverPreview: true,
        hoverDelay: 300,
        onNavigate: (type, entity) => {
          // Handle navigation to detail pages
          router.push(`/${type}/${entity.externalIds.spotify}`);
        },
        onOpenExternal: (url, platform) => {
          window.open(url, '_blank');
        },
        onCopyLink: (entity, type) => {
          navigator.clipboard.writeText(`https://myapp.com/${type}/${entity.id}`);
        },
      }}
    >
      <MusicLibrary />
    </HarmonyInteractionProvider>
  );
}

function MusicLibrary() {
  return (
    <div>
      {/* Use the `interactive` prop to enable context menus and hover previews */}
      <TrackCard track={track} interactive />
      <AlbumCard release={album} interactive />
      <ArtistCard artist={artist} interactive />
    </div>
  );
}
```

## Components

### Entity Cards

| Component | Description |
|-----------|-------------|
| `TrackCard` | Displays track with title, artist, duration, and optional artwork |
| `AlbumCard` | Displays album with artwork, title, artist, and release info |
| `ArtistCard` | Displays artist with image, name, and genres |

### Entity Details

| Component | Description |
|-----------|-------------|
| `TrackDetails` | Full track information with metadata table |
| `AlbumDetails` | Complete album view with track list |
| `ArtistHeader` | Artist hero section with stats |
| `ArtistDiscography` | Grid of artist's releases |

### Common Components

| Component | Description |
|-----------|-------------|
| `PlatformBadge` | Badge showing platform source (Spotify, MusicBrainz, etc.) |
| `PlatformBadgeList` | List of platform badges |
| `MetadataTable` | Key-value table for displaying metadata |

## Interactions System

The interactions system provides configurable context menus and hover previews for entity components.

### HarmonyInteractionProvider

The provider configures interaction behaviors for all nested components.

```tsx
import { HarmonyInteractionProvider } from '@scilent-one/harmony-ui';

<HarmonyInteractionProvider
  config={{
    // Platform configuration
    platform: 'auto', // 'web' | 'mobile' | 'auto'

    // Feature toggles
    enableContextMenu: true,
    enableHoverPreview: true,
    hoverDelay: 300, // ms before showing preview

    // Callbacks
    onNavigate: (entityType, entity) => { /* ... */ },
    onOpenExternal: (url, platform) => { /* ... */ },
    onCopyLink: (entity, entityType) => { /* ... */ },
    onViewCredits: (entity, entityType) => { /* ... */ },

    // Custom menu items per entity type
    customMenuItems: {
      track: [
        {
          id: 'add-to-playlist',
          label: 'Add to Playlist',
          onClick: () => { /* ... */ },
        },
      ],
      album: [
        {
          id: 'download',
          label: 'Download Album',
          onClick: () => { /* ... */ },
        },
      ],
    },

    // Preview content modes per entity type
    previewContent: {
      track: 'mini',  // 'mini' | 'full' | 'links'
      album: 'full',
      artist: 'links',
    },
  }}
>
  {children}
</HarmonyInteractionProvider>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `platform` | `'web' \| 'mobile' \| 'auto'` | `'auto'` | Platform to optimize for. `'auto'` detects based on screen size |
| `enableContextMenu` | `boolean` | `true` | Enable right-click (web) or long-press (mobile) menus |
| `enableHoverPreview` | `boolean` | `true` | Enable hover previews (web only) |
| `hoverDelay` | `number` | `300` | Milliseconds before showing hover preview |
| `onNavigate` | `function` | - | Callback when user wants to navigate to entity details |
| `onOpenExternal` | `function` | - | Callback when user wants to open entity in external platform |
| `onCopyLink` | `function` | - | Callback when user wants to copy entity link |
| `onViewCredits` | `function` | - | Callback when user wants to view entity credits |
| `customMenuItems` | `object` | - | Additional menu items per entity type |
| `previewContent` | `object` | - | Preview mode per entity type |

### Using the `interactive` Prop

The simplest way to enable interactions is with the `interactive` prop:

```tsx
<TrackCard track={track} interactive />
<AlbumCard release={album} interactive />
<ArtistCard artist={artist} interactive />
```

### Using InteractiveWrapper Directly

For more control, wrap any component with `InteractiveWrapper`:

```tsx
import { InteractiveWrapper } from '@scilent-one/harmony-ui';

<InteractiveWrapper entityType="track" entity={track}>
  <CustomTrackComponent track={track} />
</InteractiveWrapper>
```

### Using Individual Menu/Preview Components

For advanced use cases, use the menu and preview components directly:

```tsx
import {
  EntityMenu,
  EntityPreview,
  TrackContextMenu,
  TrackHoverPreview,
} from '@scilent-one/harmony-ui';

// Use EntityMenu for platform-adaptive menus
<EntityMenu entityType="track" entity={track}>
  <TrackCard track={track} />
</EntityMenu>

// Use EntityPreview for platform-adaptive previews
<EntityPreview entityType="album" entity={album}>
  <AlbumCard release={album} />
</EntityPreview>
```

### useHarmonyInteraction Hook

Access the interaction configuration in custom components:

```tsx
import { useHarmonyInteraction } from '@scilent-one/harmony-ui';

function CustomComponent() {
  const interaction = useHarmonyInteraction();

  if (!interaction.enabled) {
    return <BasicView />;
  }

  return (
    <InteractiveView
      platform={interaction.platform}
      onNavigate={interaction.onNavigate}
    />
  );
}
```

## Preview Modes

Each entity type supports three preview modes:

| Mode | Description |
|------|-------------|
| `mini` | Compact preview with key info and platform badges |
| `full` | Expanded preview with artwork, metadata, and details |
| `links` | Just the title and platform link badges |

```tsx
<HarmonyInteractionProvider
  config={{
    previewContent: {
      track: 'mini',   // Compact track info
      album: 'full',   // Full album with artwork
      artist: 'links', // Just platform links
    },
  }}
>
```

You can also provide a custom component:

```tsx
import type { EntityPreviewContentProps } from '@scilent-one/harmony-ui';

function CustomTrackPreview({ entity, entityType }: EntityPreviewContentProps) {
  const track = entity as HarmonizedTrack;
  return <div>Custom preview for {track.title}</div>;
}

<HarmonyInteractionProvider
  config={{
    previewContent: {
      track: CustomTrackPreview,
    },
  }}
>
```

## Context Menu Actions

### Track Menu
- View Track Details
- View Credits (if available)
- Open in... (Spotify, MusicBrainz, Tidal, etc.)
- Copy ISRC
- Copy Link
- Custom actions

### Album Menu
- View Album Details
- View Artist
- View Credits & Metadata
- Open in... (external platforms)
- Copy UPC/GTIN
- Copy Link
- Custom actions

### Artist Menu
- View Artist
- View Discography
- Open in... (external platforms)
- Copy Link
- Custom actions

## Storybook

Run Storybook to see all components and interactions in action:

```bash
pnpm dev:harmony-ui:storybook
```

Then open http://localhost:6007

## Types

All types are exported for TypeScript users:

```tsx
import type {
  // Entity types
  HarmonizedTrack,
  HarmonizedRelease,
  HarmonizedArtist,

  // Interaction types
  EntityType,
  Platform,
  HarmonizedEntity,
  MenuAction,
  PreviewMode,
  PreviewContent,
  HarmonyInteractionConfig,

  // Component props
  TrackCardProps,
  AlbumCardProps,
  ArtistCardProps,
  InteractiveWrapperProps,
} from '@scilent-one/harmony-ui';
```

## Utility Functions

```tsx
import {
  formatDuration,      // Format ms to "3:45"
  formatPartialDate,   // Format { year, month, day } to string
  formatArtistCredits, // Format artist array to "Artist 1 & Artist 2"
  getPrimaryArtistName,// Get first artist name
  formatTrackPosition, // Format "1" or "1-3" (disc-track)
  getFrontArtworkUrl,  // Get front cover URL from artwork array
} from '@scilent-one/harmony-ui';
```

## License

Private - @scilent-one
