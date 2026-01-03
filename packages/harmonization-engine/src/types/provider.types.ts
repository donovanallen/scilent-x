import type { RetryConfig } from '../utils/retry';

export interface ProviderRateLimitConfig {
  requests: number;
  windowMs: number;
}

export interface ProviderCacheConfig {
  ttlSeconds: number;
  staleWhileRevalidateSeconds?: number;
}

export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  rateLimit: ProviderRateLimitConfig;
  cache: ProviderCacheConfig;
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

export interface ParsedUrl {
  type: 'release' | 'artist' | 'track';
  id: string;
}
