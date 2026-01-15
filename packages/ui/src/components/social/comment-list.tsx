'use client';

import * as React from 'react';
import { CommentCard, type CommentCardProps } from './comment-card';
import { CommentForm } from './comment-form';
import { Button } from '../button';
import { cn } from '../../utils';

export interface CommentListProps {
  comments: Array<CommentCardProps & { replies?: CommentCardProps[] | undefined }>;
  currentUser?: {
    id: string;
    name?: string | null | undefined;
    username?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    image?: string | null | undefined;
  } | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLikeComment?: (commentId: string) => void;
  onUnlikeComment?: (commentId: string) => void;
  onReplyComment?: (commentId: string, content: string) => void;
  onEditComment?: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  /** Callback when a user mention (@username) is clicked */
  onMentionClick?: ((username: string) => void) | undefined;
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
  onEditComment,
  onDeleteComment,
  onMentionClick,
  className,
}: CommentListProps) {
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);

  return (
    <div className={cn('space-y-4', className)}>
      {comments.map((comment) => (
        <div key={comment.id} className='space-y-3'>
          <CommentCard
            {...comment}
            isOwner={currentUser?.id === comment.author.id}
            onLike={() => onLikeComment?.(comment.id)}
            onUnlike={() => onUnlikeComment?.(comment.id)}
            onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            onEdit={() => onEditComment?.(comment.id)}
            onDelete={() => onDeleteComment?.(comment.id)}
            onMentionClick={onMentionClick}
          />

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className='space-y-3'>
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  {...reply}
                  isReply
                  isOwner={currentUser?.id === reply.author.id}
                  onLike={() => onLikeComment?.(reply.id)}
                  onUnlike={() => onUnlikeComment?.(reply.id)}
                  onEdit={() => onEditComment?.(reply.id)}
                  onDelete={() => onDeleteComment?.(reply.id)}
                  onMentionClick={onMentionClick}
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
        <div className='flex justify-center pt-2'>
          <Button
            variant='ghost'
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      )}

      {comments.length === 0 && !isLoading && (
        <p className='text-center text-muted-foreground py-8'>
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}
