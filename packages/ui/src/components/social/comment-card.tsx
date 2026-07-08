'use client';

import * as React from 'react';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Pencil,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { UserAvatar } from './user-avatar';
import {
  RichTextContent,
  type ArtistMentionRenderProps,
} from '../rich-text-content';
import { SimpleTiptapEditor } from '../simple-tiptap-editor';
import { type MentionSuggestion } from '../mention-list';
import { cn } from '../../utils';

export interface CommentCardAuthor {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  image: string | null;
}

export interface CommentCardProps {
  id: string;
  content: string;
  contentHtml?: string | null | undefined;
  author: CommentCardAuthor;
  createdAt: Date | string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean | undefined;
  isOwner?: boolean | undefined;
  isReply?: boolean | undefined;
  /** Whether the reply input is currently open for this comment */
  isReplying?: boolean | undefined;
  /** Whether the comment is currently in edit mode */
  isEditing?: boolean | undefined;
  /** Whether the comment edit is being saved */
  isSavingEdit?: boolean | undefined;
  onLike?: (() => void) | undefined;
  onUnlike?: (() => void) | undefined;
  onReply?: (() => void) | undefined;
  onEdit?: (() => void) | undefined;
  /** Called when the user saves edited content */
  onSaveEdit?:
    ((content: string, contentHtml: string) => Promise<void>) | undefined;
  /** Called when the user cancels editing */
  onCancelEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  /** Callback when a user mention (@username) is clicked */
  onMentionClick?: ((username: string) => void) | undefined;
  /** Callback when an artist mention is clicked */
  onArtistMentionClick?:
    ((artistId: string, provider: string) => void) | undefined;
  /** Custom renderer for artist mentions */
  renderArtistMention?:
    ((props: ArtistMentionRenderProps) => React.ReactNode) | undefined;
  /** Callback when the author's avatar, name, or username is clicked */
  onAuthorClick?: ((authorUsername: string) => void) | undefined;
  /** Callback to search for mention suggestions (for edit mode) */
  onMentionQuery?:
    ((query: string) => Promise<MentionSuggestion[]>) | undefined;
  /** Callback to search for artist mention suggestions (for edit mode) */
  onArtistMentionQuery?:
    ((query: string) => Promise<MentionSuggestion[]>) | undefined;
  className?: string | undefined;
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return then.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function CommentCard({
  // id,
  content,
  contentHtml,
  author,
  createdAt,
  likesCount,
  repliesCount,
  isLiked = false,
  isOwner = false,
  isReply = false,
  isReplying = false,
  isEditing = false,
  isSavingEdit = false,
  onLike,
  onUnlike,
  onReply,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onMentionClick,
  onArtistMentionClick,
  renderArtistMention,
  onAuthorClick,
  onMentionQuery,
  onArtistMentionQuery,
  className,
}: CommentCardProps) {
  const [editContent, setEditContent] = React.useState('');
  const [editContentHtml, setEditContentHtml] = React.useState('');
  const [hasEdited, setHasEdited] = React.useState(false);

  React.useEffect(() => {
    if (isEditing) {
      setEditContent(content);
      setEditContentHtml(contentHtml || '');
      setHasEdited(false);
    }
  }, [isEditing, content, contentHtml]);

  React.useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSavingEdit) {
        onCancelEdit?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isSavingEdit, onCancelEdit]);

  const handleEditorChange = React.useCallback((text: string, html: string) => {
    setEditContent(text);
    setEditContentHtml(html);
    setHasEdited(true);
  }, []);

  const handleLikeClick = () => {
    if (isLiked) {
      onUnlike?.();
    } else {
      onLike?.();
    }
  };

  const handleAuthorClick = () => {
    if (author.username && onAuthorClick) {
      onAuthorClick(author.username);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || isSavingEdit) return;
    await onSaveEdit?.(editContent, editContentHtml);
  };

  const handleCancelEdit = () => {
    if (isSavingEdit) return;
    onCancelEdit?.();
  };

  const canSave =
    editContent.trim().length > 0 && (hasEdited || editContent !== content);

  return (
    <div
      className={cn(
        'flex gap-3',
        isReply && 'ml-8 pl-4 border-l',
        // Subtle left border for current user's comments
        isOwner && !isReply && 'pl-3 border-l-2 border-l-brand/50',
        className
      )}
    >
      <button
        type="button"
        onClick={handleAuthorClick}
        className={cn(
          'rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          onAuthorClick && author.username && 'cursor-pointer'
        )}
        disabled={!onAuthorClick || !author.username}
      >
        <UserAvatar
          name={author.name}
          username={author.username}
          avatarUrl={author.avatarUrl}
          image={author.image}
          size={isReply ? 'sm' : 'md'}
        />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAuthorClick}
            className={cn(
              'font-semibold text-sm truncate focus:outline-none',
              onAuthorClick &&
                author.username &&
                'cursor-pointer hover:underline'
            )}
            disabled={!onAuthorClick || !author.username}
          >
            {author.name || author.username || 'Anonymous'}
          </button>
          {author.username && (
            <button
              type="button"
              onClick={handleAuthorClick}
              className={cn(
                'text-muted-foreground text-xs truncate focus:outline-none',
                onAuthorClick && 'cursor-pointer hover:underline'
              )}
              disabled={!onAuthorClick}
            >
              @{author.username}
            </button>
          )}
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatRelativeTime(createdAt)}
          </span>
          {isEditing && (
            <span className="text-primary text-xs font-medium">Editing</span>
          )}
          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto"
                >
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1 space-y-2">
            <SimpleTiptapEditor
              key={`edit-comment`}
              value={contentHtml || content}
              onChange={handleEditorChange}
              readOnly={isSavingEdit}
              maxLength={2000}
              onMentionQuery={onMentionQuery}
              onArtistMentionQuery={onArtistMentionQuery}
              className={cn(isSavingEdit && 'opacity-50')}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSavingEdit}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!canSave || isSavingEdit}
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <RichTextContent
              html={contentHtml}
              content={content}
              className="text-sm whitespace-pre-wrap break-words mt-1 [&.rich-text-content]:prose-sm"
              onMentionClick={onMentionClick}
              onArtistMentionClick={onArtistMentionClick}
              renderArtistMention={renderArtistMention}
            />
            <div className="flex items-center gap-2 sm:gap-3 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 sm:h-7 gap-1 px-2 text-xs min-w-[40px] active:scale-95 transition-transform hover:opacity-80'
                )}
                onClick={handleLikeClick}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 sm:h-3 sm:w-3',
                    isLiked && 'fill-current'
                  )}
                />
                <span>{likesCount}</span>
              </Button>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 sm:h-7 gap-1 px-2 text-xs min-w-[40px] active:scale-95 transition-transform hover:opacity-80',
                    isReplying && 'text-primary'
                  )}
                  onClick={onReply}
                >
                  <MessageCircle
                    className={cn(
                      'h-3.5 w-3.5 sm:h-3 sm:w-3',
                      isReplying && 'fill-current'
                    )}
                  />
                  <span>{repliesCount}</span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
