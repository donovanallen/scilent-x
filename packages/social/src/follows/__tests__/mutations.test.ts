import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../utils/errors';

const userFindUnique = vi.fn();
const followFindUnique = vi.fn();
const followCreate = vi.fn();
const followDelete = vi.fn();
const activityCreate = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => userFindUnique(...args),
    },
    follow: {
      findUnique: (...args: unknown[]) => followFindUnique(...args),
      create: (...args: unknown[]) => followCreate(...args),
      delete: (...args: unknown[]) => followDelete(...args),
    },
    activity: {
      create: (...args: unknown[]) => activityCreate(...args),
    },
  },
}));

const { followUser, unfollowUser } = await import('../mutations');

describe('followUser', () => {
  beforeEach(() => {
    userFindUnique.mockReset();
    followFindUnique.mockReset();
    followCreate.mockReset();
    activityCreate.mockReset();
  });

  it('throws ValidationError when following yourself', async () => {
    await expect(followUser('user-1', 'user-1')).rejects.toThrow(
      ValidationError
    );
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when the target user does not exist', async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(followUser('user-1', 'user-2')).rejects.toThrow(NotFoundError);
    expect(followCreate).not.toHaveBeenCalled();
  });

  it('throws ConflictError when already following', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-2' });
    followFindUnique.mockResolvedValue({ id: 'follow-1' });

    await expect(followUser('user-1', 'user-2')).rejects.toThrow(ConflictError);
    expect(followCreate).not.toHaveBeenCalled();
  });

  it('creates the follow and a USER_FOLLOWED activity', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-2' });
    followFindUnique.mockResolvedValue(null);

    await followUser('user-1', 'user-2');

    expect(followCreate).toHaveBeenCalledWith({
      data: { followerId: 'user-1', followingId: 'user-2' },
    });
    expect(activityCreate).toHaveBeenCalledWith({
      data: { type: 'USER_FOLLOWED', userId: 'user-2', actorId: 'user-1' },
    });
  });
});

describe('unfollowUser', () => {
  beforeEach(() => {
    followFindUnique.mockReset();
    followDelete.mockReset();
  });

  it('throws NotFoundError when no follow relationship exists', async () => {
    followFindUnique.mockResolvedValue(null);

    await expect(unfollowUser('user-1', 'user-2')).rejects.toThrow(
      NotFoundError
    );
    expect(followDelete).not.toHaveBeenCalled();
  });

  it('deletes the existing follow relationship', async () => {
    followFindUnique.mockResolvedValue({ id: 'follow-1' });

    await unfollowUser('user-1', 'user-2');

    expect(followDelete).toHaveBeenCalledWith({
      where: {
        followerId_followingId: { followerId: 'user-1', followingId: 'user-2' },
      },
    });
  });
});
