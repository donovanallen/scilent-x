import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

const followFindUnique = vi.fn();
const conversationFindUnique = vi.fn();
const conversationFindMany = vi.fn();
const messageCount = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    follow: {
      findUnique: (...args: unknown[]) => followFindUnique(...args),
    },
    conversation: {
      findUnique: (...args: unknown[]) => conversationFindUnique(...args),
      findMany: (...args: unknown[]) => conversationFindMany(...args),
    },
    message: {
      count: (...args: unknown[]) => messageCount(...args),
    },
  },
}));

const {
  isMutualFollow,
  getConversationById,
  getConversationSummary,
  getInboxConversations,
} = await import('../queries');

describe('isMutualFollow', () => {
  beforeEach(() => {
    followFindUnique.mockReset();
  });

  it('returns true when both users follow each other', async () => {
    followFindUnique.mockResolvedValue({ id: 'follow-1' });

    await expect(isMutualFollow('user-a', 'user-b')).resolves.toBe(true);
  });

  it('returns false when only one user follows the other', async () => {
    followFindUnique
      .mockResolvedValueOnce({ id: 'follow-1' })
      .mockResolvedValueOnce(null);

    await expect(isMutualFollow('user-a', 'user-b')).resolves.toBe(false);
  });

  it('returns false when neither user follows the other', async () => {
    followFindUnique.mockResolvedValue(null);

    await expect(isMutualFollow('user-a', 'user-b')).resolves.toBe(false);
  });
});

describe('getConversationById', () => {
  beforeEach(() => {
    conversationFindUnique.mockReset();
  });

  it('throws NotFoundError when the conversation does not exist', async () => {
    conversationFindUnique.mockResolvedValue(null);

    await expect(getConversationById('user-1', 'convo-1')).rejects.toThrow(
      NotFoundError
    );
  });

  it('throws ForbiddenError when the user is not a participant', async () => {
    conversationFindUnique.mockResolvedValue({
      id: 'convo-1',
      participants: [{ userId: 'other-user' }],
    });

    await expect(getConversationById('user-1', 'convo-1')).rejects.toThrow(
      ForbiddenError
    );
  });

  it('returns the conversation when the user is a participant', async () => {
    const conversation = {
      id: 'convo-1',
      participants: [{ userId: 'user-1' }, { userId: 'user-2' }],
    };
    conversationFindUnique.mockResolvedValue(conversation);

    await expect(getConversationById('user-1', 'convo-1')).resolves.toBe(
      conversation
    );
  });
});

describe('getConversationSummary', () => {
  beforeEach(() => {
    conversationFindUnique.mockReset();
    messageCount.mockReset();
  });

  it('throws NotFoundError when the conversation does not exist', async () => {
    conversationFindUnique.mockResolvedValue(null);

    await expect(getConversationSummary('user-1', 'convo-1')).rejects.toThrow(
      NotFoundError
    );
  });

  it('throws ForbiddenError when the user is not a participant', async () => {
    conversationFindUnique.mockResolvedValue({
      id: 'convo-1',
      participants: [{ userId: 'other-user' }],
      messages: [],
    });

    await expect(getConversationSummary('user-1', 'convo-1')).rejects.toThrow(
      ForbiddenError
    );
  });

  it('throws NotFoundError when there is no other participant', async () => {
    conversationFindUnique.mockResolvedValue({
      id: 'convo-1',
      participants: [{ userId: 'user-1', lastReadAt: null }],
      messages: [],
    });

    await expect(getConversationSummary('user-1', 'convo-1')).rejects.toThrow(
      NotFoundError
    );
  });

  it('builds a summary with unread count and last message', async () => {
    const lastMessage = { id: 'msg-1', content: 'hi' };
    conversationFindUnique.mockResolvedValue({
      id: 'convo-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      lastMessageAt: new Date('2024-01-02'),
      participants: [
        { userId: 'user-1', lastReadAt: new Date('2024-01-01') },
        { userId: 'user-2', user: { id: 'user-2', name: 'Bob' } },
      ],
      messages: [lastMessage],
    });
    messageCount.mockResolvedValue(3);

    const result = await getConversationSummary('user-1', 'convo-1');

    expect(result.unreadCount).toBe(3);
    expect(result.lastMessage).toBe(lastMessage);
    expect(result.otherParticipant).toEqual({ id: 'user-2', name: 'Bob' });
    expect(messageCount).toHaveBeenCalledWith({
      where: {
        conversationId: 'convo-1',
        senderId: { not: 'user-1' },
        createdAt: { gt: new Date('2024-01-01') },
      },
    });
  });

  it('returns null lastMessage when there are no messages', async () => {
    conversationFindUnique.mockResolvedValue({
      id: 'convo-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: null,
      participants: [
        { userId: 'user-1', lastReadAt: null },
        { userId: 'user-2', user: { id: 'user-2' } },
      ],
      messages: [],
    });
    messageCount.mockResolvedValue(0);

    const result = await getConversationSummary('user-1', 'convo-1');

    expect(result.lastMessage).toBeNull();
  });
});

describe('getInboxConversations', () => {
  beforeEach(() => {
    conversationFindMany.mockReset();
    messageCount.mockReset();
  });

  it('builds inbox summaries for each conversation', async () => {
    conversationFindMany.mockResolvedValue([
      {
        id: 'convo-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        lastMessageAt: new Date('2024-01-02'),
        participants: [
          { userId: 'user-1', lastReadAt: new Date('2024-01-01') },
          { userId: 'user-2', user: { id: 'user-2', name: 'Bob' } },
        ],
        messages: [{ id: 'msg-1' }],
      },
    ]);
    messageCount.mockResolvedValue(2);

    const result = await getInboxConversations('user-1', { limit: 20 });

    expect(result.items[0]?.unreadCount).toBe(2);
    expect(result.items[0]?.otherParticipant).toEqual({
      id: 'user-2',
      name: 'Bob',
    });
    expect(conversationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { participants: { some: { userId: 'user-1' } } },
      })
    );
  });

  it('reports zero unread count when the requesting user is not found as a participant', async () => {
    conversationFindMany.mockResolvedValue([
      {
        id: 'convo-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        participants: [{ userId: 'user-2', user: { id: 'user-2' } }],
        messages: [],
      },
    ]);

    const result = await getInboxConversations('user-1');

    expect(result.items[0]?.unreadCount).toBe(0);
    expect(messageCount).not.toHaveBeenCalled();
  });

  it('paginates using the provided cursor', async () => {
    conversationFindMany.mockResolvedValue([]);

    await getInboxConversations('user-1', { cursor: 'cursor-1', limit: 5 });

    expect(conversationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: 'cursor-1' }, skip: 1 })
    );
  });
});
