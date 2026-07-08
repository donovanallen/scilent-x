import { describe, it, expect, vi, beforeEach } from 'vitest';

const userFindMany = vi.fn();
const mentionCreateMany = vi.fn();
const activityCreateMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    user: {
      findMany: (...args: unknown[]) => userFindMany(...args),
    },
    mention: {
      createMany: (...args: unknown[]) => mentionCreateMany(...args),
    },
    activity: {
      createMany: (...args: unknown[]) => activityCreateMany(...args),
    },
  },
}));

const { convertLegacyMentions, createMentionsFromUsernames } =
  await import('../parser');

describe('convertLegacyMentions', () => {
  beforeEach(() => {
    userFindMany.mockReset();
  });

  it('returns an empty array without querying the database when given no mentions', async () => {
    const result = await convertLegacyMentions([]);

    expect(result).toEqual([]);
    expect(userFindMany).not.toHaveBeenCalled();
  });

  it('resolves usernames to USER mentions with matching user ids', async () => {
    userFindMany.mockResolvedValue([
      { id: 'user-1', username: 'Alice' },
      { id: 'user-2', username: 'bob' },
    ]);

    const result = await convertLegacyMentions([
      { username: 'alice', startIndex: 0, endIndex: 6 },
      { username: 'bob', startIndex: 7, endIndex: 11 },
    ]);

    expect(userFindMany).toHaveBeenCalledWith({
      where: { username: { in: ['alice', 'bob'], mode: 'insensitive' } },
      select: { id: true, username: true },
    });
    expect(result).toEqual([
      {
        type: 'USER',
        entityId: 'user-1',
        label: 'alice',
        startIndex: 0,
        endIndex: 6,
      },
      {
        type: 'USER',
        entityId: 'user-2',
        label: 'bob',
        startIndex: 7,
        endIndex: 11,
      },
    ]);
  });

  it('drops legacy mentions that have no matching user', async () => {
    userFindMany.mockResolvedValue([{ id: 'user-1', username: 'alice' }]);

    const result = await convertLegacyMentions([
      { username: 'alice', startIndex: 0, endIndex: 6 },
      { username: 'ghost', startIndex: 7, endIndex: 12 },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.entityId).toBe('user-1');
  });

  it('ignores users with a null username when building the lookup map', async () => {
    userFindMany.mockResolvedValue([{ id: 'user-1', username: null }]);

    const result = await convertLegacyMentions([
      { username: 'alice', startIndex: 0, endIndex: 6 },
    ]);

    expect(result).toEqual([]);
  });
});

describe('createMentionsFromUsernames', () => {
  beforeEach(() => {
    userFindMany.mockReset();
    mentionCreateMany.mockReset();
    activityCreateMany.mockReset();
  });

  it('does nothing when there are no legacy mentions', async () => {
    await createMentionsFromUsernames([], { postId: 'post-1' });

    expect(userFindMany).not.toHaveBeenCalled();
    expect(mentionCreateMany).not.toHaveBeenCalled();
  });

  it('converts legacy mentions and persists them', async () => {
    userFindMany.mockResolvedValue([{ id: 'user-1', username: 'alice' }]);

    await createMentionsFromUsernames(
      [{ username: 'alice', startIndex: 0, endIndex: 6 }],
      { postId: 'post-1' }
    );

    expect(mentionCreateMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'USER',
          userId: 'user-1',
          postId: 'post-1',
          commentId: null,
        },
      ],
    });
    expect(activityCreateMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'USER_MENTIONED',
          userId: 'user-1',
          postId: 'post-1',
          commentId: null,
        },
      ],
    });
  });
});
