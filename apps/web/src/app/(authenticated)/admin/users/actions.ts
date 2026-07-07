'use server';

import { db } from '@scilent-one/db';

export type ConnectedAccount = {
  providerId: string;
};

export type UserListItem = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
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
        emailVerified: true,
        image: true,
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
