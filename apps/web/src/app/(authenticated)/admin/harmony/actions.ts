'use server';

import { db } from '@scilent-one/db';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/api-utils';
import {
  resetEngine,
  getProvidersWithCredentials,
  type ProviderDbSetting,
} from '@/lib/harmonization';
import { createActionDomainLogger, toLogError } from '@/lib/logger';

import {
  getDefaultPriority,
  clampPriority,
  MIN_PROVIDER_PRIORITY,
  MAX_PROVIDER_PRIORITY,
} from './provider-metadata';

const log = createActionDomainLogger('admin-harmony');

/**
 * List of known/supported provider names.
 * Used for validation to prevent arbitrary provider names in the database.
 */
const SUPPORTED_PROVIDERS = [
  'musicbrainz',
  'spotify',
  'tidal',
  'apple_music',
] as const;
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
  await requireAdmin();

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
 * Convert provider settings to a Map format.
 *
 * Note: The harmonization engine now automatically fetches settings from the
 * database when creating a new instance, so this function is primarily useful
 * for testing or other scenarios where you need the settings in Map format.
 */
export async function getProviderSettingsMap(): Promise<
  Map<string, ProviderDbSetting>
> {
  await requireAdmin();

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
  await requireAdmin();

  const providersWithCredentials = getProvidersWithCredentials();
  const map = new Map<string, boolean>();

  const allProviders = ['musicbrainz', 'spotify', 'tidal', 'apple_music'];

  for (const provider of allProviders) {
    map.set(provider, providersWithCredentials.has(provider));
  }

  return map;
}

/**
 * Update the enabled status for a provider.
 * Creates a new setting record if one doesn't exist.
 *
 * Requires an authenticated admin session (role check in admin layout +
 * Better Auth admin plugin on impersonation APIs).
 */
export async function updateProviderEnabled(
  providerName: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    if (!isValidProviderName(providerName)) {
      return {
        success: false,
        error: `Unknown provider: ${providerName}`,
      };
    }

    const providersWithCredentials = getProvidersWithCredentials();

    if (enabled && !providersWithCredentials.has(providerName)) {
      return {
        success: false,
        error: `Cannot enable ${providerName}: missing required credentials (environment variables)`,
      };
    }

    await db.providerSetting.upsert({
      where: { providerName },
      update: { enabled },
      create: {
        providerName,
        enabled,
        priority: getDefaultPriority(providerName),
      },
    });

    resetEngine();
    revalidatePath('/admin/harmony');

    return { success: true };
  } catch (error) {
    log.error('Failed to update provider setting', toLogError(error));
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
 * Requires an authenticated admin session (role check in admin layout +
 * Better Auth admin plugin on impersonation APIs).
 */
export async function updateProviderPriority(
  providerName: string,
  priority: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    if (!isValidProviderName(providerName)) {
      return {
        success: false,
        error: `Unknown provider: ${providerName}`,
      };
    }

    if (!Number.isFinite(priority)) {
      return { success: false, error: 'Priority must be a number' };
    }

    const normalized = clampPriority(priority);
    if (normalized !== priority) {
      return {
        success: false,
        error: `Priority must be a whole number between ${MIN_PROVIDER_PRIORITY} and ${MAX_PROVIDER_PRIORITY}`,
      };
    }

    await db.providerSetting.upsert({
      where: { providerName },
      update: { priority: normalized },
      create: {
        providerName,
        enabled: true,
        priority: normalized,
      },
    });

    resetEngine();
    revalidatePath('/admin/harmony');

    return { success: true };
  } catch (error) {
    log.error('Failed to update provider priority', toLogError(error));
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update priority',
    };
  }
}
