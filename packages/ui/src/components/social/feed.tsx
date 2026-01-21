'use client';

import * as React from 'react';
import { PostCard, type PostCardProps } from './post-card';
import { type PostCardCommentInputUser } from './post-card-comment-input';
import { type ArtistMentionRenderProps } from '../rich-text-content';
import { type MentionSuggestion } from '../mention-list';
import { Skeleton } from '../skeleton';
import { cn } from '../../utils';

export interface FeedProps {
  posts: PostCardProps[];
  currentUserId?: string | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  /** ID of the post currently being edited (only one at a time) */
  editingPostId?: string | null;
  /** Whether the current edit is being saved */
  isSavingEdit?: boolean;
  onLikePost?: (postId: string) => void;
  onUnlikePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
  /** Called when user clicks Edit to enter edit mode */
  onEditPost?: (postId: string) => void;
  /** Called when user saves edited content */
  onSaveEdit?: (
    postId: string,
    content: string,
    contentHtml: string
  ) => Promise<void>;
  /** Called when user cancels editing */
  onCancelEdit?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onPostClick?: (postId: string) => void;
  /** Callback when the author's avatar, name, or username is clicked */
  onAuthorClick?: ((authorUsername: string) => void) | undefined;
  /** Callback when a user mention (@username) is clicked */
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
  /** Current user for inline comment input */
  currentUser?: (PostCardCommentInputUser & { id: string }) | undefined;
  /** ID of the post currently having a comment submitted */
  submittingCommentPostId?: string | null;
  /** Called when user creates a new comment */
  onCreateComment?: (postId: string, content: string) => Promise<void>;
  /** Called when "View all comments" is clicked */
  onViewAllComments?: (postId: string) => void;
  /** Called when a comment is liked */
  onLikeComment?: (postId: string, commentId: string) => void;
  /** Called when a comment is unliked */
  onUnlikeComment?: (postId: string, commentId: string) => void;
  /** Called when user clicks reply button on a comment */
  onReplyComment?: (postId: string, commentId: string) => void;
  /** Called when user submits a reply */
  onSubmitReply?: (postId: string, commentId: string, content: string) => Promise<void>;
  /** Called when user cancels replying */
  onCancelReply?: () => void;
  /** ID of the comment currently being replied to (format: postId:commentId or just commentId) */
  replyingToCommentId?: string | null;
  /** Whether the reply is being submitted */
  isSubmittingReply?: boolean;
  /** Called when a comment is deleted */
  onDeleteComment?: (postId: string, commentId: string) => void;
}

function PostSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function Feed({
  posts,
  currentUserId,
  isLoading = false,
  hasMore = false,
  loadMoreRef,
  editingPostId,
  isSavingEdit = false,
  onLikePost,
  onUnlikePost,
  onCommentPost,
  onEditPost,
  onSaveEdit,
  onCancelEdit,
  onDeletePost,
  onPostClick,
  onAuthorClick,
  onMentionClick,
  onArtistMentionClick,
  renderArtistMention,
  onMentionQuery,
  onArtistMentionQuery,
  className,
  // Inline comments props
  currentUser,
  submittingCommentPostId,
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
}: FeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          {...post}
          isOwner={currentUserId === post.author.id}
          isEditing={editingPostId === post.id}
          isSaving={editingPostId === post.id && isSavingEdit}
          onLike={() => onLikePost?.(post.id)}
          onUnlike={() => onUnlikePost?.(post.id)}
          onComment={() => onCommentPost?.(post.id)}
          onEdit={() => onEditPost?.(post.id)}
          onSaveEdit={
            onSaveEdit
              ? async (content, contentHtml) => {
                  await onSaveEdit(post.id, content, contentHtml);
                }
              : undefined
          }
          onCancelEdit={() => onCancelEdit?.(post.id)}
          onDelete={() => onDeletePost?.(post.id)}
          onClick={() => onPostClick?.(post.id)}
          onAuthorClick={onAuthorClick}
          onMentionClick={onMentionClick}
          onArtistMentionClick={onArtistMentionClick}
          renderArtistMention={renderArtistMention}
          onMentionQuery={onMentionQuery}
          onArtistMentionQuery={onArtistMentionQuery}
          // Inline comments props
          currentUser={currentUser}
          isSubmittingComment={submittingCommentPostId === post.id}
          onCreateComment={
            onCreateComment
              ? async (content) => {
                  await onCreateComment(post.id, content);
                }
              : undefined
          }
          onViewAllComments={
            onViewAllComments ? () => onViewAllComments(post.id) : undefined
          }
          onLikeComment={
            onLikeComment
              ? (commentId) => onLikeComment(post.id, commentId)
              : undefined
          }
          onUnlikeComment={
            onUnlikeComment
              ? (commentId) => onUnlikeComment(post.id, commentId)
              : undefined
          }
          onReplyComment={
            onReplyComment
              ? (commentId) => onReplyComment(post.id, commentId)
              : undefined
          }
          onSubmitReply={
            onSubmitReply
              ? async (commentId, content) => {
                  await onSubmitReply(post.id, commentId, content);
                }
              : undefined
          }
          onCancelReply={onCancelReply}
          replyingToCommentId={replyingToCommentId}
          isSubmittingReply={isSubmittingReply}
          onDeleteComment={
            onDeleteComment
              ? (commentId) => onDeleteComment(post.id, commentId)
              : undefined
          }
          showComments
          comments={post.comments}
        />
      ))}

      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {hasMore && !isLoading && <div ref={loadMoreRef} className="h-10" />}

      {posts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet</p>
        </div>
      )}
    </div>
  );
}
