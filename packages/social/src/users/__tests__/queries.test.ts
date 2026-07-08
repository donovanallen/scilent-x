import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

const userFindUnique = vi.fn();
const userFindMany = vi.fn();
const followFindMany = vi.fn();
const isMutualFollow = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => userFindUnique(...args),
      findMany: (...args: unknown[]) => userFindMany(...args),
    },
    follow: {
      findMany: (...args: unknown[]) => followFindMany(...args),
    },
  },
}));

vi.mock('../../conversations/queries', () => ({
  isMutualFollow: (...args: unknown[]) => isMutualFollow(...args),
}));

const { getUserById, getUserByUsername, searchUsers, getSuggestedUsers } =
  await import('../queries');

describe('getUserById', () => {
  beforeEach(() => {
    userFindUnique.mockReset();
    isMutualFollow.mockReset();
  });

  it('throws NotFoundError when the user does not exist', async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(getUserById('user-1')).rejects.toThrow(NotFoundError);
  });

  it('returns the user profile without canMessage/isFollowing when viewing without a current user', async () => {
    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      name: 'Alice',
      username: 'alice',
      bio: null,
      avatarUrl: null,
      image: null,
      createdAt: new Date(),
      _count: { posts: 0, followers: 0, following: 0 },
    });

    const result = await getUserById('user-1');

    expect(result.isFollowing).toBe(false);
    expect(result.canMessage).toBeUndefined();
    expect(isMutualFollow).not.toHaveBeenCalled();
  });

  it('computes isFollowing and canMessage when viewed by another user', async () => {
    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      name: 'Alice',
      username: 'alice',
      bio: null,
      avatarUrl: null,
      image: null,
      createdAt: new Date(),
      _count: { posts: 0, followers: 0, following: 0 },
      followers: [{ followerId: 'current-user' }],
    });
    isMutualFollow.mockResolvedValue(true);

    const result = await getUserById('user-1', 'current-user');

    expect(result.isFollowing).toBe(true);
    expect(result.canMessage).toBe(true);
    expect(isMutualFollow).toHaveBeenCalledWith('current-user', 'user-1');
  });

  it('does not compute canMessage when viewing your own profile', async () => {
    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      name: 'Alice',
      username: 'alice',
      bio: null,
      avatarUrl: null,
      image: null,
      createdAt: new Date(),
      _count: { posts: 0, followers: 0, following: 0 },
      followers: [],
    });

    const result = await getUserById('user-1', 'user-1');

    expect(result.canMessage).toBeUndefined();
    expect(isMutualFollow).not.toHaveBeenCalled();
  });

  it('includes connected platforms when requested', async () => {
    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      name: 'Alice',
      username: 'alice',
      bio: null,
      avatarUrl: null,
      image: null,
      createdAt: new Date(),
      _count: { posts: 0, followers: 0, following: 0 },
      accounts: [{ providerId: 'google', createdAt: new Date('2024-01-01') }],
    });

    const result = await getUserById('user-1', undefined, {
      includeConnectedAccounts: true,
    });

    expect(
      (result as typeof result & { connectedPlatforms?: unknown[] })
        .connectedPlatforms
    ).toEqual([{ providerId: 'google', connectedAt: new Date('2024-01-01') }]);
  });
});

describe('getUserByUsername', () => {
  beforeEach(() => {
    userFindUnique.mockReset();
    isMutualFollow.mockReset();
  });

  it('throws NotFoundError when the user does not exist', async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(getUserByUsername('alice')).rejects.toThrow(NotFoundError);
  });

  it('returns the user profile by username', async () => {
    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      name: 'Alice',
      username: 'alice',
      bio: null,
      avatarUrl: null,
      image: null,
      createdAt: new Date(),
      _count: { posts: 0, followers: 0, following: 0 },
    });

    const result = await getUserByUsername('alice');

    expect(result.username).toBe('alice');
    expect(userFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { username: 'alice' } })
    );
  });

  it('includes connected platforms when requested', async () => {
    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      name: 'Alice',
      username: 'alice',
      bio: null,
      avatarUrl: null,
      image: null,
      createdAt: new Date(),
      _count: { posts: 0, followers: 0, following: 0 },
      accounts: [{ providerId: 'spotify', createdAt: new Date('2024-02-02') }],
    });

    const result = await getUserByUsername('alice', undefined, {
      includeConnectedAccounts: true,
    });

    expect(
      (result as typeof result & { connectedPlatforms?: unknown[] })
        .connectedPlatforms
    ).toEqual([{ providerId: 'spotify', connectedAt: new Date('2024-02-02') }]);
  });
});

describe('searchUsers', () => {
  beforeEach(() => {
    userFindMany.mockReset();
  });

  it('searches by username/name/id and marks isFollowing', async () => {
    userFindMany.mockResolvedValue([
      { id: 'user-1', followers: [{ followerId: 'current-user' }] },
      { id: 'user-2', followers: [] },
    ]);

    const result = await searchUsers('ali', { limit: 20 }, 'current-user');

    expect(result.items[0]?.isFollowing).toBe(true);
    expect(result.items[1]?.isFollowing).toBe(false);
    expect(userFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { username: { contains: 'ali', mode: 'insensitive' } },
            { name: { contains: 'ali', mode: 'insensitive' } },
            { id: { contains: 'ali', mode: 'insensitive' } },
          ],
        },
      })
    );
  });

  it('defaults isFollowing to false without a current user', async () => {
    userFindMany.mockResolvedValue([{ id: 'user-1' }]);

    const result = await searchUsers('ali');

    expect(result.items[0]?.isFollowing).toBe(false);
  });
});

describe('getSuggestedUsers', () => {
  beforeEach(() => {
    followFindMany.mockReset();
    userFindMany.mockReset();
  });

  it('excludes followed users and the current user, defaulting isFollowing to false', async () => {
    followFindMany.mockResolvedValue([{ followingId: 'user-2' }]);
    userFindMany.mockResolvedValue([{ id: 'user-3' }]);

    const result = await getSuggestedUsers('user-1', 5);

    expect(userFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { notIn: ['user-2', 'user-1'] },
        }),
        take: 5,
      })
    );
    expect(result[0]?.isFollowing).toBe(false);
  });

  it('uses a default limit of 5', async () => {
    followFindMany.mockResolvedValue([]);
    userFindMany.mockResolvedValue([]);

    await getSuggestedUsers('user-1');

    expect(userFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });
});
