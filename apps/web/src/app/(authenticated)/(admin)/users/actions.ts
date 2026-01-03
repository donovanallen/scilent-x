'use server';

import { db } from '@scilent-one/db';

export type UserListItem = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
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
