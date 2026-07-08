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

  const engine = await getHarmonizationEngine();
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

  const engine = await getHarmonizationEngine();
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

export interface UrlLookupResult {
  release: LookupResult<HarmonizedRelease> | null;
  track: LookupResult<HarmonizedTrack> | null;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function lookupByUrl(url: string): Promise<{
  error: string | null;
  data: UrlLookupResult | null;
}> {
  const trimmed = url.trim();
  if (!isValidUrl(trimmed)) {
    return { error: 'Invalid URL format', data: null };
  }

  const engine = await getHarmonizationEngine();
  try {
    // A provider URL can point at either a release or a track, so resolve both
    // in parallel and surface whichever the providers recognize.
    const [releaseResult, trackResult] = await Promise.allSettled([
      engine.lookupByUrl(trimmed),
      engine.lookupTrackByUrl(trimmed),
    ]);

    return {
      error: null,
      data: {
        release:
          releaseResult.status === 'fulfilled' ? releaseResult.value : null,
        track: trackResult.status === 'fulfilled' ? trackResult.value : null,
      },
    };
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
  const engine = await getHarmonizationEngine();
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
  const engine = await getHarmonizationEngine();
  const providers = engine.getEnabledProviders();

  return {
    enabledProviders: providers.map((p): ProviderStatus => ({
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
    })),
  };
}
