import { describe, it, expect, vi, beforeEach } from 'vitest';

const mentionCreateMany = vi.fn();
const activityCreateMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    mention: {
      createMany: (...args: unknown[]) => mentionCreateMany(...args),
    },
    activity: {
      createMany: (...args: unknown[]) => activityCreateMany(...args),
    },
  },
}));

// Imported after the mock so `db` resolves to the mocked module above.
const { createMentions } = await import('../parser');

describe('createMentions', () => {
  beforeEach(() => {
    mentionCreateMany.mockReset();
    activityCreateMany.mockReset();
  });

  it('does nothing when there are no mentions', async () => {
    await createMentions([], { postId: 'post-1' });

    expect(mentionCreateMany).not.toHaveBeenCalled();
    expect(activityCreateMany).not.toHaveBeenCalled();
  });

  it('persists USER mentions with userId and creates a USER_MENTIONED activity', async () => {
    await createMentions(
      [{ type: 'USER', entityId: 'user-1', label: 'johndoe' }],
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

  it('persists ARTIST mentions via entityId/entityLabel without creating an activity', async () => {
    await createMentions(
      [{ type: 'ARTIST', entityId: 'spotify:123', label: 'Taylor Swift' }],
      { postId: 'post-1' }
    );

    expect(mentionCreateMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'ARTIST',
          entityId: 'spotify:123',
          entityLabel: 'Taylor Swift',
          postId: 'post-1',
          commentId: null,
        },
      ],
    });
    expect(activityCreateMany).not.toHaveBeenCalled();
  });

  it('handles a mix of USER and ARTIST mentions independently', async () => {
    await createMentions(
      [
        { type: 'USER', entityId: 'user-1', label: 'johndoe' },
        { type: 'ARTIST', entityId: 'spotify:123', label: 'Taylor Swift' },
      ],
      { commentId: 'comment-1' }
    );

    expect(mentionCreateMany).toHaveBeenCalledTimes(2);
    expect(activityCreateMany).toHaveBeenCalledTimes(1);
    expect(activityCreateMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'USER_MENTIONED',
          userId: 'user-1',
          postId: null,
          commentId: 'comment-1',
        },
      ],
    });
  });
});
