# @scilent-one/scilent-ui

## 1.2.0

### Minor Changes

- 357c1ae: Add ProfileTypePill component for consistent profile type display across the app. Includes profileTypeLabels, profileTypeColors mappings, and getProfileTypeLabel utility function. Pill shows distinct colors for USER (muted), VOICE (blue), and ARTIST (purple) types.
- ec7df63: Surface artist images and album/release artwork across the app.

  - Add an `images` field to `HarmonizedArtist` and populate it from the Spotify,
    Tidal, and Apple Music provider transforms (previously dropped).
  - Preserve artwork and artist images when merging results across providers so a
    high-confidence provider without covers (e.g. MusicBrainz) no longer clobbers
    another provider's artwork/images.
  - Add a `getArtistImageUrl` helper for picking the best-resolution artist image.
  - Render artist images in `ArtistCard`, `ArtistListItem`, `ArtistHeader`, and
    `ArtistHoverPreview`, falling back to the placeholder icon when none exist.
  - Add a Cover Art Archive fallback (via `getReleaseArtworkFallbacks`) for
    MusicBrainz-only releases in the album card, list item, details, and hover
    preview, and give the shared `Artwork` component a fallback-source chain.
  - Add an `artwork` field to `HarmonizedTrack`, derived from the track's parent
    release: Spotify and Apple Music populate it from the track/song payload,
    Tidal and the release-lookup path inherit it from the parent album. Render it
    in `TrackCard`, `TrackDetails`, and `TrackHoverPreview`, and resolve it for
    track review subjects.

- e9249e5: Expand entity interactions for review ingress:

  - Make `InteractiveWrapper` platform-adaptive: it now opens a long-press dropdown menu on mobile (via the resolved `platform` config) in addition to the existing right-click context menu and hover preview on web. `EntityMenu` is deprecated in favor of `InteractiveWrapper`.
  - Add an `onViewReviews` callback to `HarmonyInteractionConfig` and render a "See reviews" action alongside "Write review" in the track and album context menus.
  - Add an `interactive` prop to `ArtistCredit` so credited artists can surface Harmony interactions, and thread `interactive` through `TrackList`, `AlbumTrackList`, and `ArtistDiscography` so nested entities inherit context menus and hover previews.

- 853a4c0: Add a "Tags" toolbar to the review composer. Once a review subject is attached, a second toggle pill appears next to "Format" that reveals auto-generated (non-interactive) tag pills for the subject's artist and track/release name, plus a pill for each artist (`#`) mention added in the review body.

  `TiptapEditor` (and `PostForm`) gain two new optional props to support this generically: `secondaryToolbar` (an extra toggle pill + collapsible content rendered next to "Format") and `onMentionsChange` (reports the user/artist mentions currently present in the editor). A new `ReviewTagsToolbar` component renders the pills.

- 6d20372: Add review visibility (public/private) support.

  - `@scilent-one/db`: new `PostVisibility` enum and `Post.visibility` column (defaults to `PUBLIC`) plus a migration and index.
  - `@scilent-one/social`: `createReview`/`updateReview` accept `visibility`, new `setReviewVisibility` mutation, and a shared `visibilityWhere` filter enforced across every review/post read path (reviews, post-by-id, posts-by-author, liked/reposted posts, and the home/explore/profile feeds) so private reviews are only ever returned to their author.
  - `@scilent-one/ui`: `PostCard` gains `visibility` + `onToggleVisibility` for an owner "Make private/public" menu item.
  - `@scilent-one/scilent-ui`: `ReviewComposer` gains an animated eye visibility toggle, and `ReviewCard` shows a private badge with subtle styling for private reviews.

- 73187e2: Add music reviews as a post type with ReviewSubject attachments, review composer UI, artwork fallback utilities, and review APIs.
- f5a84d3: Use `next/image` for artwork surfaces (`Artwork`, `AlbumArtwork`, `ArtistCard`, `ArtistHeader`) so the Next app can optimize remote CDN images. `next` is an optional peer dependency; Storybook aliases `next/image` to a native `<img>` mock.

### Patch Changes

- 9f3f588: Reserve a fixed-width external-link slot on ArtistListItem so provider pills stay aligned across rows with and without a link. Make ArtistCard fill grid cells with a reserved genre row so cards share consistent height.
- e144b56: Use distinct artwork fallback icons: music note for tracks, album icon for albums/releases.
- d8fb38f: Add a themeable custom scrollbar system.

  - New scrollbar design tokens (`--scrollbar-size`, `--scrollbar-thumb`, `--scrollbar-thumb-active`, `--scrollbar-track`, `--scrollbar-thumb-opacity`) derived from the palette so they adapt across light/dark and every theme.
  - `custom-scrollbars` class applies a subtle, theme-aware native scrollbar (standard `scrollbar-*` properties plus `::-webkit-scrollbar` fallback) with a `scrollbar-none` opt-out, a `[data-custom-scrollbars='off']` escape hatch, and a coarse-pointer fallback to native overlay scrollbars.
  - `ScrollArea` restyled into a subtle line thumb that animates opacity and shifts to the theme accent while scrolling; adds `scrollbarWidth` and `accent` props plus CSS-variable overrides, and is now touch-aware. `ScrollBar` is now exported.
  - New `useScrollActivity` hook for driving a scrolling state on plain native `overflow` containers.
  - `scilent-ui`: replaced dead `scrollbar-*` utility classes in `EntityPreview` with `custom-scrollbars`.

- 286316a: Add optional `followedArtistsViewAllHref` prop to PlatformProfileCard for linking to the full My Artists page.
- d6f6d66: Improve ReviewCard subject header click targets with proper pointer cursor, focus ring, and non-interactive fallback styling.
- 617ff98: Fix review subject search picker overflow by constraining dialog height and scrolling results.
- ba0fdfc: Add unit tests for icon helpers and tighten coverage reporting scope.
- Updated dependencies [357c1ae]
- Updated dependencies [ec7df63]
- Updated dependencies [e2c08da]
- Updated dependencies [5cf9205]
- Updated dependencies [d8fb38f]
- Updated dependencies [1e76eb2]
- Updated dependencies [853a4c0]
- Updated dependencies [6d20372]
- Updated dependencies [73187e2]
- Updated dependencies [ce42876]
- Updated dependencies [9f3f588]
- Updated dependencies [797c06d]
  - @scilent-one/ui@0.7.0
  - @scilent-one/harmony-engine@0.6.0

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
