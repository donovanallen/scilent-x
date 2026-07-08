'use client';

import * as React from 'react';
import { MessageCircle } from 'lucide-react';
import { MessageBubble, type MessageBubbleProps } from './message-bubble';
import { Skeleton } from '../skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '../empty';
import { cn } from '../../utils';

export interface MessageThreadMessage extends Omit<
  MessageBubbleProps,
  'isOwnMessage' | 'showAvatar'
> {
  senderId: string;
}

export interface MessageThreadProps {
  /** Messages in chronological order (oldest first) */
  messages: MessageThreadMessage[];
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  /** Sentinel placed above the oldest message, for loading older history on scroll-up */
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  /** Anchor placed after the last message, for scrolling to the bottom */
  bottomRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

function ThreadSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}
        >
          <Skeleton className="h-10 w-2/5 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export function MessageThread({
  messages,
  currentUserId,
  isLoading = false,
  hasMore = false,
  loadMoreRef,
  bottomRef,
  className,
}: MessageThreadProps) {
  if (isLoading && messages.length === 0) {
    return <ThreadSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <Empty className={className}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircle aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No messages yet</EmptyTitle>
          <EmptyDescription>
            Send a message to start the conversation.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1 p-4', className)}>
      {hasMore && <div ref={loadMoreRef} className="h-4" />}
      {isLoading && <ThreadSkeleton />}
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showAvatar = !previous || previous.senderId !== message.senderId;

        return (
          <MessageBubble
            key={message.id}
            {...message}
            isOwnMessage={message.senderId === currentUserId}
            showAvatar={showAvatar}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
