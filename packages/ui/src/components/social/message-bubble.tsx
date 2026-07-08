'use client';

import * as React from 'react';
import { UserAvatar } from './user-avatar';
import { cn } from '../../utils';

export interface MessageBubbleSender {
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  image: string | null;
}

export interface MessageBubbleProps {
  id: string;
  content: string;
  createdAt: Date | string;
  isOwnMessage: boolean;
  sender?: MessageBubbleSender | undefined;
  /** Whether to render the avatar for this message (e.g. the first message in a run from the same sender) */
  showAvatar?: boolean;
  className?: string;
}

function formatMessageTime(date: Date | string): string {
  const then = new Date(date);
  return then.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function MessageBubble({
  content,
  createdAt,
  isOwnMessage,
  sender,
  showAvatar = true,
  className,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isOwnMessage ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isOwnMessage && (
        <div className="w-8 shrink-0">
          {showAvatar && sender && (
            <UserAvatar
              name={sender.name}
              username={sender.username}
              avatarUrl={sender.avatarUrl}
              image={sender.image}
              size="sm"
            />
          )}
        </div>
      )}
      <div
        className={cn(
          'group flex flex-col gap-0.5 max-w-[75%] sm:max-w-[65%]',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words',
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          )}
        >
          {content}
        </div>
        <span className="text-xs text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatMessageTime(createdAt)}
        </span>
      </div>
    </div>
  );
}
