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
import { Card, CardContent, CardFooter, CardHeader } from '../card';
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
import { TiptapEditor } from '../tiptap-editor';
import { type MentionSuggestion } from '../mention-list';
import { type CommentCardProps } from './comment-card';
import {
  PostCardCommentInput,
  type PostCardCommentInputUser,
} from './post-card-comment-input';
import { PostCardComments } from './post-card-comments';
import { cn } from '../../utils';
import { Separator } from '../separator';

export interface PostCardAuthor {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  image: string | null;
}

export interface PostCardProps {
  id: string;
  content: string;
  contentHtml?: string | null;
  author: PostCardAuthor;
  createdAt: Date | string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isOwner?: boolean;
  /** Whether the post is currently in edit mode */
  isEditing?: boolean;
  /** Whether the post edit is being saved */
  isSaving?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
  /** Called when comment button is clicked (for navigation to post detail) */
  onComment?: () => void;
  /** Called when the user clicks the Edit button to enter edit mode */
  onEdit?: () => void;
  /** Called when the user saves edited content */
  onSaveEdit?:
    | ((content: string, contentHtml: string) => Promise<void>)
    | undefined;
  /** Called when the user cancels editing */
  onCancelEdit?: (() => void) | undefined;
  onDelete?: () => void;
  onClick?: () => void;
  /** Callback when the author's avatar, name, or username is clicked */
  onAuthorClick?: ((authorUsername: string) => void) | undefined;
  onMentionClick?: ((username: string) => void) | undefined;
  onArtistMentionClick?:
    | ((artistId: string, provider: string) => void)
    | undefined;
  /** Custom renderer for artist mentions (for interactive behaviors) */
  renderArtistMention?:
    | ((props: ArtistMentionRenderProps) => React.ReactNode)
    | undefined;
  /** Callback to search for mention suggestions (for edit mode) */
  onMentionQuery?:
    | ((query: string) => Promise<MentionSuggestion[]>)
    | undefined;
  /** Callback to search for artist mention suggestions (for edit mode) */
  onArtistMentionQuery?:
    | ((query: string) => Promise<MentionSuggestion[]>)
    | undefined;
  className?: string;

  // ---- Inline comments props ----
  /** Whether to show inline comments section */
  showComments?: boolean | undefined;
  /** Comments data to display inline */
  comments?: CommentCardProps[] | undefined;
  /** Whether there are more comments than what's shown */
  hasMoreComments?: boolean | undefined;
  /** Current user for the comment input */
  currentUser?: (PostCardCommentInputUser & { id: string }) | undefined;
  /** Whether a comment is currently being submitted */
  isSubmittingComment?: boolean | undefined;
  /** Called when user submits a new comment */
  onCreateComment?: ((content: string, contentHtml: string) => Promise<void>) | undefined;
  /** Called when "View all comments" is clicked */
  onViewAllComments?: (() => void) | undefined;
  /** Called when a comment is liked */
  onLikeComment?: ((commentId: string) => void) | undefined;
  /** Called when a comment is unliked */
  onUnlikeComment?: ((commentId: string) => void) | undefined;
  /** Called when user clicks reply button on a comment */
  onReplyComment?: ((commentId: string) => void) | undefined;
  /** Called when user submits a reply */
  onSubmitReply?:
    | ((commentId: string, content: string, contentHtml: string) => Promise<void>)
    | undefined;
  /** Called when user cancels replying */
  onCancelReply?: (() => void) | undefined;
  /** ID of the comment currently being replied to */
  replyingToCommentId?: string | null | undefined;
  /** Whether the reply is being submitted */
  isSubmittingReply?: boolean | undefined;
  /** Called when a comment is deleted */
  onDeleteComment?: ((commentId: string) => void) | undefined;
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

export function PostCard({
  id,
  content,
  contentHtml,
  author,
  createdAt,
  likesCount,
  commentsCount,
  isLiked = false,
  isOwner = false,
  isEditing = false,
  isSaving = false,
  onLike,
  onUnlike,
  onComment,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onClick,
  onAuthorClick,
  onMentionClick,
  onArtistMentionClick,
  renderArtistMention,
  onMentionQuery,
  onArtistMentionQuery,
  className,
  // Inline comments props
  showComments = false,
  comments = [],
  hasMoreComments = false,
  currentUser,
  isSubmittingComment = false,
  onCreateComment,
  onViewAllComments,
  onLikeComment,
  onUnlikeComment,
  onReplyComment,
  onSubmitReply,
  onCancelReply,
  replyingToCommentId,
  isSubmittingReply = false,
  onDeleteComment,
}: PostCardProps) {
  // Local state for edit content - tracks user's edits
  const [editContent, setEditContent] = React.useState('');
  const [editContentHtml, setEditContentHtml] = React.useState('');
  const [hasEdited, setHasEdited] = React.useState(false);
  const editorContainerRef = React.useRef<HTMLDivElement>(null);

  // State for inline comment input
  const [isCommenting, setIsCommenting] = React.useState(false);

  // Reset edit state when entering/exiting edit mode
  React.useEffect(() => {
    if (isEditing) {
      // Initialize with current content
      setEditContent(content);
      setEditContentHtml(contentHtml || '');
      setHasEdited(false);
    }
  }, [isEditing, content, contentHtml]);

  // Handle escape key to cancel editing
  React.useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onCancelEdit?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isSaving, onCancelEdit]);

  const handleEditorChange = React.useCallback((text: string, html: string) => {
    setEditContent(text);
    setEditContentHtml(html);
    setHasEdited(true);
  }, []);

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editContent.trim() || isSaving) return;
    await onSaveEdit?.(editContent, editContentHtml);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    onCancelEdit?.();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      onUnlike?.();
    } else {
      onLike?.();
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If we have inline comment support, toggle the comment input
    if (onCreateComment && currentUser) {
      setIsCommenting((prev) => !prev);
    } else {
      // Otherwise, use the navigation callback
      onComment?.();
    }
  };

  const handleCreateComment = React.useCallback(
    async (commentContent: string, commentContentHtml: string) => {
      await onCreateComment?.(commentContent, commentContentHtml);
      setIsCommenting(false);
    },
    [onCreateComment]
  );

  const handleCancelComment = React.useCallback(() => {
    setIsCommenting(false);
  }, []);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author.username && onAuthorClick) {
      onAuthorClick(author.username);
    }
  };

  // Can save if there's content and either:
  // 1. User has made edits and content is different from original, OR
  // 2. Content has been changed (for cases where hasEdited might not trigger)
  const canSave =
    editContent.trim().length > 0 && (hasEdited || editContent !== content);

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        onClick && !isEditing && 'cursor-pointer hover:bg-muted/50',
        isEditing && 'ring-2 ring-primary/20',
        className
      )}
      onClick={isEditing ? undefined : onClick}
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <button
          type="button"
          onClick={handleAuthorClick}
          className={cn(
            'rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            onAuthorClick && author.username && 'cursor-pointer'
          )}
          disabled={!onAuthorClick || !author.username || isEditing}
        >
          <UserAvatar
            name={author.name}
            username={author.username}
            avatarUrl={author.avatarUrl}
            image={author.image}
            size="md"
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAuthorClick}
              className={cn(
                'font-semibold truncate focus:outline-none',
                onAuthorClick &&
                  author.username &&
                  !isEditing &&
                  'cursor-pointer hover:underline'
              )}
              disabled={!onAuthorClick || !author.username || isEditing}
            >
              {author.name || author.username || 'Anonymous'}
            </button>
            {author.username && (
              <button
                type="button"
                onClick={handleAuthorClick}
                className={cn(
                  'text-muted-foreground text-sm truncate focus:outline-none',
                  onAuthorClick &&
                    !isEditing &&
                    'cursor-pointer hover:underline'
                )}
                disabled={!onAuthorClick || isEditing}
              >
                @{author.username}
              </button>
            )}
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              {formatRelativeTime(createdAt)}
            </span>
            {isEditing && (
              <span className="text-primary text-sm font-medium">Editing</span>
            )}
          </div>
        </div>
        {isOwner && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        {isEditing ? (
          <div
            ref={editorContainerRef}
            className="animate-in fade-in-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <TiptapEditor
              key={`edit-${id}`}
              value={contentHtml || ''}
              onChange={handleEditorChange}
              placeholder="What's on your mind?"
              readOnly={isSaving}
              maxLength={5000}
              onMentionQuery={onMentionQuery}
              onArtistMentionQuery={onArtistMentionQuery}
              mentionPlaceholder="Search for a user"
              artistMentionPlaceholder="Search for an artist"
              className={cn(isSaving && 'opacity-50')}
            />
          </div>
        ) : (
          <RichTextContent
            html={contentHtml}
            content={content}
            onMentionClick={onMentionClick}
            onArtistMentionClick={onArtistMentionClick}
            renderArtistMention={renderArtistMention}
          />
        )}
      </CardContent>
      <CardFooter className="pt-0 flex-col items-stretch">
        {isEditing ? (
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              Press Escape to cancel
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!canSave || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Action buttons - touch-friendly sizing */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1.5 px-2 touch-target active:scale-95 transition-transform',
                  isLiked && 'text-red-500 hover:text-red-600'
                )}
                onClick={handleLikeClick}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                <span className="text-sm">{likesCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn('gap-1.5 px-2 touch-target active:scale-95 transition-transform', isCommenting && 'text-primary')}
                onClick={handleCommentClick}
              >
                <MessageCircle
                  className={cn('h-4 w-4', isCommenting && 'fill-current')}
                />
                <span className="text-sm">{commentsCount}</span>
              </Button>
            </div>

            {/* Inline comment input */}
            {isCommenting && currentUser && (
              <div onClick={(e) => e.stopPropagation()}>
                <PostCardCommentInput
                  user={currentUser}
                  isSubmitting={isSubmittingComment}
                  onSubmit={handleCreateComment}
                  onCancel={handleCancelComment}
                  onMentionQuery={onMentionQuery}
                  onArtistMentionQuery={onArtistMentionQuery}
                />
              </div>
            )}

            {/* Inline comments section */}
            {showComments && comments.length > 0 && (
              <>
                <Separator className="my-4" />
                <div onClick={(e) => e.stopPropagation()}>
                  <PostCardComments
                    comments={comments}
                    totalCount={commentsCount}
                    hasMore={hasMoreComments}
                    currentUserId={currentUser?.id}
                    onViewAll={onViewAllComments}
                    currentUser={currentUser}
                    replyingToCommentId={replyingToCommentId}
                    isSubmittingReply={isSubmittingReply}
                    onLikeComment={onLikeComment}
                    onUnlikeComment={onUnlikeComment}
                    onReplyComment={onReplyComment}
                    onSubmitReply={onSubmitReply}
                    onCancelReply={onCancelReply}
                    onDeleteComment={onDeleteComment}
                    onMentionClick={onMentionClick}
                    onArtistMentionClick={onArtistMentionClick}
                    renderArtistMention={renderArtistMention}
                    onAuthorClick={onAuthorClick}
                    onMentionQuery={onMentionQuery}
                    onArtistMentionQuery={onArtistMentionQuery}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
