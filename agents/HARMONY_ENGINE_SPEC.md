# Music Metadata Harmonization Engine (MMHE)

Standalone package for normalizing and merging music metadata from multiple sources into a canonical representation.

---

## Overview

**Purpose**: Query multiple metadata providers (MusicBrainz, Discogs, Spotify, etc.), normalize responses to a common schema, and merge results with confidence scoring.

**Key Features**:

- Provider-agnostic lookup by GTIN/UPC, ISRC, URL, or search
- Merge algorithm with priority-based conflict resolution
- Snapshot caching for permalinks
- Rate limiting per provider
- Extensible provider architecture

---

## Integration with Existing Monorepo

### Package Location

```
your-monorepo/
├── apps/
│   └── web/                        # Your existing Next.js app
├── packages/
│   └── harmony-engine/       # This package
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── prisma/
│           └── schema.prisma       # Extends your existing schema
```

### Package.json

```json
{
  "name": "@your-org/harmony-engine",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./providers": "./dist/providers/index.js",
    "./types": "./dist/types/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "ioredis": "^5.4.0",
    "zod": "^3.23.0",
    "pino": "^9.0.0",
    "p-retry": "^6.2.0",
    "p-throttle": "^6.1.0",
    "franc": "^6.2.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "@types/node": "^22.0.0"
  },
  "peerDependencies": {
    "@prisma/client": "^5.0.0"
  }
}
```

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Directory Structure

```
packages/harmony-engine/
├── src/
│   ├── index.ts                      # Public API exports
│   ├── types/
│   │   ├── index.ts
│   │   ├── harmonized.types.ts       # Core harmonized entity types
│   │   └── provider.types.ts         # Provider interface types
│   ├── providers/
│   │   ├── index.ts                  # Provider registry + exports
│   │   ├── base.provider.ts          # Abstract base class
│   │   ├── musicbrainz.provider.ts
│   │   ├── discogs.provider.ts
│   │   ├── deezer.provider.ts
│   │   ├── spotify.provider.ts       # Template for OAuth providers
│   │   └── soundcloud.provider.ts    # Template
│   ├── harmonizer/
│   │   ├── index.ts
│   │   ├── normalizer.ts             # String/data normalization
│   │   ├── merger.ts                 # Multi-source merge algorithm
│   │   └── confidence.ts             # Match confidence scoring
│   ├── lookup/
│   │   ├── index.ts
│   │   ├── coordinator.ts            # Orchestrates parallel lookups
│   │   └── strategies.ts             # ISRC, GTIN, URL strategies
│   ├── cache/
│   │   ├── index.ts
│   │   ├── redis.cache.ts
│   │   └── snapshot.ts               # Permalink snapshots
│   ├── utils/
│   │   ├── rate-limiter.ts
│   │   ├── retry.ts
│   │   ├── logger.ts
│   │   └── validation.ts
│   └── errors/
│       └── index.ts                  # Custom error classes
├── prisma/
│   └── schema.prisma                 # Database models
├── package.json
└── tsconfig.json
```

---

## Prisma Schema

Add to your existing Prisma schema or create `packages/harmony-engine/prisma/schema.prisma`:

```prisma
// Harmonization cache and audit tables
// Merge with your existing schema

model HarmonizedRelease {
  id              String   @id @default(cuid())
  gtin            String?  @unique
  title           String
  titleNormalized String
  releaseDate     String?
  releaseType     String   @default("album")

  // JSON fields for complex nested data
  artists         Json     // HarmonizedArtist[]
  media           Json     // Media with tracks
  labels          Json?
  artwork         Json?
  genres          String[]
  externalIds     Json     // Record<provider, id>
  sources         Json     // ProviderSource[]

  confidence      Float    @default(0)
  mergedAt        DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([gtin])
  @@index([titleNormalized])
}

model HarmonizedTrack {
  id              String   @id @default(cuid())
  isrc            String?  @unique
  title           String
  titleNormalized String
  duration        Int?
  position        Int?

  artists         Json
  externalIds     Json
  sources         Json

  confidence      Float    @default(0)
  mergedAt        DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([isrc])
  @@index([titleNormalized])
}

model HarmonizedArtist {
  id              String   @id @default(cuid())
  name            String
  nameNormalized  String
  sortName        String?
  disambiguation  String?
  type            String?

  aliases         String[]
  genres          String[]
  externalIds     Json
  sources         Json

  confidence      Float    @default(0)
  mergedAt        DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([nameNormalized])
}

model ProviderSnapshot {
  id          String   @id @default(cuid())
  provider    String
  requestUrl  String
  requestHash String   @unique
  response    Json
  fetchedAt   DateTime @default(now())
  expiresAt   DateTime

  @@index([provider, requestHash])
  @@index([expiresAt])
}

model ProviderRateLimit {
  id            String   @id @default(cuid())
  provider      String   @unique
  tokensUsed    Int      @default(0)
  windowStart   DateTime @default(now())

  @@index([provider])
}
```

---

## Core Types

```typescript
// src/types/harmonized.types.ts
import { z } from 'zod';

export const ProviderSourceSchema = z.object({
  provider: z.string(),
  id: z.string(),
  url: z.string().url().optional(),
  fetchedAt: z.coerce.date(),
  snapshotId: z.string().optional(),
});

export type ProviderSource = z.infer<typeof ProviderSourceSchema>;

export const HarmonizedArtistCreditSchema = z.object({
  name: z.string(),
  creditedName: z.string().optional(),
  joinPhrase: z.string().optional(),
  roles: z.array(z.string()).optional(),
  externalIds: z.record(z.string()).optional(),
});

export const HarmonizedTrackSchema = z.object({
  isrc: z.string().optional(),
  title: z.string(),
  titleNormalized: z.string().optional(),
  disambiguation: z.string().optional(),
  position: z.number().int().positive(),
  discNumber: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  artists: z.array(HarmonizedArtistCreditSchema),
  credits: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
      })
    )
    .optional(),
  explicit: z.boolean().optional(),
  externalIds: z.record(z.string()),
  sources: z.array(ProviderSourceSchema),
});

export type HarmonizedTrack = z.infer<typeof HarmonizedTrackSchema>;

export const HarmonizedReleaseSchema = z.object({
  gtin: z.string().optional(),
  title: z.string(),
  titleNormalized: z.string().optional(),
  disambiguation: z.string().optional(),

  artists: z.array(HarmonizedArtistCreditSchema),

  releaseDate: z
    .object({
      year: z.number().optional(),
      month: z.number().optional(),
      day: z.number().optional(),
    })
    .optional(),
  releaseType: z.enum([
    'album',
    'single',
    'ep',
    'compilation',
    'soundtrack',
    'live',
    'remix',
    'other',
  ]),
  status: z
    .enum(['official', 'promotional', 'bootleg', 'pseudo-release'])
    .optional(),

  labels: z
    .array(
      z.object({
        name: z.string(),
        catalogNumber: z.string().optional(),
      })
    )
    .optional(),

  releaseCountry: z.string().optional(),
  availableCountries: z.array(z.string()).optional(),

  media: z.array(
    z.object({
      format: z.string().optional(),
      position: z.number().int().positive(),
      tracks: z.array(HarmonizedTrackSchema),
    })
  ),

  artwork: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(['front', 'back', 'medium', 'booklet', 'other']),
        width: z.number().optional(),
        height: z.number().optional(),
        provider: z.string(),
      })
    )
    .optional(),

  genres: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  language: z
    .object({
      script: z.string().optional(),
      language: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
    .optional(),

  externalIds: z.record(z.string()),
  sources: z.array(ProviderSourceSchema),

  mergedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1),
});

export type HarmonizedRelease = z.infer<typeof HarmonizedReleaseSchema>;

export const HarmonizedArtistSchema = z.object({
  name: z.string(),
  nameNormalized: z.string().optional(),
  sortName: z.string().optional(),
  disambiguation: z.string().optional(),
  type: z
    .enum(['person', 'group', 'orchestra', 'choir', 'character', 'other'])
    .optional(),

  country: z.string().optional(),
  beginDate: z
    .object({
      year: z.number().optional(),
      month: z.number().optional(),
      day: z.number().optional(),
    })
    .optional(),
  endDate: z
    .object({
      year: z.number().optional(),
      month: z.number().optional(),
      day: z.number().optional(),
    })
    .optional(),

  aliases: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),

  externalIds: z.record(z.string()),
  sources: z.array(ProviderSourceSchema),

  mergedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1),
});

export type HarmonizedArtist = z.infer<typeof HarmonizedArtistSchema>;
```

---

## Provider Architecture

### Base Provider (Abstract)

```typescript
// src/providers/base.provider.ts
import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
  ProviderSource,
} from '../types';
import { Logger } from '../utils/logger';
import { RateLimiter } from '../utils/rate-limiter';
import { withRetry, RetryConfig } from '../utils/retry';

export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  rateLimit: { requests: number; windowMs: number };
  cache: { ttlSeconds: number; staleWhileRevalidateSeconds?: number };
  retry: RetryConfig;
  // Provider-specific config
  [key: string]: unknown;
}

export interface LookupOptions {
  includeCredits?: boolean;
  includeArtwork?: boolean;
  region?: string;
  bypassCache?: boolean;
}

export abstract class BaseProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly priority: number;

  protected logger: Logger;
  protected rateLimiter: RateLimiter;
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.logger = new Logger(`provider:${this.name}`);
    this.rateLimiter = new RateLimiter(
      this.name,
      config.rateLimit.requests,
      config.rateLimit.windowMs
    );
  }

  // URL handling
  abstract canHandleUrl(url: string): boolean;
  abstract parseUrl(
    url: string
  ): { type: 'release' | 'artist' | 'track'; id: string } | null;

  // Core lookups (implement in subclasses)
  protected abstract _lookupReleaseByGtin(
    gtin: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null>;
  protected abstract _lookupReleaseByUrl(
    url: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null>;
  protected abstract _lookupReleaseById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null>;
  protected abstract _lookupTrackByIsrc(
    isrc: string,
    options?: LookupOptions
  ): Promise<HarmonizedTrack | null>;
  protected abstract _lookupArtistById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedArtist | null>;
  protected abstract _searchReleases(
    query: string,
    limit?: number
  ): Promise<HarmonizedRelease[]>;
  protected abstract _searchArtists(
    query: string,
    limit?: number
  ): Promise<HarmonizedArtist[]>;

  // Public methods with rate limiting + retry
  async lookupReleaseByGtin(
    gtin: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupReleaseByGtin(gtin, options)
    );
  }

  async lookupReleaseByUrl(
    url: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupReleaseByUrl(url, options)
    );
  }

  async lookupReleaseById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupReleaseById(id, options)
    );
  }

  async lookupTrackByIsrc(
    isrc: string,
    options?: LookupOptions
  ): Promise<HarmonizedTrack | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupTrackByIsrc(isrc, options)
    );
  }

  async lookupArtistById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedArtist | null> {
    return this.withRateLimitAndRetry(() =>
      this._lookupArtistById(id, options)
    );
  }

  async searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    return this.withRateLimitAndRetry(() => this._searchReleases(query, limit));
  }

  async searchArtists(query: string, limit = 25): Promise<HarmonizedArtist[]> {
    return this.withRateLimitAndRetry(() => this._searchArtists(query, limit));
  }

  // Helper for wrapping calls
  protected async withRateLimitAndRetry<T>(fn: () => Promise<T>): Promise<T> {
    await this.rateLimiter.acquire();
    return withRetry(fn, this.config.retry, this.logger);
  }

  // Source helper
  protected createSource(id: string, url?: string): ProviderSource {
    return {
      provider: this.name,
      id,
      url,
      fetchedAt: new Date(),
    };
  }

  // Normalization helper
  protected normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
```

### Provider Registry

```typescript
// src/providers/index.ts
import { BaseProvider, ProviderConfig } from './base.provider';
import { MusicBrainzProvider } from './musicbrainz.provider';
import { DiscogsProvider } from './discogs.provider';
import { DeezerProvider } from './deezer.provider';
import { SpotifyProvider } from './spotify.provider';
import { SoundCloudProvider } from './soundcloud.provider';

export type ProviderName =
  | 'musicbrainz'
  | 'discogs'
  | 'deezer'
  | 'spotify'
  | 'soundcloud';

export interface ProviderRegistryConfig {
  providers: Partial<Record<ProviderName, ProviderConfig>>;
  defaultProviders?: ProviderName[];
}

export class ProviderRegistry {
  private providers = new Map<string, BaseProvider>();
  private defaultProviders: string[] = [];

  constructor(config: ProviderRegistryConfig) {
    this.initializeProviders(config);
    this.defaultProviders = config.defaultProviders || [
      'musicbrainz',
      'discogs',
    ];
  }

  private initializeProviders(config: ProviderRegistryConfig) {
    const providerClasses: Record<
      ProviderName,
      new (config: ProviderConfig) => BaseProvider
    > = {
      musicbrainz: MusicBrainzProvider,
      discogs: DiscogsProvider,
      deezer: DeezerProvider,
      spotify: SpotifyProvider,
      soundcloud: SoundCloudProvider,
    };

    for (const [name, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig?.enabled) {
        const ProviderClass = providerClasses[name as ProviderName];
        if (ProviderClass) {
          this.providers.set(name, new ProviderClass(providerConfig));
        }
      }
    }
  }

  get(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  getEnabled(): BaseProvider[] {
    return this.getAll().filter((p) => this.providers.has(p.name));
  }

  getDefaults(): BaseProvider[] {
    return this.defaultProviders
      .map((name) => this.providers.get(name))
      .filter((p): p is BaseProvider => p !== undefined);
  }

  getByPriority(): BaseProvider[] {
    return this.getEnabled().sort((a, b) => b.priority - a.priority);
  }

  findByUrl(url: string): BaseProvider | undefined {
    return this.getEnabled().find((p) => p.canHandleUrl(url));
  }

  // Register a custom provider at runtime
  register(provider: BaseProvider): void {
    this.providers.set(provider.name, provider);
  }
}

// Re-export
export { BaseProvider, ProviderConfig } from './base.provider';
export { MusicBrainzProvider } from './musicbrainz.provider';
export { DiscogsProvider } from './discogs.provider';
export { DeezerProvider } from './deezer.provider';
export { SpotifyProvider } from './spotify.provider';
export { SoundCloudProvider } from './soundcloud.provider';
```

### MusicBrainz Provider (Reference Implementation)

```typescript
// src/providers/musicbrainz.provider.ts
import { BaseProvider, ProviderConfig, LookupOptions } from './base.provider';
import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
} from '../types';

const MB_API = 'https://musicbrainz.org/ws/2';

interface MusicBrainzConfig extends ProviderConfig {
  appName: string;
  appVersion: string;
  contact: string;
}

export class MusicBrainzProvider extends BaseProvider {
  readonly name = 'musicbrainz';
  readonly displayName = 'MusicBrainz';
  readonly priority = 100;

  private userAgent: string;

  constructor(config: MusicBrainzConfig) {
    super(config);
    const mbConfig = config as MusicBrainzConfig;
    this.userAgent = `${mbConfig.appName}/${mbConfig.appVersion} (${mbConfig.contact})`;
  }

  canHandleUrl(url: string): boolean {
    return /musicbrainz\.org/.test(url);
  }

  parseUrl(
    url: string
  ): { type: 'release' | 'artist' | 'track'; id: string } | null {
    const patterns: Record<string, RegExp> = {
      release: /musicbrainz\.org\/release\/([a-f0-9-]{36})/,
      artist: /musicbrainz\.org\/artist\/([a-f0-9-]{36})/,
      track: /musicbrainz\.org\/recording\/([a-f0-9-]{36})/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match) return { type: type as any, id: match[1] };
    }
    return null;
  }

  protected async _lookupReleaseByGtin(
    gtin: string
  ): Promise<HarmonizedRelease | null> {
    const url = `${MB_API}/release?query=barcode:${gtin}&fmt=json`;
    const data = await this.fetch(url);

    if (!data.releases?.length) return null;
    return this._lookupReleaseById(data.releases[0].id);
  }

  protected async _lookupReleaseById(
    id: string,
    options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    const inc = 'artist-credits+labels+recordings+release-groups+genres';
    const url = `${MB_API}/release/${id}?inc=${inc}&fmt=json`;

    const data = await this.fetch(url);
    if (!data) return null;

    return this.transformRelease(data);
  }

  protected async _lookupReleaseByUrl(
    url: string
  ): Promise<HarmonizedRelease | null> {
    const parsed = this.parseUrl(url);
    if (!parsed || parsed.type !== 'release') return null;
    return this._lookupReleaseById(parsed.id);
  }

  protected async _lookupTrackByIsrc(
    isrc: string
  ): Promise<HarmonizedTrack | null> {
    const url = `${MB_API}/isrc/${isrc}?inc=artist-credits&fmt=json`;
    const data = await this.fetch(url);

    if (!data?.recordings?.length) return null;
    return this.transformTrack(data.recordings[0], 1);
  }

  protected async _lookupArtistById(
    id: string
  ): Promise<HarmonizedArtist | null> {
    const url = `${MB_API}/artist/${id}?inc=aliases+genres&fmt=json`;
    const data = await this.fetch(url);

    if (!data) return null;
    return this.transformArtist(data);
  }

  protected async _searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    const url = `${MB_API}/release?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`;
    const data = await this.fetch(url);

    return (data.releases || []).map((r: any) => this.transformRelease(r));
  }

  protected async _searchArtists(
    query: string,
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    const url = `${MB_API}/artist?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`;
    const data = await this.fetch(url);

    return (data.artists || []).map((a: any) => this.transformArtist(a));
  }

  private async fetch(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    return response.json();
  }

  private transformRelease(raw: any): HarmonizedRelease {
    const tracks = (raw.media || []).flatMap((m: any, mi: number) =>
      (m.tracks || []).map((t: any, ti: number) =>
        this.transformTrack(t.recording || t, ti + 1, mi + 1)
      )
    );

    return {
      gtin: raw.barcode || undefined,
      title: raw.title,
      titleNormalized: this.normalizeString(raw.title),
      disambiguation: raw.disambiguation,

      artists: (raw['artist-credit'] || []).map(this.transformArtistCredit),

      releaseDate: this.parseDate(raw.date),
      releaseType: this.mapReleaseType(raw['release-group']?.['primary-type']),
      status: raw.status?.toLowerCase(),

      labels: (raw['label-info'] || [])
        .filter((li: any) => li.label?.name)
        .map((li: any) => ({
          name: li.label.name,
          catalogNumber: li['catalog-number'],
        })),

      releaseCountry: raw.country,

      media: (raw.media || []).map((m: any, i: number) => ({
        format: m.format,
        position: i + 1,
        tracks: (m.tracks || []).map((t: any, ti: number) =>
          this.transformTrack(t.recording || t, ti + 1, i + 1)
        ),
      })),

      genres: (raw.genres || []).map((g: any) => g.name),

      externalIds: { musicbrainz: raw.id },
      sources: [
        this.createSource(raw.id, `https://musicbrainz.org/release/${raw.id}`),
      ],

      mergedAt: new Date(),
      confidence: 1.0,
    };
  }

  private transformTrack(
    raw: any,
    position: number,
    discNumber?: number
  ): HarmonizedTrack {
    return {
      isrc: raw.isrcs?.[0],
      title: raw.title,
      titleNormalized: this.normalizeString(raw.title),
      position,
      discNumber,
      duration: raw.length,
      artists: (raw['artist-credit'] || []).map(this.transformArtistCredit),
      externalIds: { musicbrainz: raw.id },
      sources: [
        this.createSource(
          raw.id,
          `https://musicbrainz.org/recording/${raw.id}`
        ),
      ],
    };
  }

  private transformArtist(raw: any): HarmonizedArtist {
    return {
      name: raw.name,
      nameNormalized: this.normalizeString(raw.name),
      sortName: raw['sort-name'],
      disambiguation: raw.disambiguation,
      type: raw.type?.toLowerCase(),
      country: raw.country,
      beginDate: this.parseDate(raw['life-span']?.begin),
      endDate: this.parseDate(raw['life-span']?.end),
      aliases: (raw.aliases || []).map((a: any) => a.name),
      genres: (raw.genres || []).map((g: any) => g.name),
      externalIds: { musicbrainz: raw.id },
      sources: [
        this.createSource(raw.id, `https://musicbrainz.org/artist/${raw.id}`),
      ],
      mergedAt: new Date(),
      confidence: 1.0,
    };
  }

  private transformArtistCredit = (ac: any) => ({
    name: ac.artist?.name || ac.name,
    creditedName: ac.name !== ac.artist?.name ? ac.name : undefined,
    joinPhrase: ac.joinphrase,
    externalIds: ac.artist?.id ? { musicbrainz: ac.artist.id } : {},
  });

  private parseDate(dateStr?: string) {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    return {
      year: year || undefined,
      month: month || undefined,
      day: day || undefined,
    };
  }

  private mapReleaseType(type?: string): HarmonizedRelease['releaseType'] {
    const map: Record<string, HarmonizedRelease['releaseType']> = {
      Album: 'album',
      Single: 'single',
      EP: 'ep',
      Compilation: 'compilation',
      Soundtrack: 'soundtrack',
      Live: 'live',
      Remix: 'remix',
    };
    return map[type || ''] || 'other';
  }
}
```

### Adding New Providers

To add a new provider (e.g., Spotify, SoundCloud):

```typescript
// src/providers/spotify.provider.ts
import { BaseProvider, ProviderConfig, LookupOptions } from './base.provider';
import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
} from '../types';

interface SpotifyConfig extends ProviderConfig {
  clientId: string;
  clientSecret: string;
}

export class SpotifyProvider extends BaseProvider {
  readonly name = 'spotify';
  readonly displayName = 'Spotify';
  readonly priority = 70;

  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(config: SpotifyConfig) {
    super(config);
  }

  canHandleUrl(url: string): boolean {
    return /open\.spotify\.com/.test(url) || /spotify:/.test(url);
  }

  parseUrl(
    url: string
  ): { type: 'release' | 'artist' | 'track'; id: string } | null {
    // Handle both URLs and URIs
    const patterns = {
      release: /(?:album[:/])([a-zA-Z0-9]+)/,
      track: /(?:track[:/])([a-zA-Z0-9]+)/,
      artist: /(?:artist[:/])([a-zA-Z0-9]+)/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match) return { type: type as any, id: match[1] };
    }
    return null;
  }

  // Implement token management
  private async getAccessToken(): Promise<string> {
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date()
    ) {
      return this.accessToken;
    }

    const config = this.config as SpotifyConfig;
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);

    return this.accessToken;
  }

  protected async _lookupReleaseByGtin(
    gtin: string
  ): Promise<HarmonizedRelease | null> {
    // Spotify doesn't support UPC lookup directly via public API
    // Would need to search by album name or use undocumented endpoints
    return null;
  }

  protected async _lookupReleaseById(
    id: string
  ): Promise<HarmonizedRelease | null> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    const data = await response.json();

    return this.transformRelease(data);
  }

  protected async _lookupReleaseByUrl(
    url: string
  ): Promise<HarmonizedRelease | null> {
    const parsed = this.parseUrl(url);
    if (!parsed || parsed.type !== 'release') return null;
    return this._lookupReleaseById(parsed.id);
  }

  protected async _lookupTrackByIsrc(
    isrc: string
  ): Promise<HarmonizedTrack | null> {
    const token = await this.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=isrc:${isrc}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return null;
    const data = await response.json();

    if (!data.tracks?.items?.length) return null;
    return this.transformTrack(data.tracks.items[0], 1);
  }

  protected async _lookupArtistById(
    id: string
  ): Promise<HarmonizedArtist | null> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    return this.transformArtist(await response.json());
  }

  protected async _searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    const token = await this.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    return (data.albums?.items || []).map((a: any) => this.transformRelease(a));
  }

  protected async _searchArtists(
    query: string,
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    const token = await this.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    return (data.artists?.items || []).map((a: any) => this.transformArtist(a));
  }

  private transformRelease(raw: any): HarmonizedRelease {
    return {
      gtin: raw.external_ids?.upc,
      title: raw.name,
      titleNormalized: this.normalizeString(raw.name),

      artists: raw.artists.map((a: any) => ({
        name: a.name,
        externalIds: { spotify: a.id },
      })),

      releaseDate: this.parseSpotifyDate(
        raw.release_date,
        raw.release_date_precision
      ),
      releaseType: this.mapAlbumType(raw.album_type),

      media: [
        {
          position: 1,
          tracks: (raw.tracks?.items || []).map((t: any, i: number) =>
            this.transformTrack(t, i + 1)
          ),
        },
      ],

      artwork: raw.images?.map((img: any) => ({
        url: img.url,
        type: 'front' as const,
        width: img.width,
        height: img.height,
        provider: 'spotify',
      })),

      genres: raw.genres || [],

      externalIds: { spotify: raw.id },
      sources: [this.createSource(raw.id, raw.external_urls?.spotify)],

      mergedAt: new Date(),
      confidence: 0.9,
    };
  }

  private transformTrack(raw: any, position: number): HarmonizedTrack {
    return {
      isrc: raw.external_ids?.isrc,
      title: raw.name,
      titleNormalized: this.normalizeString(raw.name),
      position,
      duration: raw.duration_ms,
      explicit: raw.explicit,
      artists: raw.artists.map((a: any) => ({
        name: a.name,
        externalIds: { spotify: a.id },
      })),
      externalIds: { spotify: raw.id },
      sources: [this.createSource(raw.id, raw.external_urls?.spotify)],
    };
  }

  private transformArtist(raw: any): HarmonizedArtist {
    return {
      name: raw.name,
      nameNormalized: this.normalizeString(raw.name),
      genres: raw.genres || [],
      externalIds: { spotify: raw.id },
      sources: [this.createSource(raw.id, raw.external_urls?.spotify)],
      mergedAt: new Date(),
      confidence: 0.9,
    };
  }

  private parseSpotifyDate(date: string, precision: string) {
    if (!date) return undefined;
    const parts = date.split('-').map(Number);
    return {
      year: parts[0],
      month: precision !== 'year' ? parts[1] : undefined,
      day: precision === 'day' ? parts[2] : undefined,
    };
  }

  private mapAlbumType(type: string): HarmonizedRelease['releaseType'] {
    const map: Record<string, HarmonizedRelease['releaseType']> = {
      album: 'album',
      single: 'single',
      compilation: 'compilation',
    };
    return map[type] || 'other';
  }
}
```

### Provider Template

```typescript
// src/providers/template.provider.ts
// Copy this template to create new providers

import { BaseProvider, ProviderConfig, LookupOptions } from './base.provider';
import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
} from '../types';

interface MyProviderConfig extends ProviderConfig {
  apiKey?: string;
  // Add provider-specific config
}

export class MyProvider extends BaseProvider {
  readonly name = 'myprovider'; // Unique identifier
  readonly displayName = 'My Provider'; // Human-readable name
  readonly priority = 50; // 0-100, higher = preferred

  constructor(config: MyProviderConfig) {
    super(config);
    // Initialize provider-specific state
  }

  canHandleUrl(url: string): boolean {
    return /myprovider\.com/.test(url);
  }

  parseUrl(
    url: string
  ): { type: 'release' | 'artist' | 'track'; id: string } | null {
    // Parse provider URLs to extract type and ID
    return null;
  }

  protected async _lookupReleaseByGtin(
    gtin: string
  ): Promise<HarmonizedRelease | null> {
    // Implement GTIN/UPC lookup
    throw new Error('Not implemented');
  }

  protected async _lookupReleaseById(
    id: string
  ): Promise<HarmonizedRelease | null> {
    // Implement ID-based lookup
    throw new Error('Not implemented');
  }

  protected async _lookupReleaseByUrl(
    url: string
  ): Promise<HarmonizedRelease | null> {
    const parsed = this.parseUrl(url);
    if (!parsed || parsed.type !== 'release') return null;
    return this._lookupReleaseById(parsed.id);
  }

  protected async _lookupTrackByIsrc(
    isrc: string
  ): Promise<HarmonizedTrack | null> {
    // Implement ISRC lookup
    throw new Error('Not implemented');
  }

  protected async _lookupArtistById(
    id: string
  ): Promise<HarmonizedArtist | null> {
    // Implement artist lookup
    throw new Error('Not implemented');
  }

  protected async _searchReleases(
    query: string,
    limit?: number
  ): Promise<HarmonizedRelease[]> {
    // Implement search
    return [];
  }

  protected async _searchArtists(
    query: string,
    limit?: number
  ): Promise<HarmonizedArtist[]> {
    return [];
  }

  // Add private transformation methods
  // private transformRelease(raw: any): HarmonizedRelease { ... }
  // private transformTrack(raw: any): HarmonizedTrack { ... }
  // private transformArtist(raw: any): HarmonizedArtist { ... }
}
```

---

## Lookup Coordinator

```typescript
// src/lookup/coordinator.ts
import { PrismaClient } from '@prisma/client';
import type { BaseProvider } from '../providers/base.provider';
import type { ProviderRegistry } from '../providers';
import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
} from '../types';
import { ReleaseMerger, ArtistMerger } from '../harmonizer/merger';
import { SnapshotCache } from '../cache/snapshot';
import { Logger } from '../utils/logger';

export interface LookupRequest {
  type: 'gtin' | 'isrc' | 'url' | 'search';
  value: string;
  providers?: string[];
  merge?: boolean;
  bypassCache?: boolean;
}

export interface LookupResult<T> {
  data: T | null;
  sources: string[];
  cached: boolean;
  timestamp: Date;
  errors?: Array<{ provider: string; error: string }>;
}

export class LookupCoordinator {
  private logger = new Logger('lookup-coordinator');
  private releaseMerger: ReleaseMerger;
  private artistMerger: ArtistMerger;

  constructor(
    private registry: ProviderRegistry,
    private cache: SnapshotCache,
    private prisma: PrismaClient
  ) {
    this.releaseMerger = new ReleaseMerger();
    this.artistMerger = new ArtistMerger();
  }

  async lookupRelease(
    request: LookupRequest
  ): Promise<LookupResult<HarmonizedRelease>> {
    const cacheKey = `release:${request.type}:${request.value}`;

    // Check cache
    if (!request.bypassCache) {
      const cached = await this.cache.get<HarmonizedRelease>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { key: cacheKey });
        return {
          data: cached,
          sources: [],
          cached: true,
          timestamp: new Date(),
        };
      }
    }

    const providers = this.getTargetProviders(request.providers);
    const errors: Array<{ provider: string; error: string }> = [];

    // Parallel lookup
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          switch (request.type) {
            case 'gtin':
              return await provider.lookupReleaseByGtin(request.value);
            case 'url':
              return await provider.lookupReleaseByUrl(request.value);
            default:
              return null;
          }
        } catch (error) {
          errors.push({
            provider: provider.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return null;
        }
      })
    );

    const releases = results
      .filter(
        (r): r is PromiseFulfilledResult<HarmonizedRelease | null> =>
          r.status === 'fulfilled'
      )
      .map((r) => r.value)
      .filter((r): r is HarmonizedRelease => r !== null);

    if (releases.length === 0) {
      return {
        data: null,
        sources: [],
        cached: false,
        timestamp: new Date(),
        errors,
      };
    }

    // Merge if multiple results
    const merged =
      request.merge !== false && releases.length > 1
        ? this.releaseMerger.merge(releases)
        : releases[0];

    // Cache and persist
    await this.cache.set(cacheKey, merged);
    await this.persistRelease(merged);

    return {
      data: merged,
      sources: merged.sources.map((s) => s.provider),
      cached: false,
      timestamp: new Date(),
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async lookupTrack(
    isrc: string,
    providers?: string[]
  ): Promise<LookupResult<HarmonizedTrack>> {
    const cacheKey = `track:isrc:${isrc}`;

    const cached = await this.cache.get<HarmonizedTrack>(cacheKey);
    if (cached) {
      return { data: cached, sources: [], cached: true, timestamp: new Date() };
    }

    const targetProviders = this.getTargetProviders(providers);

    for (const provider of targetProviders) {
      try {
        const track = await provider.lookupTrackByIsrc(isrc);
        if (track) {
          await this.cache.set(cacheKey, track);
          await this.persistTrack(track);
          return {
            data: track,
            sources: [provider.name],
            cached: false,
            timestamp: new Date(),
          };
        }
      } catch (error) {
        this.logger.warn('Provider lookup failed', {
          provider: provider.name,
          isrc,
          error,
        });
      }
    }

    return { data: null, sources: [], cached: false, timestamp: new Date() };
  }

  async searchReleases(
    query: string,
    providers?: string[],
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    const targetProviders = this.getTargetProviders(providers);

    const results = await Promise.allSettled(
      targetProviders.map((p) => p.searchReleases(query, limit))
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<HarmonizedRelease[]> =>
          r.status === 'fulfilled'
      )
      .flatMap((r) => r.value);
  }

  private getTargetProviders(names?: string[]): BaseProvider[] {
    if (names?.length) {
      return names
        .map((n) => this.registry.get(n))
        .filter((p): p is BaseProvider => p !== undefined);
    }
    return this.registry.getByPriority();
  }

  private async persistRelease(release: HarmonizedRelease): Promise<void> {
    await this.prisma.harmonizedRelease.upsert({
      where: { gtin: release.gtin || '' },
      create: {
        gtin: release.gtin,
        title: release.title,
        titleNormalized: release.titleNormalized || '',
        releaseDate: release.releaseDate
          ? `${release.releaseDate.year}-${release.releaseDate.month || '01'}-${release.releaseDate.day || '01'}`
          : null,
        releaseType: release.releaseType,
        artists: release.artists as any,
        media: release.media as any,
        labels: release.labels as any,
        artwork: release.artwork as any,
        genres: release.genres || [],
        externalIds: release.externalIds as any,
        sources: release.sources as any,
        confidence: release.confidence,
      },
      update: {
        title: release.title,
        artists: release.artists as any,
        media: release.media as any,
        externalIds: release.externalIds as any,
        sources: release.sources as any,
        confidence: release.confidence,
        updatedAt: new Date(),
      },
    });
  }

  private async persistTrack(track: HarmonizedTrack): Promise<void> {
    if (!track.isrc) return;

    await this.prisma.harmonizedTrack.upsert({
      where: { isrc: track.isrc },
      create: {
        isrc: track.isrc,
        title: track.title,
        titleNormalized: track.titleNormalized || '',
        duration: track.duration,
        position: track.position,
        artists: track.artists as any,
        externalIds: track.externalIds as any,
        sources: track.sources as any,
        confidence: 1.0,
      },
      update: {
        title: track.title,
        artists: track.artists as any,
        externalIds: track.externalIds as any,
        sources: track.sources as any,
        updatedAt: new Date(),
      },
    });
  }
}
```

---

## Rate Limiting

```typescript
// src/utils/rate-limiter.ts
import { Redis } from 'ioredis';

export interface RateLimiterConfig {
  redis?: Redis;
  useMemory?: boolean;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private redis?: Redis;

  constructor(
    private readonly name: string,
    private readonly maxTokens: number,
    private readonly windowMs: number,
    config?: RateLimiterConfig
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.redis = config?.redis;
  }

  async acquire(): Promise<void> {
    if (this.redis) {
      return this.acquireDistributed();
    }
    return this.acquireLocal();
  }

  private async acquireLocal(): Promise<void> {
    this.refill();

    if (this.tokens <= 0) {
      const waitTime = this.windowMs - (Date.now() - this.lastRefill);
      await this.sleep(waitTime);
      this.tokens = this.maxTokens;
      this.lastRefill = Date.now();
    }

    this.tokens--;
  }

  private async acquireDistributed(): Promise<void> {
    const key = `ratelimit:${this.name}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Use Redis sorted set for sliding window
    const multi = this.redis!.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zcard(key);
    multi.zadd(key, now.toString(), `${now}-${Math.random()}`);
    multi.expire(key, Math.ceil(this.windowMs / 1000));

    const results = await multi.exec();
    const count = (results?.[1]?.[1] as number) || 0;

    if (count >= this.maxTokens) {
      // Get oldest entry to calculate wait time
      const oldest = await this.redis!.zrange(key, 0, 0, 'WITHSCORES');
      if (oldest.length >= 2) {
        const oldestTime = parseInt(oldest[1], 10);
        const waitTime = oldestTime + this.windowMs - now;
        if (waitTime > 0) {
          await this.sleep(waitTime);
        }
      }
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const refillCount = Math.floor(elapsed / this.windowMs) * this.maxTokens;

    if (refillCount > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + refillCount);
      this.lastRefill = now;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
  }

  // For monitoring
  getStatus(): { tokens: number; maxTokens: number; windowMs: number } {
    this.refill();
    return {
      tokens: this.tokens,
      maxTokens: this.maxTokens,
      windowMs: this.windowMs,
    };
  }
}
```

---

## Error Handling & Retries

```typescript
// src/utils/retry.ts
import pRetry, { AbortError } from 'p-retry';
import { Logger } from './logger';

export interface RetryConfig {
  retries: number;
  minTimeout: number;
  maxTimeout: number;
  factor: number;
  retryableStatusCodes?: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 10000,
  factor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  logger?: Logger
): Promise<T> {
  return pRetry(
    async (attemptCount) => {
      try {
        return await fn();
      } catch (error) {
        // Don't retry client errors (4xx except rate limits)
        if (error instanceof HttpError) {
          if (!config.retryableStatusCodes?.includes(error.status)) {
            throw new AbortError(error.message);
          }
        }

        logger?.warn('Retry attempt', {
          attempt: attemptCount,
          error: error instanceof Error ? error.message : 'Unknown',
        });

        throw error;
      }
    },
    {
      retries: config.retries,
      minTimeout: config.minTimeout,
      maxTimeout: config.maxTimeout,
      factor: config.factor,
      onFailedAttempt: (error) => {
        logger?.warn('Attempt failed', {
          attempt: error.attemptNumber,
          retriesLeft: error.retriesLeft,
          error: error.message,
        });
      },
    }
  );
}

// src/errors/index.ts
export class HarmonizationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'HarmonizationError';
  }
}

export class HttpError extends HarmonizationError {
  constructor(
    message: string,
    public readonly status: number,
    provider?: string
  ) {
    super(message, `HTTP_${status}`, provider);
    this.name = 'HttpError';
  }
}

export class RateLimitError extends HarmonizationError {
  constructor(
    provider: string,
    public readonly retryAfter?: number
  ) {
    super(`Rate limited by ${provider}`, 'RATE_LIMITED', provider);
    this.name = 'RateLimitError';
  }
}

export class ProviderNotFoundError extends HarmonizationError {
  constructor(provider: string) {
    super(`Provider not found: ${provider}`, 'PROVIDER_NOT_FOUND');
    this.name = 'ProviderNotFoundError';
  }
}

export class ValidationError extends HarmonizationError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

---

## Logging & Monitoring

```typescript
// src/utils/logger.ts
import pino from 'pino';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
}

const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export class Logger {
  private logger: pino.Logger;

  constructor(namespace: string) {
    this.logger = baseLogger.child({ namespace });
  }

  trace(message: string, context?: LogContext): void {
    this.logger.trace(context, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context, message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context, message);
  }

  error(
    message: string,
    error?: Error | LogContext,
    context?: LogContext
  ): void {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...context }, message);
    } else {
      this.logger.error(error, message);
    }
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.logger.fatal({ err: error, ...context }, message);
  }

  child(context: LogContext): Logger {
    const child = new Logger('');
    child.logger = this.logger.child(context);
    return child;
  }
}

// src/utils/metrics.ts
export interface Metrics {
  lookupCount: number;
  cacheHits: number;
  cacheMisses: number;
  providerErrors: Record<string, number>;
  avgLookupTime: number;
  lookupTimes: number[];
}

export class MetricsCollector {
  private metrics: Metrics = {
    lookupCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    providerErrors: {},
    avgLookupTime: 0,
    lookupTimes: [],
  };

  recordLookup(durationMs: number, cached: boolean): void {
    this.metrics.lookupCount++;
    cached ? this.metrics.cacheHits++ : this.metrics.cacheMisses++;

    this.metrics.lookupTimes.push(durationMs);
    if (this.metrics.lookupTimes.length > 1000) {
      this.metrics.lookupTimes.shift();
    }

    this.metrics.avgLookupTime =
      this.metrics.lookupTimes.reduce((a, b) => a + b, 0) /
      this.metrics.lookupTimes.length;
  }

  recordProviderError(provider: string): void {
    this.metrics.providerErrors[provider] =
      (this.metrics.providerErrors[provider] || 0) + 1;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  reset(): void {
    this.metrics = {
      lookupCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      providerErrors: {},
      avgLookupTime: 0,
      lookupTimes: [],
    };
  }
}

// Export singleton
export const metrics = new MetricsCollector();
```

---

## Public API & Next.js Integration

```typescript
// src/index.ts
export { HarmonizationEngine, type HarmonizationConfig } from './engine';
export { ProviderRegistry, type ProviderRegistryConfig } from './providers';
export {
  BaseProvider,
  type ProviderConfig,
  type LookupOptions,
} from './providers/base.provider';
export {
  LookupCoordinator,
  type LookupRequest,
  type LookupResult,
} from './lookup/coordinator';
export { ReleaseMerger, ArtistMerger } from './harmonizer/merger';
export { SnapshotCache } from './cache/snapshot';
export { Logger } from './utils/logger';
export { metrics, MetricsCollector } from './utils/metrics';
export * from './types';
export * from './errors';

// Convenience factory
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { ProviderRegistry, ProviderRegistryConfig } from './providers';
import { LookupCoordinator } from './lookup/coordinator';
import { SnapshotCache } from './cache/snapshot';

export interface HarmonizationConfig {
  providers: ProviderRegistryConfig;
  redis: Redis;
  prisma: PrismaClient;
}

export class HarmonizationEngine {
  public readonly registry: ProviderRegistry;
  public readonly coordinator: LookupCoordinator;
  public readonly cache: SnapshotCache;

  constructor(config: HarmonizationConfig) {
    this.registry = new ProviderRegistry(config.providers);
    this.cache = new SnapshotCache(config.redis);
    this.coordinator = new LookupCoordinator(
      this.registry,
      this.cache,
      config.prisma
    );
  }

  // Convenience methods
  async lookupByGtin(gtin: string) {
    return this.coordinator.lookupRelease({ type: 'gtin', value: gtin });
  }

  async lookupByIsrc(isrc: string) {
    return this.coordinator.lookupTrack(isrc);
  }

  async lookupByUrl(url: string) {
    return this.coordinator.lookupRelease({ type: 'url', value: url });
  }

  async search(query: string, limit = 25) {
    return this.coordinator.searchReleases(query, undefined, limit);
  }
}
```

### Next.js API Route Example

```typescript
// apps/web/app/api/harmonize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HarmonizationEngine } from '@your-org/harmony-engine';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

// Initialize once
let engine: HarmonizationEngine | null = null;

function getEngine() {
  if (!engine) {
    engine = new HarmonizationEngine({
      providers: {
        providers: {
          musicbrainz: {
            enabled: true,
            priority: 100,
            rateLimit: { requests: 1, windowMs: 1000 },
            cache: { ttlSeconds: 86400 },
            retry: {
              retries: 3,
              minTimeout: 1000,
              maxTimeout: 10000,
              factor: 2,
            },
            appName: 'MyApp',
            appVersion: '1.0.0',
            contact: 'dev@example.com',
          },
          spotify: {
            enabled: !!process.env.SPOTIFY_CLIENT_ID,
            priority: 70,
            rateLimit: { requests: 10, windowMs: 1000 },
            cache: { ttlSeconds: 3600 },
            retry: { retries: 3, minTimeout: 500, maxTimeout: 5000, factor: 2 },
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
          },
        },
        defaultProviders: ['musicbrainz', 'spotify'],
      },
      redis,
      prisma,
    });
  }
  return engine;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gtin = searchParams.get('gtin');
  const isrc = searchParams.get('isrc');
  const url = searchParams.get('url');
  const query = searchParams.get('q');

  const engine = getEngine();

  try {
    if (gtin) {
      const result = await engine.lookupByGtin(gtin);
      return NextResponse.json(result);
    }

    if (isrc) {
      const result = await engine.lookupByIsrc(isrc);
      return NextResponse.json(result);
    }

    if (url) {
      const result = await engine.lookupByUrl(url);
      return NextResponse.json(result);
    }

    if (query) {
      const results = await engine.search(query);
      return NextResponse.json({ data: results });
    }

    return NextResponse.json(
      { error: 'Provide gtin, isrc, url, or q parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Harmonization error:', error);
    return NextResponse.json(
      { error: 'Harmonization failed' },
      { status: 500 }
    );
  }
}
```

---

## Environment Variables

```bash
# .env.example

# Logging
LOG_LEVEL=info  # trace, debug, info, warn, error

# Redis (for caching and rate limiting)
REDIS_URL=redis://localhost:6379

# MusicBrainz (required)
MUSICBRAINZ_APP_NAME=YourApp
MUSICBRAINZ_APP_VERSION=1.0.0
MUSICBRAINZ_CONTACT=dev@example.com

# Discogs (optional)
DISCOGS_USER_TOKEN=

# Spotify (optional)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# Deezer (no auth required)

# SoundCloud (optional)
SOUNDCLOUD_CLIENT_ID=
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure

- [ ] Package setup (tsconfig, package.json)
- [ ] Prisma schema integration
- [ ] Base provider abstract class
- [ ] Provider registry
- [ ] Rate limiter (local + Redis)
- [ ] Retry utility
- [ ] Logger setup

### Phase 2: Providers

- [ ] MusicBrainz provider (reference)
- [ ] Discogs provider
- [ ] Deezer provider
- [ ] Spotify provider
- [ ] Provider template documentation

### Phase 3: Harmonization

- [ ] String normalizer
- [ ] Merge algorithm
- [ ] Confidence scorer
- [ ] Snapshot cache

### Phase 4: Integration

- [ ] Lookup coordinator
- [ ] Public API exports
- [ ] Next.js API route example
- [ ] Tests (unit + integration)

### Phase 5: Polish

- [ ] Metrics collection
- [ ] Error handling refinement
- [ ] Documentation
- [ ] Type exports for consumers
