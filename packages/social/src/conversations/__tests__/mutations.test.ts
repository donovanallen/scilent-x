import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors';

const userFindUnique = vi.fn();
const conversationFindFirst = vi.fn();
const conversationCreate = vi.fn();
const conversationParticipantFindUnique = vi.fn();
const conversationParticipantUpdate = vi.fn();

const isMutualFollow = vi.fn();
const getConversationSummary = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => userFindUnique(...args),
    },
    conversation: {
      findFirst: (...args: unknown[]) => conversationFindFirst(...args),
      create: (...args: unknown[]) => conversationCreate(...args),
    },
    conversationParticipant: {
      findUnique: (...args: unknown[]) =>
        conversationParticipantFindUnique(...args),
      update: (...args: unknown[]) => conversationParticipantUpdate(...args),
    },
  },
}));

vi.mock('../queries', () => ({
  isMutualFollow: (...args: unknown[]) => isMutualFollow(...args),
  getConversationSummary: (...args: unknown[]) =>
    getConversationSummary(...args),
}));

const { getOrCreateDirectConversation, markConversationRead } =
  await import('../mutations');

describe('getOrCreateDirectConversation', () => {
  beforeEach(() => {
    userFindUnique.mockReset();
    conversationFindFirst.mockReset();
    conversationCreate.mockReset();
    isMutualFollow.mockReset();
    getConversationSummary.mockReset();
  });

  it('throws ValidationError when messaging yourself', async () => {
    await expect(
      getOrCreateDirectConversation('user-1', 'user-1')
    ).rejects.toThrow(ValidationError);
  });

  it('throws NotFoundError when the recipient does not exist', async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(
      getOrCreateDirectConversation('user-1', 'user-2')
    ).rejects.toThrow(NotFoundError);
  });

  it('returns the existing 1:1 conversation summary when one already exists', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-2' });
    conversationFindFirst.mockResolvedValue({
      id: 'convo-1',
      participants: [{ userId: 'user-1' }, { userId: 'user-2' }],
    });
    getConversationSummary.mockResolvedValue({ id: 'convo-1' });

    const result = await getOrCreateDirectConversation('user-1', 'user-2');

    expect(result).toEqual({ id: 'convo-1' });
    expect(isMutualFollow).not.toHaveBeenCalled();
    expect(conversationCreate).not.toHaveBeenCalled();
  });

  it('ignores a group conversation match with more than 2 participants', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-2' });
    conversationFindFirst.mockResolvedValue({
      id: 'group-convo',
      participants: [
        { userId: 'user-1' },
        { userId: 'user-2' },
        { userId: 'user-3' },
      ],
    });
    isMutualFollow.mockResolvedValue(true);
    conversationCreate.mockResolvedValue({ id: 'new-convo' });
    getConversationSummary.mockResolvedValue({ id: 'new-convo' });

    await getOrCreateDirectConversation('user-1', 'user-2');

    expect(conversationCreate).toHaveBeenCalled();
  });

  it('throws ForbiddenError when users do not mutually follow each other', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-2' });
    conversationFindFirst.mockResolvedValue(null);
    isMutualFollow.mockResolvedValue(false);

    await expect(
      getOrCreateDirectConversation('user-1', 'user-2')
    ).rejects.toThrow(ForbiddenError);
    expect(conversationCreate).not.toHaveBeenCalled();
  });

  it('creates a new conversation when none exists and users mutually follow', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-2' });
    conversationFindFirst.mockResolvedValue(null);
    isMutualFollow.mockResolvedValue(true);
    conversationCreate.mockResolvedValue({ id: 'new-convo' });
    getConversationSummary.mockResolvedValue({ id: 'new-convo' });

    const result = await getOrCreateDirectConversation('user-1', 'user-2');

    expect(conversationCreate).toHaveBeenCalledWith({
      data: {
        participants: {
          create: [{ userId: 'user-1' }, { userId: 'user-2' }],
        },
      },
    });
    expect(getConversationSummary).toHaveBeenCalledWith('user-1', 'new-convo');
    expect(result).toEqual({ id: 'new-convo' });
  });
});

describe('markConversationRead', () => {
  beforeEach(() => {
    conversationParticipantFindUnique.mockReset();
    conversationParticipantUpdate.mockReset();
  });

  it('throws ForbiddenError when the user is not a participant', async () => {
    conversationParticipantFindUnique.mockResolvedValue(null);

    await expect(markConversationRead('user-1', 'convo-1')).rejects.toThrow(
      ForbiddenError
    );
    expect(conversationParticipantUpdate).not.toHaveBeenCalled();
  });

  it('updates lastReadAt for the participant', async () => {
    conversationParticipantFindUnique.mockResolvedValue({
      id: 'participant-1',
    });

    await markConversationRead('user-1', 'convo-1');

    expect(conversationParticipantUpdate).toHaveBeenCalledWith({
      where: { id: 'participant-1' },
      data: { lastReadAt: expect.any(Date) },
    });
  });
});
