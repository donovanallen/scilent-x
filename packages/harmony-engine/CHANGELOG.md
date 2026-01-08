# @scilent-one/harmony-engine

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
