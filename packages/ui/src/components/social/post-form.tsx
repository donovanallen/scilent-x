'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter } from '../card';
import { Button } from '../button';
import { UserAvatar } from './user-avatar';
import { TiptapEditor } from '../tiptap-editor';
import { type MentionSuggestion } from '../mention-list';
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
  onSubmit: (content: string, contentHtml: string) => void | Promise<void>;
  className?: string;
  /** Callback to search for mention suggestions */
  onMentionQuery?: (query: string) => Promise<MentionSuggestion[]>;
  /** Callback to search for artist mention suggestions */
  onArtistMentionQuery?: (query: string) => Promise<MentionSuggestion[]>;
}

export function PostForm({
  user,
  placeholder = "What's on your mind?",
  maxLength = 5000,
  isSubmitting = false,
  onSubmit,
  className,
  onMentionQuery,
  onArtistMentionQuery,
}: PostFormProps) {
  const [content, setContent] = React.useState('');
  const [contentHtml, setContentHtml] = React.useState('');
  // Key to force remount of the editor after submission to clear Tiptap's internal state
  const [editorKey, setEditorKey] = React.useState(0);

  const handleEditorChange = React.useCallback((text: string, html: string) => {
    setContent(text);
    setContentHtml(html);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content, contentHtml);
    setContent('');
    setContentHtml('');
    // Increment key to force editor remount and clear Tiptap's internal state
    setEditorKey((prev) => prev + 1);
  };

  const charactersRemaining = maxLength - content.length;
  const isOverLimit = charactersRemaining < 0;
  const isNearLimit = charactersRemaining <= 100;

  return (
    <Card className={cn('', className)}>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            {user && (
              <UserAvatar
                name={user.name}
                username={user.username}
                avatarUrl={user.avatarUrl}
                image={user.image}
                size="md"
              />
            )}
            <div className="flex-1">
              <TiptapEditor
                value={contentHtml}
                onChange={handleEditorChange}
                placeholder={placeholder}
                readOnly={isSubmitting}
                maxLength={maxLength}
                className="border-0"
                editorKey={editorKey}
                onMentionQuery={onMentionQuery}
                onArtistMentionQuery={onArtistMentionQuery}
                mentionPlaceholder="Search for a user"
                artistMentionPlaceholder="Search for an artist"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-3">
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
            type="submit"
            disabled={!content.trim() || isOverLimit || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
