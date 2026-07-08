'use client';

import {
  Button,
  MessageComposer,
  MessageThread,
  Skeleton,
  UserAvatar,
  useInfiniteScroll,
} from '@scilent-one/ui';
import { ArrowLeft } from 'lucide-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect, useRef, useState, use } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { fetcher } from '@/lib/swr';

import { CONVERSATIONS_KEY } from '../layout';

interface MessageSender {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  image: string | null;
}

interface MessageDto {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: MessageSender;
}

interface PaginatedMessages {
  items: MessageDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface ConversationDetail {
  id: string;
  otherParticipant: MessageSender;
  unreadCount: number;
}

interface CurrentUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  avatarUrl: string | null;
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useTransitionRouter();

  const { data: currentUser } = useSWR<CurrentUser>(
    '/api/v1/users/me',
    fetcher
  );
  const { data: conversation, error: conversationError } =
    useSWR<ConversationDetail>(`/api/v1/conversations/${id}`, fetcher);

  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitially = useRef(false);

  const fetchMessages = useCallback(
    async (cursorParam?: string) => {
      const setLoading = cursorParam ? setIsLoadingMore : setIsLoadingMessages;
      setLoading(true);
      try {
        const url = new URL(
          `/api/v1/conversations/${id}/messages`,
          window.location.origin
        );
        if (cursorParam) {
          url.searchParams.set('cursor', cursorParam);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch messages');

        const data: PaginatedMessages = await res.json();
        // API returns newest-first; reverse to chronological order and prepend older pages
        const chronological = [...data.items].reverse();
        setMessages((prev) =>
          cursorParam ? [...chronological, ...prev] : chronological
        );
        setHasMoreMessages(data.hasMore);
        setMessagesCursor(data.nextCursor);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationError) return;
    console.error('Failed to load conversation:', conversationError);
    toast.error('Conversation not found');
    router.push('/messages');
  }, [conversationError, router]);

  // Scroll to the latest message once the initial page has loaded
  useEffect(() => {
    if (
      !hasScrolledInitially.current &&
      messages.length > 0 &&
      !isLoadingMessages
    ) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      hasScrolledInitially.current = true;
    }
  }, [messages.length, isLoadingMessages]);

  // Mark the conversation as read once it's loaded
  useEffect(() => {
    if (!conversation) return;
    fetch(`/api/v1/conversations/${id}/read`, { method: 'PATCH' }).catch(
      (error) => console.error('Failed to mark conversation as read:', error)
    );
  }, [id, conversation]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore: hasMoreMessages,
    isLoading: isLoadingMore,
    onLoadMore: () => {
      if (messagesCursor) void fetchMessages(messagesCursor);
    },
  });

  const handleSend = async (content: string) => {
    setIsSending(true);
    try {
      const res = await fetch(`/api/v1/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const newMessage: MessageDto = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      requestAnimationFrame(() =>
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      );
      // Refresh the inbox list so ordering / last message / unread reflect this send
      mutate(CONVERSATIONS_KEY);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation && !conversationError) {
    return (
      <div className='flex flex-col h-full p-4 space-y-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-full' />
          <Skeleton className='h-4 w-32' />
        </div>
        <Skeleton className='h-full w-full' />
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='flex items-center gap-3 p-3 border-b shrink-0'>
        <Button
          variant='ghost'
          size='icon'
          className='sm:hidden'
          onClick={() => router.push('/messages')}
        >
          <ArrowLeft className='h-4 w-4' />
          <span className='sr-only'>Back to messages</span>
        </Button>
        <UserAvatar
          name={conversation.otherParticipant.name}
          username={conversation.otherParticipant.username}
          avatarUrl={conversation.otherParticipant.avatarUrl}
          image={conversation.otherParticipant.image}
          size='sm'
        />
        <div className='min-w-0'>
          <p className='font-medium text-sm truncate'>
            {conversation.otherParticipant.name ||
              conversation.otherParticipant.username ||
              'Anonymous'}
          </p>
          {conversation.otherParticipant.username && (
            <p className='text-xs text-muted-foreground truncate'>
              @{conversation.otherParticipant.username}
            </p>
          )}
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto'>
        <MessageThread
          messages={messages.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
            sender: message.sender,
          }))}
          currentUserId={currentUser?.id ?? ''}
          isLoading={isLoadingMessages || isLoadingMore}
          hasMore={hasMoreMessages}
          loadMoreRef={sentinelRef}
          bottomRef={bottomRef}
        />
      </div>

      <MessageComposer isSubmitting={isSending} onSubmit={handleSend} />
    </div>
  );
}
