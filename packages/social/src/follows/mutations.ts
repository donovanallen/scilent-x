import { db } from '@scilent-one/db';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  if (followerId === followingId) {
    throw new ValidationError('You cannot follow yourself');
  }

  const userToFollow = await db.user.findUnique({
    where: { id: followingId },
  });

  if (!userToFollow) {
    throw new NotFoundError('User');
  }

  const existingFollow = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    throw new ConflictError('You are already following this user');
  }

  await db.follow.create({
    data: {
      followerId,
      followingId,
    },
  });

  // Create activity for followed user
  await db.activity.create({
    data: {
      type: 'USER_FOLLOWED',
      userId: followingId,
      actorId: followerId,
    },
  });
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const existingFollow = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!existingFollow) {
    throw new NotFoundError('Follow relationship');
  }

  await db.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
}
