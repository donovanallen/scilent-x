import { db } from '@scilent-one/db';
import type { CreateMessageInput, MessageWithSender } from '../types';
import { ForbiddenError, ValidationError } from '../utils/errors';
import { sanitizeHtml } from '../utils/sanitize';

const senderSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
} as const;

const MAX_MESSAGE_LENGTH = 5000;

/**
 * Sends a message in an existing conversation. Reuses the same content
 * rules as posts (length limit + HTML sanitization) — no new message-specific
 * content requirements for v1.
 */
export async function sendMessage(
  userId: string,
  conversationId: string,
  input: CreateMessageInput
): Promise<MessageWithSender> {
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });

  if (!participant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }

  if (!input.content.trim()) {
    throw new ValidationError('Message content cannot be empty');
  }

  if (input.content.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(
      `Message content cannot exceed ${MAX_MESSAGE_LENGTH} characters`
    );
  }

  const sanitizedHtml = sanitizeHtml(input.contentHtml);

  const [message] = await db.$transaction([
    db.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: input.content,
        contentHtml: sanitizedHtml,
      },
      include: { sender: { select: senderSelect } },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
}
