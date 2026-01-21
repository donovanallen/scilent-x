'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { UserAvatar } from './user-avatar';
import { cn } from '../../utils';

export interface PostCardCommentInputUser {
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
}

export interface PostCardCommentInputProps {
  user?: PostCardCommentInputUser;
  placeholder?: string;
  maxLength?: number;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  onSubmit: (content: string) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function PostCardCommentInput({
  user,
  placeholder = 'Write a comment...',
  maxLength = 2000,
  isSubmitting = false,
  autoFocus = true,
  onSubmit,
  onCancel,
  className,
}: PostCardCommentInputProps) {
  const [content, setContent] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-focus when mounted if autoFocus is true
  React.useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  // Handle escape key to cancel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charactersRemaining = maxLength - content.length;
  const isOverLimit = charactersRemaining < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  return (
    <div
      className={cn(
        'flex gap-3 pt-3 animate-in slide-in-from-top-2 fade-in-0 duration-200',
        className
      )}
    >
      {user && (
        <UserAvatar
          name={user.name}
          username={user.username}
          avatarUrl={user.avatarUrl}
          image={user.image}
          size="sm"
        />
      )}
      <div className="flex-1 flex gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[44px] max-h-[120px] resize-none text-base sm:text-sm py-2.5 sm:py-2"
          disabled={isSubmitting}
          rows={1}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-11 w-11 sm:h-10 sm:w-10 p-0 shrink-0 active:scale-95 transition-transform"
          disabled={!canSubmit}
          onClick={() => handleSubmit()}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Send className="h-5 w-5 sm:h-4 sm:w-4" />
          )}
          <span className="sr-only">Send comment</span>
        </Button>
      </div>
    </div>
  );
}
