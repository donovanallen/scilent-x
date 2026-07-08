import { describe, it, expect, vi, beforeEach } from 'vitest';

const followFindMany = vi.fn();
const followFindUnique = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    follow: {
      findMany: (...args: unknown[]) => followFindMany(...args),
      findUnique: (...args: unknown[]) => followFindUnique(...args),
    },
  },
}));

const { getFollowers, getFollowing, isFollowing } = await import('../queries');

describe('getFollowers', () => {
  beforeEach(() => {
    followFindMany.mockReset();
  });

  it('returns followers with isFollowing computed for the current user', async () => {
    followFindMany.mockResolvedValue([
      {
        id: 'follow-1',
        follower: { id: 'user-2', followers: [{ id: 'f' }] },
      },
      {
        id: 'follow-2',
        follower: { id: 'user-3', followers: [] },
      },
    ]);

    const result = await getFollowers('user-1', { limit: 20 }, 'current-user');

    expect(result.items[0]?.isFollowing).toBe(true);
    expect(result.items[1]?.isFollowing).toBe(false);
    expect(followFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { followingId: 'user-1' } })
    );
  });

  it('defaults isFollowing to false without a current user', async () => {
    followFindMany.mockResolvedValue([
      { id: 'follow-1', follower: { id: 'user-2' } },
    ]);

    const result = await getFollowers('user-1');

    expect(result.items[0]?.isFollowing).toBe(false);
  });
});

describe('getFollowing', () => {
  beforeEach(() => {
    followFindMany.mockReset();
  });

  it('returns followed users with isFollowing computed for the current user', async () => {
    followFindMany.mockResolvedValue([
      {
        id: 'follow-1',
        following: { id: 'user-2', followers: [{ id: 'f' }] },
      },
    ]);

    const result = await getFollowing('user-1', { limit: 20 }, 'current-user');

    expect(result.items[0]?.isFollowing).toBe(true);
    expect(followFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { followerId: 'user-1' } })
    );
  });

  it('defaults isFollowing to false without a current user', async () => {
    followFindMany.mockResolvedValue([
      { id: 'follow-1', following: { id: 'user-2' } },
    ]);

    const result = await getFollowing('user-1');

    expect(result.items[0]?.isFollowing).toBe(false);
  });
});

describe('isFollowing', () => {
  beforeEach(() => {
    followFindUnique.mockReset();
  });

  it('returns true when a follow relationship exists', async () => {
    followFindUnique.mockResolvedValue({ id: 'follow-1' });

    await expect(isFollowing('user-1', 'user-2')).resolves.toBe(true);
  });

  it('returns false when no follow relationship exists', async () => {
    followFindUnique.mockResolvedValue(null);

    await expect(isFollowing('user-1', 'user-2')).resolves.toBe(false);
  });
});
