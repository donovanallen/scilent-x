'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter } from '../card';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { UserAvatar } from './user-avatar';
import { cn } from '../../utils';

export interface PostFormProps {
  user?: {
    name?: string | null | undefined;
    username?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    image?: string | null | undefined;
  };
  placeholder?: string;
  maxLength?: number;
  isSubmitting?: boolean;
  onSubmit: (content: string) => void | Promise<void>;
  className?: string;
}

export function PostForm({
  user,
  placeholder = "What's on your mind?",
  maxLength = 5000,
  isSubmitting = false,
  onSubmit,
  className,
}: PostFormProps) {
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
  const isNearLimit = charactersRemaining <= 100;

  return (
    <Card className={cn('', className)}>
      <form onSubmit={handleSubmit}>
        <CardContent className='pt-4'>
          <div className='flex gap-3'>
            {user && (
              <UserAvatar
                name={user.name}
                username={user.username}
                avatarUrl={user.avatarUrl}
                image={user.image}
                size='md'
              />
            )}
            <div className='flex-1'>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className='min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex items-center justify-between border-t pt-3'>
          <div
            className={cn(
              'text-sm text-muted-foreground',
              isNearLimit && 'text-yellow-600',
              isOverLimit && 'text-destructive'
            )}
          >
            {isNearLimit && (
              <span>{charactersRemaining} characters remaining</span>
            )}
          </div>
          <Button
            type='submit'
            disabled={!content.trim() || isOverLimit || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
