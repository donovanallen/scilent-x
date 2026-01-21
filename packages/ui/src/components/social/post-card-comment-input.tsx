'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '../button';
import { SimpleTiptapEditor } from '../simple-tiptap-editor';
import { type MentionSuggestion } from '../mention-list';
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
  onSubmit: (content: string, contentHtml: string) => void | Promise<void>;
  onCancel?: () => void;
  /** Callback to search for mention suggestions */
  onMentionQuery?:
    | ((query: string) => Promise<MentionSuggestion[]>)
    | undefined;
  /** Callback to search for artist mention suggestions */
  onArtistMentionQuery?:
    | ((query: string) => Promise<MentionSuggestion[]>)
    | undefined;
  className?: string;
}

export function PostCardCommentInput({
  user,
  placeholder = 'Write a comment...',
  maxLength = 2000,
  isSubmitting = false,
  // autoFocus = true,
  onSubmit,
  onCancel,
  onMentionQuery,
  onArtistMentionQuery,
  className,
}: PostCardCommentInputProps) {
  const [content, setContent] = React.useState('');
  const [contentHtml, setContentHtml] = React.useState('');
  const [editorKey, setEditorKey] = React.useState(0);

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

  const handleEditorChange = React.useCallback((text: string, html: string) => {
    setContent(text);
    setContentHtml(html);
  }, []);

  const handleSubmit = React.useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content, contentHtml);
    setContent('');
    setContentHtml('');
    setEditorKey((prev) => prev + 1);
  }, [content, contentHtml, isSubmitting, onSubmit]);

  const canSubmit =
    content.trim().length > 0 && content.length <= maxLength && !isSubmitting;

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
        <SimpleTiptapEditor
          key={editorKey}
          value={content}
          onChange={handleEditorChange}
          placeholder={placeholder}
          className="min-h-[44px] max-h-[120px] resize-none text-sm [&_.simple-tiptap-editor-content]:min-h-[32px] [&_.simple-tiptap-editor-content]:py-2 [&_.simple-tiptap-editor-content]:px-3"
          readOnly={isSubmitting}
          maxLength={maxLength}
          editorKey={editorKey}
          onMentionQuery={onMentionQuery}
          onArtistMentionQuery={onArtistMentionQuery}
          onSubmit={handleSubmit}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-11 w-11 sm:h-10 sm:w-10 p-0 shrink-0 active:scale-95 transition-transform"
          disabled={!canSubmit}
          onClick={handleSubmit}
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
