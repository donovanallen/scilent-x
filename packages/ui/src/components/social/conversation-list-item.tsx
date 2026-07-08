'use client';

import * as React from 'react';
import { UserAvatar } from './user-avatar';
import { Badge } from '../badge';
import { cn } from '../../utils';

export interface ConversationListItemParticipant {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  image: string | null;
}

export interface ConversationListItemLastMessage {
  content: string;
  senderId: string;
  createdAt: Date | string;
}

export interface ConversationListItemProps {
  id: string;
  otherParticipant: ConversationListItemParticipant;
  lastMessage?: ConversationListItemLastMessage | null | undefined;
  unreadCount?: number;
  /** The current user's id, used to prefix "You: " on the sender's own last message */
  currentUserId?: string | undefined;
  isActive?: boolean;
  onClick?: (() => void) | undefined;
  className?: string;
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return then.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function ConversationListItem({
  otherParticipant,
  lastMessage,
  unreadCount = 0,
  currentUserId,
  isActive = false,
  onClick,
  className,
}: ConversationListItemProps) {
  const hasUnread = unreadCount > 0;
  const displayName =
    otherParticipant.name || otherParticipant.username || 'Anonymous';

  const preview = lastMessage
    ? `${lastMessage.senderId === currentUserId ? 'You: ' : ''}${lastMessage.content}`
    : 'Start the conversation';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
        isActive && 'bg-accent hover:bg-accent',
        className
      )}
    >
      <UserAvatar
        name={otherParticipant.name}
        username={otherParticipant.username}
        avatarUrl={otherParticipant.avatarUrl}
        image={otherParticipant.image}
        size="md"
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-sm truncate',
              hasUnread ? 'font-semibold' : 'font-medium'
            )}
          >
            {displayName}
          </span>
          {lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {formatRelativeTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              'text-sm truncate',
              hasUnread
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            {preview}
          </p>
          {hasUnread && (
            <Badge
              variant="default"
              className="h-5 min-w-5 px-1.5 justify-center shrink-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
