import { db } from '@scilent-one/db';
import type { UpdateProfileInput, UserProfile } from '../types';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

// Username validation regex: starts with letter, alphanumeric and underscores, 3-30 chars
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/;

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'api',
  'auth',
  'dashboard',
  'explore',
  'feed',
  'help',
  'login',
  'logout',
  'me',
  'post',
  'posts',
  'profile',
  'search',
  'settings',
  'signup',
  'support',
  'user',
  'users',
];

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserProfile> {
  // Validate username if provided
  if (input.username !== undefined) {
    if (input.username && !USERNAME_REGEX.test(input.username)) {
      throw new ValidationError(
        'Username must be 3-30 characters, start with a letter, and contain only letters, numbers, and underscores'
      );
    }

    if (input.username && RESERVED_USERNAMES.includes(input.username.toLowerCase())) {
      throw new ValidationError('This username is reserved');
    }

    // Check if username is already taken
    if (input.username) {
      const existingUser = await db.user.findUnique({
        where: { username: input.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Username is already taken');
      }
    }
  }

  // Validate bio length
  if (input.bio !== undefined && input.bio && input.bio.length > 500) {
    throw new ValidationError('Bio cannot exceed 500 characters');
  }

  const user = await db.user.update({
    where: { id: userId },
    data: {
      ...(input.username !== undefined && { username: input.username }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      ...(input.name !== undefined && { name: input.name }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  return user;
}

export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string
): Promise<{ available: boolean; reason?: string }> {
  if (!USERNAME_REGEX.test(username)) {
    return {
      available: false,
      reason:
        'Username must be 3-30 characters, start with a letter, and contain only letters, numbers, and underscores',
    };
  }

  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return {
      available: false,
      reason: 'This username is reserved',
    };
  }

  const existingUser = await db.user.findUnique({
    where: { username },
  });

  if (existingUser && existingUser.id !== currentUserId) {
    return {
      available: false,
      reason: 'Username is already taken',
    };
  }

  return { available: true };
}
