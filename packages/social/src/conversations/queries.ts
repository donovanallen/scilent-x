import { db } from '@scilent-one/db';
import type {
  PaginationParams,
  PaginatedResult,
  ConversationSummary,
  ConversationWithParticipants,
} from '../types';
import {
  getPaginationParams,
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
} from '../utils/pagination';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const participantSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
  profileType: true,
} as const;

/**
 * Two users can message each other only if they mutually follow each other
 * (each has a `Follow` row pointing at the other). No dedicated "friend" or
 * "block" model exists yet, so this is derived from the existing follow graph.
 */
export async function isMutualFollow(
  userIdA: string,
  userIdB: string
): Promise<boolean> {
  const [aFollowsB, bFollowsA] = await Promise.all([
    db.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userIdA, followingId: userIdB },
      },
    }),
    db.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userIdB, followingId: userIdA },
      },
    }),
  ]);

  return !!aFollowsB && !!bFollowsA;
}

/**
 * Fetches a conversation with its participants, throwing if the conversation
 * doesn't exist or the given user is not a participant.
 */
export async function getConversationById(
  userId: string,
  conversationId: string
): Promise<ConversationWithParticipants> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: { select: participantSelect } },
      },
    },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === userId
  );
  if (!isParticipant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }

  return conversation;
}

/**
 * Builds the inbox-list representation of a single conversation for a given
 * user: the other 1:1 participant, the most recent message, and how many
 * messages from the other participant are unread.
 */
export async function getConversationSummary(
  userId: string,
  conversationId: string
): Promise<ConversationSummary> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: { select: participantSelect } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: participantSelect } },
      },
    },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation');
  }

  const participant = conversation.participants.find(
    (p) => p.userId === userId
  );
  if (!participant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== userId
  );
  if (!otherParticipant) {
    throw new NotFoundError('Conversation participant');
  }

  const unreadCount = await db.message.count({
    where: {
      conversationId,
      senderId: { not: userId },
      ...(participant.lastReadAt && {
        createdAt: { gt: participant.lastReadAt },
      }),
    },
  });

  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt,
    otherParticipant: otherParticipant.user,
    lastMessage: conversation.messages[0] ?? null,
    unreadCount,
  };
}

/**
 * Returns the current user's inbox: all conversations they participate in,
 * most recently active first.
 */
export async function getInboxConversations(
  userId: string,
  params: PaginationParams = {}
): Promise<PaginatedResult<ConversationSummary>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const conversations = await db.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: {
        include: { user: { select: participantSelect } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: participantSelect } },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const items = await Promise.all(
    conversations.map(async (conversation) => {
      const participant = conversation.participants.find(
        (p) => p.userId === userId
      );
      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== userId
      );

      const unreadCount = participant
        ? await db.message.count({
            where: {
              conversationId: conversation.id,
              senderId: { not: userId },
              ...(participant.lastReadAt && {
                createdAt: { gt: participant.lastReadAt },
              }),
            },
          })
        : 0;

      return {
        id: conversation.id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        lastMessageAt: conversation.lastMessageAt,
        // Guaranteed to exist for 1:1 conversations returned by this query
        otherParticipant: otherParticipant!.user,
        lastMessage: conversation.messages[0] ?? null,
        unreadCount,
      };
    })
  );

  return createPaginatedResult(items, limit);
}
