import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenError, ValidationError } from '../../utils/errors';

const conversationParticipantFindUnique = vi.fn();
const messageCreate = vi.fn();
const conversationUpdate = vi.fn();
const transaction = vi.fn();
const sanitizeHtml = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    conversationParticipant: {
      findUnique: (...args: unknown[]) =>
        conversationParticipantFindUnique(...args),
    },
    message: {
      create: (...args: unknown[]) => messageCreate(...args),
    },
    conversation: {
      update: (...args: unknown[]) => conversationUpdate(...args),
    },
    $transaction: (...args: unknown[]) => transaction(...args),
  },
}));

vi.mock('../../utils/sanitize', () => ({
  sanitizeHtml: (...args: unknown[]) => sanitizeHtml(...args),
}));

const { sendMessage } = await import('../mutations');

describe('sendMessage', () => {
  beforeEach(() => {
    conversationParticipantFindUnique.mockReset();
    messageCreate.mockReset();
    conversationUpdate.mockReset();
    transaction.mockReset();
    sanitizeHtml.mockReset().mockReturnValue(null);
  });

  it('throws ForbiddenError when the user is not a participant', async () => {
    conversationParticipantFindUnique.mockResolvedValue(null);

    await expect(
      sendMessage('user-1', 'convo-1', { content: 'hi' })
    ).rejects.toThrow(ForbiddenError);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('throws ValidationError when content is empty', async () => {
    conversationParticipantFindUnique.mockResolvedValue({
      id: 'participant-1',
    });

    await expect(
      sendMessage('user-1', 'convo-1', { content: '   ' })
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when content exceeds 5000 characters', async () => {
    conversationParticipantFindUnique.mockResolvedValue({
      id: 'participant-1',
    });

    await expect(
      sendMessage('user-1', 'convo-1', { content: 'a'.repeat(5001) })
    ).rejects.toThrow(ValidationError);
  });

  it('sanitizes HTML and sends the message within a transaction', async () => {
    conversationParticipantFindUnique.mockResolvedValue({
      id: 'participant-1',
    });
    sanitizeHtml.mockReturnValue('<p>clean</p>');
    messageCreate.mockReturnValue({ __op: 'create-message' });
    conversationUpdate.mockReturnValue({ __op: 'update-conversation' });
    const message = { id: 'msg-1', content: 'hello', sender: { id: 'user-1' } };
    transaction.mockResolvedValue([message, { id: 'convo-1' }]);

    const result = await sendMessage('user-1', 'convo-1', {
      content: 'hello',
      contentHtml: '<script>bad</script><p>clean</p>',
    });

    expect(sanitizeHtml).toHaveBeenCalledWith(
      '<script>bad</script><p>clean</p>'
    );
    expect(messageCreate).toHaveBeenCalledWith({
      data: {
        conversationId: 'convo-1',
        senderId: 'user-1',
        content: 'hello',
        contentHtml: '<p>clean</p>',
      },
      include: { sender: { select: expect.any(Object) } },
    });
    expect(conversationUpdate).toHaveBeenCalledWith({
      where: { id: 'convo-1' },
      data: { lastMessageAt: expect.any(Date) },
    });
    expect(transaction).toHaveBeenCalledWith([
      { __op: 'create-message' },
      { __op: 'update-conversation' },
    ]);
    expect(result).toBe(message);
  });
});
