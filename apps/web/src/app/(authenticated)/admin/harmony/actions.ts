'use server';

import { db } from '@scilent-one/db';
import { revalidatePath } from 'next/cache';

import {
  resetEngine,
  getProvidersWithCredentials,
  type ProviderDbSetting,
} from '@/lib/harmonization';

/**
 * List of known/supported provider names.
 * Used for validation to prevent arbitrary provider names in the database.
 */
const SUPPORTED_PROVIDERS = ['musicbrainz', 'spotify', 'tidal'] as const;
type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isValidProviderName(name: string): name is SupportedProvider {
  return SUPPORTED_PROVIDERS.includes(name as SupportedProvider);
}

export interface ProviderSettingRow {
  providerName: string;
  enabled: boolean;
  priority: number;
}

/**
 * Fetch all provider settings from the database.
 * Returns empty array if no settings exist yet.
 */
export async function getProviderSettings(): Promise<ProviderSettingRow[]> {
  const settings = await db.providerSetting.findMany({
    orderBy: { providerName: 'asc' },
  });

  return settings.map((s) => ({
    providerName: s.providerName,
    enabled: s.enabled,
    priority: s.priority,
  }));
}

/**
 * Convert provider settings to a Map for use in the harmonization engine.
 */
export async function getProviderSettingsMap(): Promise<
  Map<string, ProviderDbSetting>
> {
  const settings = await getProviderSettings();
  const map = new Map<string, ProviderDbSetting>();

  for (const setting of settings) {
    map.set(setting.providerName, {
      enabled: setting.enabled,
      priority: setting.priority,
    });
  }

  return map;
}

/**
 * Get a map of which providers have credentials configured.
 */
export async function getProviderCredentialsStatus(): Promise<
  Map<string, boolean>
> {
  const providersWithCredentials = getProvidersWithCredentials();
  const map = new Map<string, boolean>();

  // All known providers
  const allProviders = ['musicbrainz', 'spotify', 'tidal'];

  for (const provider of allProviders) {
    map.set(provider, providersWithCredentials.has(provider));
  }

  return map;
}

/**
 * Update the enabled status for a provider.
 * Creates a new setting record if one doesn't exist.
 *
 * TODO: Add admin authorization check when role-based access is implemented.
 * Currently relies on the /admin route being protected at the layout/middleware level.
 */
export async function updateProviderEnabled(
  providerName: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate provider name to prevent arbitrary values in the database
    if (!isValidProviderName(providerName)) {
      return {
        success: false,
        error: `Unknown provider: ${providerName}`,
      };
    }

    // Check if the provider has credentials before enabling
    const providersWithCredentials = getProvidersWithCredentials();

    if (enabled && !providersWithCredentials.has(providerName)) {
      return {
        success: false,
        error: `Cannot enable ${providerName}: missing required credentials (environment variables)`,
      };
    }

    // Upsert the setting in database
    await db.providerSetting.upsert({
      where: { providerName },
      update: { enabled },
      create: {
        providerName,
        enabled,
        priority: getDefaultPriority(providerName),
      },
    });

    // Reset the engine singleton so it rebuilds with new settings
    resetEngine();

    // Revalidate the page to show updated state
    revalidatePath('/admin/harmony');

    return { success: true };
  } catch (error) {
    console.error('Failed to update provider setting:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update setting',
    };
  }
}

/**
 * Update the priority for a provider.
 *
 * TODO: Add admin authorization check when role-based access is implemented.
 * Currently relies on the /admin route being protected at the layout/middleware level.
 */
export async function updateProviderPriority(
  providerName: string,
  priority: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate provider name to prevent arbitrary values in the database
    if (!isValidProviderName(providerName)) {
      return {
        success: false,
        error: `Unknown provider: ${providerName}`,
      };
    }

    // Upsert the setting in database
    await db.providerSetting.upsert({
      where: { providerName },
      update: { priority },
      create: {
        providerName,
        enabled: true,
        priority,
      },
    });

    // Reset the engine singleton so it rebuilds with new settings
    resetEngine();

    // Revalidate the page to show updated state
    revalidatePath('/admin/harmony');

    return { success: true };
  } catch (error) {
    console.error('Failed to update provider priority:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update priority',
    };
  }
}

/**
 * Get the default priority for a provider.
 */
const DEFAULT_PROVIDER_PRIORITIES: Record<string, number> = {
  musicbrainz: 100,
  spotify: 80,
  tidal: 75,
};

const FALLBACK_PROVIDER_PRIORITY = 50;

function getDefaultPriority(providerName: string): number {
  return DEFAULT_PROVIDER_PRIORITIES[providerName] ?? FALLBACK_PROVIDER_PRIORITY;
}
