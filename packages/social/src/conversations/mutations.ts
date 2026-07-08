import { db } from '@scilent-one/db';
import type { ConversationSummary } from '../types';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors';
import { isMutualFollow, getConversationSummary } from './queries';

/**
 * Finds the existing 1:1 conversation between `userId` and `recipientId`,
 * or creates one. Only mutual followers may start a new conversation; once a
 * conversation exists, it stays accessible even if one side later unfollows.
 */
export async function getOrCreateDirectConversation(
  userId: string,
  recipientId: string
): Promise<ConversationSummary> {
  if (userId === recipientId) {
    throw new ValidationError('You cannot start a conversation with yourself');
  }

  const recipient = await db.user.findUnique({ where: { id: recipientId } });
  if (!recipient) {
    throw new NotFoundError('User');
  }

  const existing = await db.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
    include: { participants: true },
  });

  // Only treat it as the existing DM if it's strictly 1:1 between these two users
  const existingDirect =
    existing && existing.participants.length === 2 ? existing : null;

  if (existingDirect) {
    return getConversationSummary(userId, existingDirect.id);
  }

  const mutual = await isMutualFollow(userId, recipientId);
  if (!mutual) {
    throw new ForbiddenError('You can only message users who follow you back');
  }

  const conversation = await db.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: recipientId }],
      },
    },
  });

  return getConversationSummary(userId, conversation.id);
}

/**
 * Marks all messages in a conversation as read for the given user by
 * bumping their `lastReadAt` to now.
 */
export async function markConversationRead(
  userId: string,
  conversationId: string
): Promise<void> {
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });

  if (!participant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }

  await db.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });
}
