# @scilent-one/credits-enricher

Credits enrichment layer for augmenting music metadata with detailed credits from [Muso.ai](https://muso.ai) and other sources.

## Overview

This package provides a composable credits enricher that works alongside `@scilent-one/harmony-engine`. While harmony-engine handles entity lookups (releases, tracks, artists) from streaming platforms and metadata databases, credits-enricher specifically augments that data with detailed songwriting, production, and performance credits.

## Installation

```bash
pnpm add @scilent-one/credits-enricher
```

## Configuration

### API Key Setup

You need a Muso.ai API key. Set it via environment variable or pass it directly in the config:

```bash
# .env
MUSO_API_KEY=your_api_key_here
```

### Basic Usage

```typescript
import { CreditsEnricher } from '@scilent-one/credits-enricher';
import type { HarmonizedTrack, HarmonizedRelease } from '@scilent-one/harmony-engine';

const enricher = new CreditsEnricher({
  providers: {
    muso: {
      apiKey: process.env.MUSO_API_KEY!, // <-- Your API key here
      rateLimit: { requests: 10, windowMs: 1000 },
    },
  },
  redis, // Optional but highly recommended (Muso.ai has 1k/day limit)
});

// Enrich a single track
const enrichedTrack = await enricher.enrichTrack(harmonizedTrack);

// Enrich all tracks in a release
const enrichedRelease = await enricher.enrichRelease(harmonizedRelease);

// Batch enrich multiple tracks
const enrichedTracks = await enricher.enrichTracks(tracks);

// Direct ISRC lookup
const result = await enricher.lookupByIsrc('GBARL1700271');
if (result.success) {
  console.log(result.data.credits);
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────────┐
│ harmony-engine  │              │  credits-enricher   │
│  (entity lookup)│              │  (credits lookup)   │
└────────┬────────┘              └──────────┬──────────┘
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌─────────────────────┐
│ HarmonizedTrack │  ────────▶   │  EnrichedTrack      │
│ HarmonizedRelease│             │  (with credits)     │
└─────────────────┘              └─────────────────────┘
```

## Enriched Credit Structure

Credits from Muso.ai are structured hierarchically:

```typescript
interface EnrichedCredit {
  name: string;          // Collaborator name
  role: string;          // Specific role (e.g., "Composer")
  parentRole?: string;   // Parent category (e.g., "Songwriter")
  category?: CreditCategory; // 'artist' | 'songwriter' | 'production' | 'engineering' | 'performance' | 'other'
  instruments?: string[];
  externalIds?: Record<string, string>; // { muso: "...", musicbrainz: "..." }
  confidence?: number;   // 0-1 confidence score
  avatarUrl?: string;
}
```

## Caching

Due to Muso.ai's rate limits (1,000 requests/day), caching is highly recommended:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const enricher = new CreditsEnricher({
  providers: {
    muso: { apiKey: process.env.MUSO_API_KEY! },
  },
  redis,
  cache: {
    defaultTtlSeconds: 604800, // 7 days (credits rarely change)
    keyPrefix: 'credits:',
  },
});
```

## API Reference

### CreditsEnricher

Main class for enriching tracks with credits.

#### `enrichTrack(track, options?)`

Enriches a single HarmonizedTrack with credits.

#### `enrichTracks(tracks, options?)`

Enriches multiple tracks sequentially (respects rate limits).

#### `enrichRelease(release, options?)`

Enriches all tracks in a HarmonizedRelease.

#### `lookupByIsrc(isrc, options?)`

Direct ISRC lookup without requiring a full track object.

#### `getRoles()`

Get available credit roles from the provider.

### EnrichmentOptions

```typescript
interface EnrichmentOptions {
  bypassCache?: boolean;      // Skip cache lookup
  includeMetadata?: boolean;  // Include track metadata (label, publisher, etc.)
  fallbackToTitleMatch?: boolean; // Try title/artist lookup if ISRC fails
}
```

## Rate Limits

Muso.ai has strict rate limits:
- **1,000 requests/day** - Use caching!
- The enricher uses a conservative 10 req/sec limit by default

## License

Private - @scilent-one
