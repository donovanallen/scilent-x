# @scilent-one/harmony-engine

## 0.6.0

### Minor Changes

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

### Patch Changes

- 73187e2: Add music reviews as a post type with ReviewSubject attachments, review composer UI, artwork fallback utilities, and review APIs.

## 0.5.0

### Minor Changes

- f34093a: Add an Apple Music catalog provider. `AppleMusicProvider` authenticates with a
  MusicKit developer token (ES256 JWT minted from a Team ID, Key ID, and `.p8`
  private key) and supports ISRC track lookup, UPC album lookup, catalog search
  for releases/artists/tracks, and `music.apple.com` URL parsing. The provider is
  registered under the `apple_music` name in the `ProviderRegistry`.
- a4c6686: Add `HarmonizedPlaylist` and `HarmonizedListenHistoryItem` types, plus
  `getPlaylists`/`getRecentlyPlayed` hooks on `BaseProvider`. `AppleMusicProvider`
  implements both: `getPlaylists` returns the user's library playlists (with an
  `isPublic` flag, and an optional `publicOnly` filter), and `getRecentlyPlayed`
  returns their recent listen history via `/v1/me/recent/played/tracks`. Both
  use the same Music User Token-based user authentication as the existing
  `getFollowedArtists` support.
- df96c8f: Add track lookup by URL. `BaseProvider` now exposes `lookupTrackById` and
  `lookupTrackByUrl` (with an opt-in `_lookupTrackById` hook, defaulting to no-op),
  the `LookupCoordinator` and `HarmonizationEngine` gain `lookupTrackByUrl`, and
  the Apple Music provider implements `_lookupTrackById` (`GET /v1/catalog/{storefront}/songs/{id}`).
  This makes Apple Music song links (both standalone `/song/` URLs and album URLs
  with an `?i=<songId>` param) resolve to tracks, closing a gap where `parseUrl`
  returned a track but nothing could look it up.
- f6796bb: Add user-scoped support to the Apple Music provider. `AppleMusicProvider` now
  implements `getCurrentUser` (returning the user's storefront as their profile,
  since Apple Music has no public user profile) and `getFollowedArtists`
  (returning the user's library artists, preferring linked catalog data). These
  requests use Apple's two-token model: the developer token is minted internally
  and the Music User Token is passed as the `accessToken`.
- 36b85f3: Provider `priority` now derives from the instance configuration instead of a
  hardcoded class constant. `BaseProvider` exposes `priority` as a getter that
  returns the configured `ProviderConfig.priority`, falling back to a new
  `defaultPriority` declared on each provider class. Previously the `priority`
  supplied via configuration (which the web app derives from the
  `provider_settings` table) was ignored, so admin priority overrides never
  affected `ProviderRegistry.getByPriority()` ordering, lookup fallback order, or
  status reporting. Provider defaults are unchanged (MusicBrainz 100, Spotify 80,
  Tidal 75, Apple Music 70).
- ee977a8: Resolve Spotify and Tidal song links via `lookupTrackByUrl`. Both providers now
  implement the `_lookupTrackById` hook (Spotify: `GET /tracks/{id}`; Tidal:
  `GET /tracks/{id}` with `include=artists`), so their track URLs/URIs
  (e.g. `https://open.spotify.com/track/...`, `https://tidal.com/browse/track/...`)
  resolve to harmonized tracks instead of returning `null`. This extends the
  track-URL lookup already supported by Apple Music to Spotify and Tidal.

### Patch Changes

- db7cc4d: Improve Apple Music release-type detection. Since the Apple Music API has no
  explicit EP flag, `mapAlbumType` now recognizes EPs from Apple's " - EP"/"(EP)"
  title convention (and singles from the " - Single" suffix) in addition to the
  `isSingle`/`isCompilation` flags, so EPs are no longer misclassified as albums.
- cd33b0c: Fix Apple Music catalog requests when the configured storefront is an empty
  string. `AppleMusicProvider` now falls back to `'us'` for empty/blank storefront
  values (previously only `undefined` triggered the default), preventing malformed
  `/v1/catalog//search` requests that silently returned no results. Additionally,
  `LookupCoordinator` now logs a warning when a provider's search rejects, so
  provider failures are no longer indistinguishable from genuine empty results.

## 0.4.0

### Minor Changes

- 248b89b: Add Spotify integration for user authentication and profile

  - harmony-engine: Added user-authenticated API support to SpotifyProvider
    - `supportsUserAuth` getter for feature detection
    - `getCurrentUser()` to fetch user profile from Spotify /me endpoint
    - `getFollowedArtists()` with cursor-based pagination
    - `searchArtistsWithUserToken()` for user-authenticated artist search

  - auth: Added Spotify OAuth configuration to genericOAuth plugin
    - Authorization and token URLs for Spotify OAuth flow
    - Scopes: user-read-private, user-read-email, user-follow-read
    - PKCE support enabled
    - User info mapping for Better Auth

### Patch Changes

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

## 0.3.0

### Minor Changes

- 4c226e1: Add followed artists API support
  - Add `PaginatedCollection<T>` and `CollectionParams` types for paginated user collections
  - Add `getFollowedArtists(accessToken, params)` method to `BaseProvider` class
  - Implement `_getFollowedArtists` in `TidalProvider` using `/userCollections/{id}/relationships/artists` endpoint
  - Support cursor-based pagination with `page[cursor]` parameter
  - Return harmonized artist data with total count and pagination info

- da2c4a8: Adds support for Provider cUser

### Patch Changes

- 17c0c67: Add support for interactive Artist mentions in Posts
- c98f668: Artist follows update and autogen usernames

## 0.2.2

### Patch Changes

- 4ccafdb: Enables search by by artist, release and track
- 9878cbd: Add Artist and Track search functionality; UI: related components

## 0.2.1

### Patch Changes

- fae832e: Bugfixes and updates ;)

## 0.2.0

### Minor Changes

- 1acecf5: Adds Tidal to supported providers
- cc5e21f: HARMONY: package setup

### Patch Changes

- d5fdd8d: Search query fix
- 7b00bcb: Dependency update

## 0.1.0

### Features

- Initial release of the harmonization engine
- Core types with Zod validation schemas:
  - `HarmonizedRelease` - Unified release/album representation
  - `HarmonizedTrack` - Unified track representation
  - `HarmonizedArtist` - Unified artist representation
- Provider architecture:
  - `BaseProvider` abstract class for implementing metadata providers
  - `ProviderRegistry` for managing multiple providers
  - `MusicBrainzProvider` reference implementation
- Lookup system:
  - `LookupCoordinator` for orchestrating parallel lookups
  - Support for GTIN/UPC, ISRC, URL, and search lookups
  - Priority-based multi-source merging
- Utilities:
  - Rate limiting (local and Redis-based)
  - Retry logic with exponential backoff
  - GTIN/ISRC validation and normalization
  - String normalization for matching
  - Pino-based structured logging
- Caching:
  - Redis-based snapshot cache
  - Configurable TTL
- `HarmonizationEngine` convenience class for easy integration
