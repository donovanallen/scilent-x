# @scilent-one/harmony-engine

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
