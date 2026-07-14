'use server';

import { db } from '@scilent-one/db';
import type { ProfileType } from '@scilent-one/db';
import { setProfileType } from '@scilent-one/social/users/mutations';
import { revalidatePath } from 'next/cache';

export type ConnectedAccount = {
  providerId: string;
};

export type UserListItem = {
  id: string;
  email: string;
  name: string | null;
  profileType: ProfileType;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  connectedAccounts: ConnectedAccount[];
};

/**
 * Fetches all users from the database
 */
export async function getUsers(): Promise<UserListItem[]> {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        profileType: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          where: { providerId: { not: 'credential' } },
          select: { providerId: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      ...user,
      connectedAccounts: user.accounts,
      accounts: undefined as never,
    }));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

/**
 * Gets the total count of users
 */
export async function getUserCount(): Promise<number> {
  try {
    return await db.user.count();
  } catch (error) {
    console.error('Failed to count users:', error);
    return 0;
  }
}

/**
 * Updates a user's profile type
 */
export async function updateUserProfileType(
  userId: string,
  profileType: ProfileType
): Promise<{ success: boolean; error?: string }> {
  try {
    await setProfileType(userId, profileType);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to update user profile type:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update profile type',
    };
  }
}
