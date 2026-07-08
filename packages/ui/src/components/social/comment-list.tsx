'use client';

import * as React from 'react';
import { CommentCard, type CommentCardProps } from './comment-card';
import { CommentForm } from './comment-form';
import { Button } from '../button';
import { type ArtistMentionRenderProps } from '../rich-text-content';
import { type MentionSuggestion } from '../mention-list';
import { cn } from '../../utils';

export interface CommentListProps {
  comments: Array<
    CommentCardProps & { replies?: CommentCardProps[] | undefined }
  >;
  currentUser?:
    | {
        id: string;
        name?: string | null | undefined;
        username?: string | null | undefined;
        avatarUrl?: string | null | undefined;
        image?: string | null | undefined;
      }
    | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLikeComment?: (commentId: string) => void;
  onUnlikeComment?: (commentId: string) => void;
  onReplyComment?: (commentId: string, content: string) => void;
  /** Called to persist an edited comment. Resolving closes edit mode; throwing keeps it open. */
  onSaveEditComment?: (
    commentId: string,
    content: string,
    contentHtml: string
  ) => Promise<void>;
  onDeleteComment?: (commentId: string) => void;
  /** Callback when a user mention (@username) is clicked */
  onMentionClick?: ((username: string) => void) | undefined;
  /** Callback when an artist mention is clicked */
  onArtistMentionClick?:
    ((artistId: string, provider: string) => void) | undefined;
  /** Custom renderer for artist mentions */
  renderArtistMention?:
    ((props: ArtistMentionRenderProps) => React.ReactNode) | undefined;
  /** Callback to search for mention suggestions (used for edit mode) */
  onMentionQuery?:
    ((query: string) => Promise<MentionSuggestion[]>) | undefined;
  /** Callback to search for artist mention suggestions (used for edit mode) */
  onArtistMentionQuery?:
    ((query: string) => Promise<MentionSuggestion[]>) | undefined;
  className?: string;
}

export function CommentList({
  comments,
  currentUser,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onLikeComment,
  onUnlikeComment,
  onReplyComment,
  onSaveEditComment,
  onDeleteComment,
  onMentionClick,
  onArtistMentionClick,
  renderArtistMention,
  onMentionQuery,
  onArtistMentionQuery,
  className,
}: CommentListProps) {
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(
    null
  );
  const [savingCommentId, setSavingCommentId] = React.useState<string | null>(
    null
  );

  const handleSaveEdit = React.useCallback(
    async (commentId: string, content: string, contentHtml: string) => {
      if (!onSaveEditComment) return;
      setSavingCommentId(commentId);
      try {
        await onSaveEditComment(commentId, content, contentHtml);
        setEditingCommentId(null);
      } finally {
        setSavingCommentId(null);
      }
    },
    [onSaveEditComment]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          <CommentCard
            {...comment}
            isOwner={currentUser?.id === comment.author.id}
            isEditing={editingCommentId === comment.id}
            isSavingEdit={savingCommentId === comment.id}
            onLike={() => onLikeComment?.(comment.id)}
            onUnlike={() => onUnlikeComment?.(comment.id)}
            onReply={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            onEdit={() => setEditingCommentId(comment.id)}
            onSaveEdit={
              onSaveEditComment
                ? (content, contentHtml) =>
                    handleSaveEdit(comment.id, content, contentHtml)
                : undefined
            }
            onCancelEdit={() => setEditingCommentId(null)}
            onDelete={() => onDeleteComment?.(comment.id)}
            onMentionClick={onMentionClick}
            onArtistMentionClick={onArtistMentionClick}
            renderArtistMention={renderArtistMention}
            onMentionQuery={onMentionQuery}
            onArtistMentionQuery={onArtistMentionQuery}
          />

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-3">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  {...reply}
                  isReply
                  isOwner={currentUser?.id === reply.author.id}
                  isEditing={editingCommentId === reply.id}
                  isSavingEdit={savingCommentId === reply.id}
                  onLike={() => onLikeComment?.(reply.id)}
                  onUnlike={() => onUnlikeComment?.(reply.id)}
                  onEdit={() => setEditingCommentId(reply.id)}
                  onSaveEdit={
                    onSaveEditComment
                      ? (content, contentHtml) =>
                          handleSaveEdit(reply.id, content, contentHtml)
                      : undefined
                  }
                  onCancelEdit={() => setEditingCommentId(null)}
                  onDelete={() => onDeleteComment?.(reply.id)}
                  onMentionClick={onMentionClick}
                  onArtistMentionClick={onArtistMentionClick}
                  renderArtistMention={renderArtistMention}
                  onMentionQuery={onMentionQuery}
                  onArtistMentionQuery={onArtistMentionQuery}
                />
              ))}
            </div>
          )}

          {/* Reply form */}
          {replyingTo === comment.id && currentUser && (
            <CommentForm
              user={currentUser}
              placeholder={`Reply to @${comment.author.username || 'user'}...`}
              isReply
              onSubmit={async (content) => {
                await onReplyComment?.(comment.id, content);
                setReplyingTo(null);
              }}
              onCancel={() => setReplyingTo(null)}
            />
          )}
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      )}

      {comments.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}
