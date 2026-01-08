import type { Redis } from 'ioredis';

// Re-export everything
export {
  CreditsEnricher,
  type CreditsEnricherConfig,
  type EnrichedTrack,
  type EnrichedRelease,
} from './enricher';

export {
  CreditsProviderRegistry,
  BaseCreditsProvider,
  MusoProvider,
  DEFAULT_MUSO_CONFIG,
  type CreditsProviderName,
  type CreditsProviderRegistryConfig,
  type CreditsProviderConfig,
  type MusoProviderConfig,
  type EnrichmentOptions,
} from './providers/index';

export { CreditsCache, type CreditsCacheConfig } from './cache/index';

export * from './types/index';

export {
  prepareIsrc,
  calculateSimilarity,
  titlesMatch,
  artistsMatch,
  extractPrimaryArtist,
  buildSearchQuery,
} from './utils/index';

// Convenience type for Redis (re-exported from ioredis)
export type { Redis };
