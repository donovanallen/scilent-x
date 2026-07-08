# @scilent-one/scilent-ui

## 1.1.0

### Minor Changes

- add1a19: Add a shared motion foundation and apply it across core UI primitives (Phase 1 of the global motion system).

  - Migrated from the deprecated `tailwindcss-animate` plugin to `tw-animate-css` (Tailwind v4-native, CSS-first).
  - Added a shared motion scale: named `duration-instant/fast/base/slow/slower` utilities and polished `ease-out`/`ease-in`/`ease-in-out` easing curves, wired through to both CSS transitions and `animate-in`/`animate-out` entrance/exit animations.
  - Added `useReducedMotion` and `useInViewport` hooks, plus a `Reveal` component for IntersectionObserver-based fade/slide-in-view reveals with a capped stagger delay (skipped entirely under `prefers-reduced-motion`).
  - Applied the new tokens to `Button` (press/hover feedback), `Dialog`, `Sheet`, `DropdownMenu`, `ContextMenu`, `Popover`, `HoverCard`, `Select`, `Tooltip` (consistent enter/exit timing), `Tabs`, `Switch`, and `Sidebar` (collapse/expand easing).
  - Replaced `Skeleton`'s flat pulse with a shimmer sweep, falling back to the pulse under reduced motion.
  - Standardized hover-lift/scale transitions across `AlbumArtwork`, `AlbumCard`, `TrackCard`, and `ArtistCard` on the shared tokens.
  - Applied the `Reveal` stagger pattern to the web app's search results grid and the social feed's post list (reference implementations).

  This is a visual-only, backwards-compatible change - no public component APIs changed shape (aside from the new `useReducedMotion`, `useInViewport`, and `Reveal` exports from `@scilent-one/ui`).

- 4c5c5e9: `PlatformProfileCard` now supports optional `playlists` and `recentTracks`
  sections (alongside the existing `followedArtists` section), with matching
  `showPlaylists`/`maxPlaylistBadges` and `showRecentTracks`/`maxRecentTracks`
  props for the Apple Music profile card's new public-playlists and
  recent-listen-history data.

### Patch Changes

- b393c13: Fix provider icon visibility across themes. The Apple Music icon rendered blank
  because its source SVGs declared explicit `width`/`height` alongside a matching
  `viewBox`, so SVGO stripped the `viewBox` during the build and the 361-unit
  artwork was drawn 1:1 into a 24px box; the fixed dimensions have been removed so
  the `viewBox` is retained and the mark scales correctly.

  Add a theme-aware `auto` `IconColor` and make it the default for `TidalIcon`.
  Because Tidal ships only monochrome PNGs and the app themes via CSS-variable
  tokens (not `dark:` utilities), the theme-aware path paints the PNG's alpha as a
  CSS mask filled with `currentColor` (pinned to `--foreground`), so the logo stays
  legible in both light and dark mode. `SpotifyIcon` and `AppleMusicIcon` also
  accept `color="auto"` for the same theme-adaptive, monochrome behavior. Explicit
  `black`/`white` colors are unchanged.

- Updated dependencies [f34093a]
- Updated dependencies [db7cc4d]
- Updated dependencies [a4c6686]
- Updated dependencies [cd33b0c]
- Updated dependencies [df96c8f]
- Updated dependencies [f6796bb]
- Updated dependencies [3ba4d08]
- Updated dependencies [add1a19]
- Updated dependencies [a011feb]
- Updated dependencies [36b85f3]
- Updated dependencies [81d78d4]
- Updated dependencies [ee977a8]
  - @scilent-one/harmony-engine@0.5.0
  - @scilent-one/ui@0.6.0

## 1.0.0

### Major Changes

- 3f77a0d: Renamed package from `@scilent-one/harmony-ui` to `@scilent-one/scilent-ui`. Update all imports in consuming applications.

### Minor Changes

- e2565e4: Design improvements, Track component updates

### Patch Changes

- 411406f: Updates to Editor component and PlatformProfileCard
- Routine dependency maintenance across the monorepo.

  - Updated all in-range dependencies to their latest minor/patch versions
    (Radix UI, Tiptap, Storybook, Vitest, Prisma, @typescript-eslint, Turbo, etc.)
  - Bumped `next` to 16.2.10, `react`/`react-dom` to 19.2.7, and `lucide-react`
    to 1.23.0 (fixed the one breaking change: the removed `Github` brand icon
    in a Storybook story)
  - Deliberately upgraded several majors after verifying no breaking impact:
    `date-fns` 3 -> 4, `pino` 9 -> 10, `zod` 3 -> 4 (updated `z.record()` calls
    to the new two-argument signature), `eslint` 9 -> 10, `chromatic` 13 -> 18,
    `vite` 7 -> 8, `@vitejs/plugin-react` 5 -> 6, `vite-plugin-svgr` 4 -> 5,
    `p-retry` 6 -> 8 (updated `onFailedAttempt` to the new `RetryContext` shape),
    `@types/node` 25 -> 26, `dotenv` 16 -> 17, `isomorphic-dompurify` 2 -> 3,
    `html-react-parser` 5 -> 6, and `eslint-import-resolver-typescript` 3 -> 4
  - Deferred the TypeScript 5.9 -> 6.0 major upgrade; see `docs/TODO.md` for
    the reason (deprecated `downlevelIteration` compiler option breaks the
    shared tsconfig base repo-wide)

- Updated dependencies [411406f]
- Updated dependencies [9583c33]
- Updated dependencies [e844788]
- Updated dependencies
- Updated dependencies [d3ae508]
- Updated dependencies [e2565e4]
- Updated dependencies [1effcfd]
- Updated dependencies [248b89b]
- Updated dependencies [336f53e]
- Updated dependencies [081f182]
  - @scilent-one/ui@0.5.0
  - @scilent-one/harmony-engine@0.4.0

## 0.4.1

### Patch Changes

- 1094f0e: Minor dependency updates
- 3fbaef5: Deps continued
- Updated dependencies [1479e4a]
- Updated dependencies [dbcbbc6]
- Updated dependencies [1094f0e]
- Updated dependencies [b2e96c9]
  - @scilent-one/ui@0.4.0

## 0.4.0

### Minor Changes

- 8909708: Adds Provider Icon support

### Patch Changes

- 17c0c67: Add support for interactive Artist mentions in Posts
- 0b9fc06: Add PlatformProfileCard component
- af1ae2c: Unit tests (UI, HUI)
- af1ae2c: Unit tests (HUI, UI)
- Updated dependencies [17c0c67]
- Updated dependencies [4c226e1]
- Updated dependencies [c98f668]
- Updated dependencies [c087095]
- Updated dependencies [af1ae2c]
- Updated dependencies [af1ae2c]
- Updated dependencies [da2c4a8]
- Updated dependencies [f94f082]
- Updated dependencies [f7ed7e3]
  - @scilent-one/harmony-engine@0.3.0
  - @scilent-one/ui@0.3.1

## 0.3.1

### Patch Changes

- 48cd718: Misc updates
- 7ea8b69: Styling updates to HoverPreviews and UserCard
- 6b12ad4: Hover card updates
- Updated dependencies [3d61287]
- Updated dependencies [7ea8b69]
- Updated dependencies [0273008]
- Updated dependencies [dd3fbae]
- Updated dependencies [3f688ca]
- Updated dependencies [ee04bd1]
  - @scilent-one/ui@0.3.0

## 0.3.0

### Minor Changes

- 8f5cc5a: Adds Harmony IX

### Patch Changes

- 9ae319e: Add ReleaseTypePill component for consistent release type badge display across the UI
- 7e2a609: Styling updates for entity components
- 4ccafdb: Enables search by by artist, release and track
- 3e8c1e0: HUI: various UI updates; UI: Toggle styling
- f28d607: Card and List Item styling updates
- a8e0b4c: Minor styling updates and bugfixes
- Updated dependencies [4ccafdb]
- Updated dependencies [3e8c1e0]
- Updated dependencies [8f5cc5a]
- Updated dependencies [57e37c7]
- Updated dependencies [9878cbd]
- Updated dependencies [c1ee10a]
- Updated dependencies [19da5e1]
- Updated dependencies [30e15c5]
  - @scilent-one/harmony-engine@0.2.2
  - @scilent-one/ui@0.2.0

## 0.2.0

### Minor Changes

- 80e67de: Update types to harmony-engine
- 752ac6e: Adds AlbumArtwork component

### Patch Changes

- f9b84b8: Updates harmony-engine dependency
- e055f71: HARMONY-UI: Initial components and stories
- 518fb33: Bugfixes
- Updated dependencies [fae832e]
  - @scilent-one/harmony-engine@0.2.1
