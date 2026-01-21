'use server';

import { db } from '@scilent-one/db';
import type {
  HarmonizedUserProfile,
  HarmonizedArtist,
} from '@scilent-one/harmony-engine';

import { getCurrentUser } from '@/lib/api-utils';
import {
  getHarmonizationEngine,
  getFollowedArtistsFromProvider,
  getLibraryCountsFromProvider,
  type LibraryCounts,
} from '@/lib/harmonization';

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
    const engine = await getHarmonizationEngine();
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
  // Check authorization - only allow viewing own profiles
  const canView = await canViewProviderProfiles(userId);
  if (!canView) {
    // Return empty results when unauthorized
    return {};
  }

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

export interface FollowedArtistsResult {
  success: boolean;
  artists?: HarmonizedArtist[];
  total?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  error?: string;
  errorCode?:
    | 'UNAUTHORIZED'
    | 'NOT_CONNECTED'
    | 'TOKEN_EXPIRED'
    | 'PROVIDER_ERROR';
}

/**
 * Get a user's followed/favorite artists from a connected streaming provider.
 * @param userId - The user ID to fetch followed artists for
 * @param providerId - The provider ID (e.g., 'tidal', 'spotify')
 * @param limit - Maximum number of artists to return (default: 10)
 * @param cursor - Pagination cursor for fetching more results
 */
export async function getFollowedArtists(
  userId: string,
  providerId: string,
  limit = 10,
  cursor?: string
): Promise<FollowedArtistsResult> {
  try {
    // Check authorization - only allow viewing own data
    const canView = await canViewProviderProfiles(userId);
    if (!canView) {
      return {
        success: false,
        error: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      };
    }

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

    // Fetch followed artists from the provider
    const params: { limit: number; cursor?: string } = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const result = await getFollowedArtistsFromProvider(
      account.accessToken,
      providerId,
      params
    );

    const response: FollowedArtistsResult = {
      success: true,
      artists: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    };

    if (result.total !== undefined) {
      response.total = result.total;
    }

    return response;
  } catch (error) {
    console.error(`Failed to fetch ${providerId} followed artists:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'PROVIDER_ERROR',
    };
  }
}

export interface LibraryCountsResult {
  success: boolean;
  counts?: LibraryCounts;
  error?: string;
  errorCode?:
    | 'UNAUTHORIZED'
    | 'NOT_CONNECTED'
    | 'TOKEN_EXPIRED'
    | 'PROVIDER_ERROR';
}

/**
 * Get a user's library counts (albums, playlists, artists) from a connected streaming provider.
 * @param userId - The user ID to fetch the library counts for
 * @param providerId - The provider ID (e.g., 'tidal', 'spotify')
 */
export async function getLibraryCounts(
  userId: string,
  providerId: string
): Promise<LibraryCountsResult> {
  try {
    // Check authorization - only allow viewing own data
    const canView = await canViewProviderProfiles(userId);
    if (!canView) {
      return {
        success: false,
        error: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      };
    }

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

    // Fetch library counts from the provider
    const counts = await getLibraryCountsFromProvider(
      account.accessToken,
      providerId
    );

    return {
      success: true,
      counts,
    };
  } catch (error) {
    console.error(`Failed to fetch ${providerId} library counts:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'PROVIDER_ERROR',
    };
  }
}
