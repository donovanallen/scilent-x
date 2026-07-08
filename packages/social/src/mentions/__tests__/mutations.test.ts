import { describe, it, expect, vi, beforeEach } from 'vitest';

const mentionDeleteMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    mention: {
      deleteMany: (...args: unknown[]) => mentionDeleteMany(...args),
    },
  },
}));

const { deleteMentionsByPost, deleteMentionsByComment } =
  await import('../mutations');

describe('deleteMentionsByPost', () => {
  beforeEach(() => {
    mentionDeleteMany.mockReset();
  });

  it('deletes all mentions for the given post', async () => {
    await deleteMentionsByPost('post-1');

    expect(mentionDeleteMany).toHaveBeenCalledWith({
      where: { postId: 'post-1' },
    });
  });
});

describe('deleteMentionsByComment', () => {
  beforeEach(() => {
    mentionDeleteMany.mockReset();
  });

  it('deletes all mentions for the given comment', async () => {
    await deleteMentionsByComment('comment-1');

    expect(mentionDeleteMany).toHaveBeenCalledWith({
      where: { commentId: 'comment-1' },
    });
  });
});
