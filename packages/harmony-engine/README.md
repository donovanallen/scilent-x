# @scilent-one/harmony-engine

A standalone package for normalizing and merging music metadata from multiple sources into a canonical representation.

## Overview

The Harmonization Engine provides a unified interface for querying multiple metadata providers (MusicBrainz, Discogs, Spotify, etc.), normalizing responses to a common schema, and merging results with confidence scoring.

### Key Features

- **Provider-agnostic lookups** - Query by GTIN/UPC, ISRC, URL, or search text
- **Merge algorithm** - Priority-based conflict resolution when combining data from multiple sources
- **Caching** - Optional Redis-based snapshot caching for performance
- **Rate limiting** - Per-provider rate limiting (local or distributed via Redis)
- **Extensible architecture** - Easy to add new metadata providers

## Installation

```bash
pnpm add @scilent-one/harmony-engine
```

### Optional Dependencies

For Redis-based caching and distributed rate limiting:

```bash
pnpm add ioredis
```

## Quick Start

```typescript
import { HarmonizationEngine } from "@scilent-one/harmony-engine";

// Create an engine instance
const engine = new HarmonizationEngine({
  providers: {
    providers: {
      musicbrainz: {
        enabled: true,
        priority: 100,
        rateLimit: { requests: 1, windowMs: 1000 },
        cache: { ttlSeconds: 86400 },
        retry: { retries: 3, minTimeout: 1000, maxTimeout: 10000, factor: 2 },
        appName: "MyApp",
        appVersion: "1.0.0",
        contact: "dev@example.com",
      },
    },
  },
});

// Look up a release by barcode (GTIN/UPC)
const result = await engine.lookupByGtin("0602445790920");
console.log(result.data?.title);

// Look up a track by ISRC
const track = await engine.lookupByIsrc("USRC17607839");
console.log(track.data?.title);

// Look up by provider URL
const release = await engine.lookupByUrl(
  "https://musicbrainz.org/release/b84ee12a-09ef-421b-82de-0441a926375b"
);

// Search for releases
const results = await engine.search("Abbey Road Beatles", 25);
```

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                   HarmonizationEngine                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Provider   │  │     Lookup      │  │    Snapshot     │ │
│  │  Registry   │  │   Coordinator   │  │     Cache       │ │
│  └──────┬──────┘  └────────┬────────┘  └────────┬────────┘ │
│         │                  │                     │          │
│         ▼                  ▼                     ▼          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                     Providers                           ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           ││
│  │  │MusicBrainz│  │  Discogs  │  │  Spotify  │  ...      ││
│  │  └───────────┘  └───────────┘  └───────────┘           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Request** - A lookup request (by GTIN, ISRC, URL, or search) is sent to the `LookupCoordinator`
2. **Cache Check** - The coordinator checks the cache for existing results
3. **Provider Lookup** - If not cached, queries are sent to enabled providers in parallel
4. **Transformation** - Each provider transforms its response to the harmonized schema
5. **Merge** - If multiple providers return results, they are merged using priority-based conflict resolution
6. **Cache & Return** - The result is cached and returned

### Harmonized Types

All provider responses are normalized to these core types:

#### HarmonizedRelease

```typescript
interface HarmonizedRelease {
  gtin?: string;              // UPC/EAN barcode
  title: string;
  titleNormalized?: string;
  artists: HarmonizedArtistCredit[];
  releaseDate?: { year?: number; month?: number; day?: number };
  releaseType: "album" | "single" | "ep" | "compilation" | ...;
  labels?: { name: string; catalogNumber?: string }[];
  media: { format?: string; position: number; tracks: HarmonizedTrack[] }[];
  artwork?: { url: string; type: "front" | "back" | ...; width?: number; height?: number }[];
  genres?: string[];
  externalIds: Record<string, string>;  // e.g., { musicbrainz: "uuid", spotify: "id" }
  sources: ProviderSource[];
  confidence: number;  // 0-1 confidence score
  mergedAt: Date;
}
```

#### HarmonizedTrack

```typescript
interface HarmonizedTrack {
  isrc?: string;
  title: string;
  position: number;
  discNumber?: number;
  duration?: number;  // milliseconds
  artists: HarmonizedArtistCredit[];
  explicit?: boolean;
  externalIds: Record<string, string>;
  sources: ProviderSource[];
}
```

#### HarmonizedArtist

```typescript
interface HarmonizedArtist {
  name: string;
  sortName?: string;
  type?: "person" | "group" | "orchestra" | ...;
  country?: string;
  aliases?: string[];
  genres?: string[];
  externalIds: Record<string, string>;
  sources: ProviderSource[];
  confidence: number;
}
```

## Providers

### MusicBrainz (Built-in)

The MusicBrainz provider is included by default and provides high-quality, community-curated metadata.

```typescript
const engine = new HarmonizationEngine({
  providers: {
    providers: {
      musicbrainz: {
        enabled: true,
        priority: 100,  // Higher priority = preferred source
        rateLimit: { requests: 1, windowMs: 1000 },  // 1 req/sec per MB terms
        cache: { ttlSeconds: 86400 },
        retry: { retries: 3, minTimeout: 1000, maxTimeout: 10000, factor: 2 },
        // Required: User-Agent info for MusicBrainz API
        appName: "YourAppName",
        appVersion: "1.0.0",
        contact: "your-email@example.com",
      },
    },
  },
});
```

### Adding Custom Providers

Extend `BaseProvider` to add support for additional metadata sources:

```typescript
import { BaseProvider, ProviderConfig, LookupOptions } from "@scilent-one/harmony-engine";

interface MyProviderConfig extends ProviderConfig {
  apiKey: string;
}

class MyProvider extends BaseProvider {
  readonly name = "myprovider";
  readonly displayName = "My Provider";
  readonly priority = 50;

  constructor(config: MyProviderConfig) {
    super(config);
    this.initializeLogger();
  }

  canHandleUrl(url: string): boolean {
    return /myprovider\.com/.test(url);
  }

  parseUrl(url: string) {
    // Extract type and ID from URL
    return null;
  }

  protected async _lookupReleaseByGtin(gtin: string) {
    // Implement GTIN lookup
    return null;
  }

  // ... implement other abstract methods
}

// Register the provider
engine.registry.register(new MyProvider(config));
```

## Caching

### Redis Cache

For production use, connect Redis for distributed caching:

```typescript
import Redis from "ioredis";
import { HarmonizationEngine } from "@scilent-one/harmony-engine";

const redis = new Redis(process.env.REDIS_URL);

const engine = new HarmonizationEngine({
  providers: { /* ... */ },
  redis,
  cache: {
    defaultTtlSeconds: 86400,  // 24 hours
    keyPrefix: "harmonize:",
  },
});
```

### Bypassing Cache

Force a fresh lookup:

```typescript
const result = await engine.lookupByGtin("0602445790920", {
  bypassCache: true,
});
```

## Rate Limiting

Rate limiting is built into each provider. The rate limiter supports:

- **Local mode** - In-memory token bucket (default)
- **Distributed mode** - Redis-based sliding window for multi-instance deployments

```typescript
// Configure per-provider rate limits
musicbrainz: {
  rateLimit: {
    requests: 1,      // Number of requests
    windowMs: 1000,   // Per time window (1 second)
  },
}
```

## Error Handling

The package exports custom error classes:

```typescript
import {
  HarmonizationError,
  HttpError,
  RateLimitError,
  ProviderNotFoundError,
  ValidationError,
} from "@scilent-one/harmony-engine";

try {
  const result = await engine.lookupByGtin(gtin);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry
    await sleep(error.retryAfter ?? 1000);
  } else if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  }
}
```

## Utilities

### Validation

```typescript
import {
  isValidGtin,
  isValidIsrc,
  normalizeGtin,
  normalizeIsrc,
  normalizeString,
} from "@scilent-one/harmony-engine";

// Validate identifiers
isValidGtin("0602445790920");  // true
isValidIsrc("USRC17607839");   // true

// Normalize for storage/comparison
normalizeGtin("602445790920");      // "00602445790920" (14 digits)
normalizeIsrc("US-RC1-76-07839");   // "USRC17607839"
normalizeString("Björk");           // "bjork"
```

### Logging

Configure logging via environment variables:

```bash
LOG_LEVEL=debug  # trace, debug, info, warn, error, fatal
NODE_ENV=development  # Enables pretty-printing
```

## Development

### Type Checking

```bash
cd packages/harmony-engine
pnpm typecheck
```

### Testing

```bash
pnpm test
```

### Running Tests with Coverage

```bash
pnpm test --coverage
```

## API Reference

### HarmonizationEngine

| Method | Description |
|--------|-------------|
| `lookupByGtin(gtin, options?)` | Look up a release by GTIN/UPC barcode |
| `lookupByIsrc(isrc, providers?)` | Look up a track by ISRC |
| `lookupByUrl(url, options?)` | Look up by provider URL |
| `search(query, limit?, providers?)` | Search for releases |
| `getProvider(name)` | Get a specific provider instance |
| `getEnabledProviders()` | Get all enabled providers |

### LookupResult

```typescript
interface LookupResult<T> {
  data: T | null;           // The harmonized result
  sources: string[];        // Provider names that contributed
  cached: boolean;          // Whether result was from cache
  timestamp: Date;          // When the lookup occurred
  errors: Error[] | undefined;  // Any provider errors
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `NODE_ENV` | Environment (enables pretty logs in development) | - |
| `REDIS_URL` | Redis connection URL for caching | - |

## License

MIT
