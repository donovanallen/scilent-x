'use client';

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@scilent-one/ui';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className='flex flex-1 items-center justify-center h-full'>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <MessageSquare aria-hidden='true' />
          </EmptyMedia>
          <EmptyTitle>Select a conversation</EmptyTitle>
          <EmptyDescription>
            Choose a conversation from the list to start chatting.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
