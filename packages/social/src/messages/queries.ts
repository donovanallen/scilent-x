import { db } from '@scilent-one/db';
import type {
  PaginationParams,
  PaginatedResult,
  MessageWithSender,
} from '../types';
import {
  getPaginationParams,
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
} from '../utils/pagination';
import { ForbiddenError } from '../utils/errors';

const senderSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
  profileType: true,
} as const;

async function assertParticipant(
  userId: string,
  conversationId: string
): Promise<void> {
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });

  if (!participant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }
}

/**
 * Returns messages for a conversation, most recent first. Throws
 * `ForbiddenError` if the requesting user is not a participant.
 */
export async function getMessages(
  userId: string,
  conversationId: string,
  params: PaginationParams = {}
): Promise<PaginatedResult<MessageWithSender>> {
  await assertParticipant(userId, conversationId);

  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const messages = await db.message.findMany({
    where: { conversationId },
    include: { sender: { select: senderSelect } },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  return createPaginatedResult(messages, limit);
}
