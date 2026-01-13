'use server';

import { db } from '@scilent-one/db';
import type { HarmonizedUserProfile } from '@scilent-one/harmony-engine';

import { getCurrentUser } from '@/lib/api-utils';
import { getHarmonizationEngine } from '@/lib/harmonization';

export interface ProviderProfileResult {
  success: boolean;
  profile?: HarmonizedUserProfile;
  error?: string;
  errorCode?:
    | 'UNAUTHORIZED'
    | 'NOT_CONNECTED'
    | 'TOKEN_EXPIRED'
    | 'PROVIDER_ERROR';
}

/**
 * Get a user's profile from a connected streaming provider.
 * @param userId - The user ID to fetch the provider profile for
 * @param providerId - The provider ID (e.g., 'tidal', 'spotify')
 */
export async function getProviderProfile(
  userId: string,
  providerId: string
): Promise<ProviderProfileResult> {
  try {
    // Get the user's connected account with access token
    const account = await db.account.findFirst({
      where: {
        userId,
        providerId,
      },
      select: {
        accessToken: true,
        accessTokenExpiresAt: true,
      },
    });

    if (!account?.accessToken) {
      return {
        success: false,
        error: `${providerId} account not connected`,
        errorCode: 'NOT_CONNECTED',
      };
    }

    // Check if token is expired
    if (
      account.accessTokenExpiresAt &&
      account.accessTokenExpiresAt < new Date()
    ) {
      return {
        success: false,
        error: `${providerId} token expired`,
        errorCode: 'TOKEN_EXPIRED',
      };
    }

    // Get the provider from the engine
    const engine = getHarmonizationEngine();
    const provider = engine.getProvider(providerId);

    if (!provider) {
      return {
        success: false,
        error: `${providerId} provider not configured`,
        errorCode: 'PROVIDER_ERROR',
      };
    }

    if (!provider.supportsUserAuth) {
      return {
        success: false,
        error: `${providerId} does not support user authentication`,
        errorCode: 'PROVIDER_ERROR',
      };
    }

    // Fetch the user's provider profile
    const profile = await provider.getCurrentUser(account.accessToken);

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error(`Failed to fetch ${providerId} profile:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'PROVIDER_ERROR',
    };
  }
}

/**
 * Get all connected provider profiles for a user.
 * @param userId - The user ID to fetch profiles for
 */
export async function getAllProviderProfiles(
  userId: string
): Promise<Record<string, ProviderProfileResult>> {
  // Get all connected accounts for the user (excluding credential accounts)
  const accounts = await db.account.findMany({
    where: {
      userId,
      providerId: { not: 'credential' },
    },
    select: {
      providerId: true,
    },
  });

  const results: Record<string, ProviderProfileResult> = {};

  // Fetch profiles for each connected provider
  await Promise.all(
    accounts.map(async (account) => {
      results[account.providerId] = await getProviderProfile(
        userId,
        account.providerId
      );
    })
  );

  return results;
}

/**
 * Check if the current user can view another user's provider profiles.
 * Currently only allows viewing your own profiles.
 */
export async function canViewProviderProfiles(
  targetUserId: string
): Promise<boolean> {
  const currentUser = await getCurrentUser();
  return currentUser?.id === targetUserId;
}
