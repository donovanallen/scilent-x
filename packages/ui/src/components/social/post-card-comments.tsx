'use client';

import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../button';
import { CommentCard, type CommentCardProps } from './comment-card';
import {
  PostCardCommentInput,
  type PostCardCommentInputUser,
} from './post-card-comment-input';
import { cn } from '../../utils';

const MAX_VISIBLE_COMMENTS = 10;

export interface PostCardCommentsProps {
  /** Array of comments to display */
  comments: CommentCardProps[];
  /** Total number of comments (for "View all X comments" text) */
  totalCount?: number | undefined;
  /** Whether there are more comments beyond what's shown */
  hasMore?: boolean | undefined;
  /** Current user ID for determining ownership */
  currentUserId?: string | undefined;
  /** Current user for reply input */
  currentUser?: PostCardCommentInputUser | undefined;
  /** ID of the comment currently being replied to */
  replyingToCommentId?: string | null | undefined;
  /** Whether the reply is being submitted */
  isSubmittingReply?: boolean | undefined;
  /** Callback when "View all comments" is clicked */
  onViewAll?: (() => void) | undefined;
  /** Callback when a comment is liked */
  onLikeComment?: ((commentId: string) => void) | undefined;
  /** Callback when a comment is unliked */
  onUnlikeComment?: ((commentId: string) => void) | undefined;
  /** Called when user clicks reply button on a comment */
  onReplyComment?: ((commentId: string) => void) | undefined;
  /** Called when user submits a reply */
  onSubmitReply?:
    | ((commentId: string, content: string) => Promise<void>)
    | undefined;
  /** Called when user cancels replying */
  onCancelReply?: (() => void) | undefined;
  /** Callback when a comment is deleted */
  onDeleteComment?: ((commentId: string) => void) | undefined;
  /** Callback when a user mention is clicked */
  onMentionClick?: ((username: string) => void) | undefined;
  /** Callback when the comment author's avatar, name, or username is clicked */
  onAuthorClick?: ((authorUsername: string) => void) | undefined;
  className?: string | undefined;
}

export const PostCardComments = React.memo(function PostCardComments({
  comments,
  totalCount,
  hasMore = false,
  currentUserId,
  currentUser,
  replyingToCommentId,
  isSubmittingReply = false,
  onViewAll,
  onLikeComment,
  onUnlikeComment,
  onReplyComment,
  onSubmitReply,
  onCancelReply,
  onDeleteComment,
  onMentionClick,
  onAuthorClick,
  className,
}: PostCardCommentsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // No comments to show
  if (comments.length === 0) {
    return null;
  }

  const displayCount = totalCount ?? comments.length;
  const hasMultipleComments = comments.length > 1;
  const visibleComments = isExpanded
    ? comments.slice(0, MAX_VISIBLE_COMMENTS)
    : comments.slice(0, 1);
  const showViewAllButton =
    hasMore ||
    comments.length > MAX_VISIBLE_COMMENTS ||
    (isExpanded && onViewAll);

  return (
    <div className={cn('animate-in fade-in-0 duration-200', className)}>
      <CollapsiblePrimitive.Root open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Comments list */}
        <div className="space-y-3">
          {/* Always show the first comment */}
          {comments.length > 0 && (
            <CommentCardCompact
              comment={comments[0]!}
              currentUserId={currentUserId}
              currentUser={currentUser}
              isReplying={replyingToCommentId === comments[0]!.id}
              isSubmittingReply={isSubmittingReply}
              onLikeComment={onLikeComment}
              onUnlikeComment={onUnlikeComment}
              onReplyComment={onReplyComment}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              onDeleteComment={onDeleteComment}
              onMentionClick={onMentionClick}
              onAuthorClick={onAuthorClick}
            />
          )}

          {/* Collapsible section for additional comments */}
          <CollapsiblePrimitive.Content
            className={cn(
              'space-y-3 overflow-hidden',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
              'duration-200'
            )}
          >
            {visibleComments.slice(1).map((comment) => (
              <CommentCardCompact
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                currentUser={currentUser}
                isReplying={replyingToCommentId === comment.id}
                isSubmittingReply={isSubmittingReply}
                onLikeComment={onLikeComment}
                onUnlikeComment={onUnlikeComment}
                onReplyComment={onReplyComment}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                onDeleteComment={onDeleteComment}
                onMentionClick={onMentionClick}
                onAuthorClick={onAuthorClick}
              />
            ))}
          </CollapsiblePrimitive.Content>
        </div>

        {/* Toggle / View all buttons */}
        <div className="flex items-center gap-2 mt-2">
          {hasMultipleComments && !isExpanded && (
            <CollapsiblePrimitive.Trigger asChild>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                View all {displayCount} comments
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsiblePrimitive.Trigger>
          )}

          {isExpanded && (
            <>
              {showViewAllButton && onViewAll && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={onViewAll}
                >
                  View all {displayCount} comments
                </Button>
              )}
              <CollapsiblePrimitive.Trigger asChild>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Hide
                  <ChevronUp className="h-3 w-3 ml-1" />
                </Button>
              </CollapsiblePrimitive.Trigger>
            </>
          )}
        </div>
      </CollapsiblePrimitive.Root>
    </div>
  );
});

/**
 * Compact version of CommentCard for inline display
 */
const CommentCardCompact = React.memo(function CommentCardCompact({
  comment,
  currentUserId,
  currentUser,
  isReplying = false,
  isSubmittingReply = false,
  onLikeComment,
  onUnlikeComment,
  onReplyComment,
  onSubmitReply,
  onCancelReply,
  onDeleteComment,
  onMentionClick,
  onAuthorClick,
}: {
  comment: CommentCardProps;
  currentUserId?: string | undefined;
  currentUser?: PostCardCommentInputUser | undefined;
  isReplying?: boolean | undefined;
  isSubmittingReply?: boolean | undefined;
  onLikeComment?: ((commentId: string) => void) | undefined;
  onUnlikeComment?: ((commentId: string) => void) | undefined;
  onReplyComment?: ((commentId: string) => void) | undefined;
  onSubmitReply?:
    | ((commentId: string, content: string) => Promise<void>)
    | undefined;
  onCancelReply?: (() => void) | undefined;
  onDeleteComment?: ((commentId: string) => void) | undefined;
  onMentionClick?: ((username: string) => void) | undefined;
  onAuthorClick?: ((authorUsername: string) => void) | undefined;
}) {
  const isOwner = currentUserId === comment.author.id;

  const handleSubmitReply = React.useCallback(
    async (content: string) => {
      await onSubmitReply?.(comment.id, content);
    },
    [comment.id, onSubmitReply]
  );

  return (
    <div>
      <CommentCard
        {...comment}
        isOwner={isOwner}
        isReplying={isReplying}
        onLike={onLikeComment ? () => onLikeComment(comment.id) : undefined}
        onUnlike={
          onUnlikeComment ? () => onUnlikeComment(comment.id) : undefined
        }
        onReply={onReplyComment ? () => onReplyComment(comment.id) : undefined}
        onDelete={
          isOwner && onDeleteComment
            ? () => onDeleteComment(comment.id)
            : undefined
        }
        onMentionClick={onMentionClick}
        onAuthorClick={onAuthorClick}
      />
      {isReplying && currentUser && (
        <div className="ml-8 pl-4 border-l mt-2">
          <PostCardCommentInput
            user={currentUser}
            placeholder={`Reply to ${comment.author.name || comment.author.username || 'comment'}...`}
            isSubmitting={isSubmittingReply}
            onSubmit={handleSubmitReply}
            {...(onCancelReply && { onCancel: onCancelReply })}
          />
        </div>
      )}
    </div>
  );
});
