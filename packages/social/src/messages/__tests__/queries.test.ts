import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenError } from '../../utils/errors';

const conversationParticipantFindUnique = vi.fn();
const messageFindMany = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    conversationParticipant: {
      findUnique: (...args: unknown[]) =>
        conversationParticipantFindUnique(...args),
    },
    message: {
      findMany: (...args: unknown[]) => messageFindMany(...args),
    },
  },
}));

const { getMessages } = await import('../queries');

describe('getMessages', () => {
  beforeEach(() => {
    conversationParticipantFindUnique.mockReset();
    messageFindMany.mockReset();
  });

  it('throws ForbiddenError when the user is not a participant', async () => {
    conversationParticipantFindUnique.mockResolvedValue(null);

    await expect(getMessages('user-1', 'convo-1')).rejects.toThrow(
      ForbiddenError
    );
    expect(messageFindMany).not.toHaveBeenCalled();
  });

  it('returns paginated messages for a participant', async () => {
    conversationParticipantFindUnique.mockResolvedValue({
      id: 'participant-1',
    });
    messageFindMany.mockResolvedValue([{ id: 'msg-1' }, { id: 'msg-2' }]);

    const result = await getMessages('user-1', 'convo-1', { limit: 20 });

    expect(result.items).toHaveLength(2);
    expect(messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { conversationId: 'convo-1' } })
    );
  });

  it('paginates using the provided cursor', async () => {
    conversationParticipantFindUnique.mockResolvedValue({
      id: 'participant-1',
    });
    messageFindMany.mockResolvedValue([]);

    await getMessages('user-1', 'convo-1', { cursor: 'cursor-1', limit: 5 });

    expect(messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: 'cursor-1' }, skip: 1 })
    );
  });
});
