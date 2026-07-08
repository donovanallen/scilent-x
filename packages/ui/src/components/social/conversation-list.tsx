'use client';

import * as React from 'react';
import { Inbox } from 'lucide-react';
import {
  ConversationListItem,
  type ConversationListItemProps,
} from './conversation-list-item';
import { Skeleton } from '../skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '../empty';
import { cn } from '../../utils';

export interface ConversationListProps {
  conversations: Omit<ConversationListItemProps, 'isActive' | 'onClick'>[];
  activeConversationId?: string | null | undefined;
  currentUserId?: string | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  onConversationClick?: ((conversationId: string) => void) | undefined;
  className?: string;
}

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function ConversationList({
  conversations,
  activeConversationId,
  currentUserId,
  isLoading = false,
  hasMore = false,
  loadMoreRef,
  onConversationClick,
  className,
}: ConversationListProps) {
  const isInitialLoading = isLoading && conversations.length === 0;

  if (isInitialLoading) {
    return (
      <div className={cn('space-y-1', className)}>
        <ConversationSkeleton />
        <ConversationSkeleton />
        <ConversationSkeleton />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Empty className={className}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No messages yet</EmptyTitle>
          <EmptyDescription>
            When you message a mutual follower, your conversations will appear
            here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          {...conversation}
          currentUserId={currentUserId}
          isActive={conversation.id === activeConversationId}
          onClick={() => onConversationClick?.(conversation.id)}
        />
      ))}

      {isLoading && <ConversationSkeleton />}

      {hasMore && !isLoading && <div ref={loadMoreRef} className="h-10" />}
    </div>
  );
}
