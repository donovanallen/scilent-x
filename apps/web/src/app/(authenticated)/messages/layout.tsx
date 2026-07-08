'use client';

import {
  ConversationList,
  cn,
  useInfiniteScroll,
  type ConversationListItemProps,
} from '@scilent-one/ui';
import { usePathname } from 'next/navigation';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import { fetcher } from '@/lib/swr';

export const CONVERSATIONS_KEY = '/api/v1/conversations';

type ConversationSummary = Omit<
  ConversationListItemProps,
  'isActive' | 'onClick' | 'currentUserId'
>;

interface PaginatedConversations {
  items: ConversationSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface CurrentUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  avatarUrl: string | null;
}

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const segments = pathname.split('/').filter(Boolean);
  const activeConversationId = segments[1] ?? null;

  const { data: currentUser } = useSWR<CurrentUser>(
    '/api/v1/users/me',
    fetcher
  );

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data: firstPage,
    isLoading,
    error,
  } = useSWR<PaginatedConversations>(CONVERSATIONS_KEY, fetcher);

  useEffect(() => {
    if (!firstPage) return;
    setConversations(firstPage.items);
    setHasMore(firstPage.hasMore);
    setCursor(firstPage.nextCursor);
  }, [firstPage]);

  useEffect(() => {
    if (!error) return;
    console.error('Failed to load conversations:', error);
    toast.error('Failed to load messages');
  }, [error]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `${CONVERSATIONS_KEY}?cursor=${encodeURIComponent(cursor)}`
      );
      if (!res.ok) throw new Error('Failed to load conversations');

      const data: PaginatedConversations = await res.json();
      setConversations((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    } catch (loadError) {
      console.error('Failed to load more conversations:', loadError);
      toast.error('Failed to load more conversations');
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: () => void loadMore(),
  });

  const showListOnMobile = !activeConversationId;

  return (
    <div className='flex h-full min-h-0 rounded-lg border overflow-hidden'>
      <div
        className={cn(
          'w-full sm:w-80 shrink-0 sm:border-r overflow-y-auto',
          !showListOnMobile && 'hidden sm:block'
        )}
      >
        <div className='p-4 border-b'>
          <h1 className='font-semibold text-lg'>Messages</h1>
        </div>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          currentUserId={currentUser?.id}
          isLoading={isLoading && conversations.length === 0}
          hasMore={hasMore}
          loadMoreRef={sentinelRef}
          onConversationClick={(id) => router.push(`/messages/${id}`)}
          className='p-2'
        />
      </div>
      <div
        className={cn(
          'flex-1 min-w-0 flex flex-col',
          showListOnMobile && 'hidden sm:flex'
        )}
      >
        {children}
      </div>
    </div>
  );
}
