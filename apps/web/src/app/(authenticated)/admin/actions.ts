'use server';

import {
  isValidGtin,
  isValidIsrc,
  type LookupResult,
  type HarmonizedRelease,
  type HarmonizedTrack,
} from '@scilent-one/harmony-engine';

import { getHarmonizationEngine } from '@/lib/harmonization';

export async function lookupByGtin(gtin: string): Promise<{
  error: string | null;
  data: LookupResult<HarmonizedRelease> | null;
}> {
  if (!isValidGtin(gtin)) {
    return { error: 'Invalid GTIN format', data: null };
  }

  const engine = getHarmonizationEngine();
  try {
    const result = await engine.lookupByGtin(gtin);
    return { error: null, data: result };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null,
    };
  }
}

export async function lookupByIsrc(isrc: string): Promise<{
  error: string | null;
  data: LookupResult<HarmonizedTrack> | null;
}> {
  if (!isValidIsrc(isrc)) {
    return { error: 'Invalid ISRC format', data: null };
  }

  const engine = getHarmonizationEngine();
  try {
    const result = await engine.lookupByIsrc(isrc);
    return { error: null, data: result };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null,
    };
  }
}

export async function searchReleases(
  query: string,
  limit = 10
): Promise<{
  error: string | null;
  data: HarmonizedRelease[] | null;
}> {
  const engine = getHarmonizationEngine();
  try {
    const result = await engine.search(query, undefined, limit);
    return { error: null, data: result };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null,
    };
  }
}

export interface ProviderCapabilities {
  /** Supports user-authenticated API calls (e.g., /users/me) */
  userAuth: boolean;
  /** Supports release lookup by GTIN/UPC */
  releaseLookup: boolean;
  /** Supports track lookup by ISRC */
  trackLookup: boolean;
  /** Supports artist lookup */
  artistLookup: boolean;
  /** Supports search functionality */
  search: boolean;
}

export interface ProviderStatus {
  name: string;
  displayName: string;
  priority: number;
  capabilities: ProviderCapabilities;
}

export async function getEngineStatus() {
  const engine = getHarmonizationEngine();
  const providers = engine.getEnabledProviders();

  return {
    enabledProviders: providers.map(
      (p): ProviderStatus => ({
        name: p.name,
        displayName: p.displayName,
        priority: p.priority,
        capabilities: {
          userAuth: p.supportsUserAuth,
          // All providers support these core features when enabled
          releaseLookup: true,
          trackLookup: true,
          artistLookup: true,
          search: true,
        },
      })
    ),
  };
}
