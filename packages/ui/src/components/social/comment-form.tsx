'use client';

import * as React from 'react';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { UserAvatar } from './user-avatar';
import { cn } from '../../utils';

export interface CommentFormProps {
  user?: {
    name?: string | null | undefined;
    username?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    image?: string | null | undefined;
  };
  placeholder?: string;
  maxLength?: number;
  isSubmitting?: boolean;
  isReply?: boolean;
  onSubmit: (content: string) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({
  user,
  placeholder = 'Write a comment...',
  maxLength = 2000,
  isSubmitting = false,
  isReply = false,
  onSubmit,
  onCancel,
  className,
}: CommentFormProps) {
  const [content, setContent] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content);
    setContent('');
  };

  const charactersRemaining = maxLength - content.length;
  const isOverLimit = charactersRemaining < 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex gap-3', isReply && 'ml-8', className)}
    >
      {user && (
        <UserAvatar
          name={user.name}
          username={user.username}
          avatarUrl={user.avatarUrl}
          image={user.image}
          size={isReply ? 'sm' : 'md'}
        />
      )}
      <div className='flex-1 space-y-2'>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className='min-h-[60px] resize-none'
          disabled={isSubmitting}
        />
        <div className='flex items-center justify-end gap-2'>
          {onCancel && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type='submit'
            size='sm'
            disabled={!content.trim() || isOverLimit || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </div>
    </form>
  );
}
