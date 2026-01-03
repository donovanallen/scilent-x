// apps/web/src/app/(authenticated)/(admin)/harmonization/actions.ts
'use server';

import { isValidGtin, isValidIsrc } from '@scilent-one/harmonization-engine';

import { getHarmonizationEngine } from '@/lib/harmonization';

export async function lookupByGtin(gtin: string) {
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

export async function lookupByIsrc(isrc: string) {
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

export async function searchReleases(query: string, limit = 10) {
  const engine = getHarmonizationEngine();
  try {
    const result = await engine.search(query, limit);
    return { error: null, data: result };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null,
    };
  }
}

export async function getEngineStatus() {
  const engine = getHarmonizationEngine();
  const providers = engine.getEnabledProviders();
  return {
    enabledProviders: providers.map((p) => ({
      name: p.name,
      displayName: p.displayName,
      priority: p.priority,
    })),
  };
}
