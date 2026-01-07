'use server';

/**
 * Settings Server Actions
 *
 * Server actions for managing user preferences and settings.
 * These actions interact with the database to persist user settings.
 */

import { db } from '@scilent-one/db';
import { auth } from '@scilent-one/auth/server';
import { headers } from 'next/headers';

// ============================================================================
// Types
// ============================================================================

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  inAppNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
}

/**
 * Full user preferences
 */
export interface UserPreferencesData extends NotificationPreferences {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Get User Preferences
// ============================================================================

/**
 * Get the current user's preferences.
 * Creates default preferences if they don't exist.
 *
 * @returns User preferences or null if not authenticated
 */
export async function getUserPreferences(): Promise<UserPreferencesData | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Try to find existing preferences
  let preferences = await db.userPreferences.findUnique({
    where: { userId },
  });

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await db.userPreferences.create({
      data: {
        userId,
        inAppNotificationsEnabled: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: false,
      },
    });
  }

  return preferences;
}

// ============================================================================
// Update Notification Preferences
// ============================================================================

/**
 * Update the current user's notification preferences.
 *
 * @param preferences - Partial notification preferences to update
 * @returns Updated preferences or error
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<{ success: boolean; data?: UserPreferencesData; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Upsert preferences (create if not exists, update if exists)
    const updated = await db.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        inAppNotificationsEnabled:
          preferences.inAppNotificationsEnabled ?? true,
        emailNotificationsEnabled:
          preferences.emailNotificationsEnabled ?? true,
        pushNotificationsEnabled: preferences.pushNotificationsEnabled ?? false,
      },
      update: {
        ...(preferences.inAppNotificationsEnabled !== undefined && {
          inAppNotificationsEnabled: preferences.inAppNotificationsEnabled,
        }),
        ...(preferences.emailNotificationsEnabled !== undefined && {
          emailNotificationsEnabled: preferences.emailNotificationsEnabled,
        }),
        ...(preferences.pushNotificationsEnabled !== undefined && {
          pushNotificationsEnabled: preferences.pushNotificationsEnabled,
        }),
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error(
      '[Settings] Failed to update notification preferences:',
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Toggle In-App Notifications
// ============================================================================

/**
 * Toggle in-app notifications for the current user.
 * Convenience function for the common use case.
 *
 * @param enabled - Whether to enable in-app notifications
 * @returns Updated preferences or error
 */
export async function toggleInAppNotifications(
  enabled: boolean
): Promise<{ success: boolean; data?: UserPreferencesData; error?: string }> {
  return updateNotificationPreferences({ inAppNotificationsEnabled: enabled });
}
