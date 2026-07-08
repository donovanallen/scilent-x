'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { cn } from '../../utils';

export interface MessageComposerProps {
  placeholder?: string;
  maxLength?: number;
  isSubmitting?: boolean;
  /** Disables the composer entirely (e.g. no longer mutual followers) */
  disabled?: boolean;
  /** Message shown in place of the input when `disabled` is true */
  disabledMessage?: string;
  onSubmit: (content: string) => void | Promise<void>;
  className?: string;
}

export function MessageComposer({
  placeholder = 'Write a message...',
  maxLength = 5000,
  isSubmitting = false,
  disabled = false,
  disabledMessage,
  onSubmit,
  className,
}: MessageComposerProps) {
  const [content, setContent] = React.useState('');

  const handleSubmit = React.useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting || disabled) return;

    await onSubmit(trimmed);
    setContent('');
  }, [content, isSubmitting, disabled, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const canSubmit =
    content.trim().length > 0 &&
    content.length <= maxLength &&
    !isSubmitting &&
    !disabled;

  if (disabled && disabledMessage) {
    return (
      <div
        className={cn(
          'p-3 text-center text-sm text-muted-foreground border-t',
          className
        )}
      >
        {disabledMessage}
      </div>
    );
  }

  return (
    <div className={cn('flex items-end gap-2 p-3 border-t', className)}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isSubmitting || disabled}
        rows={1}
        className="flex-1 min-h-[44px] max-h-[160px] resize-none"
      />
      <Button
        type="button"
        size="icon"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="shrink-0"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}
