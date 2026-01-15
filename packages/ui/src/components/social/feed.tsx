'use client';

import * as React from 'react';
import { PostCard, type PostCardProps } from './post-card';
import { type ArtistMentionRenderProps } from '../rich-text-content';
import { Skeleton } from '../skeleton';
import { cn } from '../../utils';

export interface FeedProps {
  posts: PostCardProps[];
  currentUserId?: string | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  onLikePost?: (postId: string) => void;
  onUnlikePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onPostClick?: (postId: string) => void;
  onArtistMentionClick?: ((artistId: string, provider: string) => void) | undefined;
  /** Custom renderer for artist mentions (for interactive behaviors) */
  renderArtistMention?: ((props: ArtistMentionRenderProps) => React.ReactNode) | undefined;
  className?: string;
}

function PostSkeleton() {
  return (
    <div className='rounded-lg border bg-card p-4 space-y-3'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-10 w-10 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-3 w-16' />
        </div>
      </div>
      <Skeleton className='h-16 w-full' />
      <div className='flex gap-4'>
        <Skeleton className='h-8 w-16' />
        <Skeleton className='h-8 w-16' />
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
  onLikePost,
  onUnlikePost,
  onCommentPost,
  onEditPost,
  onDeletePost,
  onPostClick,
  onArtistMentionClick,
  renderArtistMention,
  className,
}: FeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          {...post}
          isOwner={currentUserId === post.author.id}
          onLike={() => onLikePost?.(post.id)}
          onUnlike={() => onUnlikePost?.(post.id)}
          onComment={() => onCommentPost?.(post.id)}
          onEdit={() => onEditPost?.(post.id)}
          onDelete={() => onDeletePost?.(post.id)}
          onClick={() => onPostClick?.(post.id)}
          onArtistMentionClick={onArtistMentionClick}
          renderArtistMention={renderArtistMention}
        />
      ))}

      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {hasMore && !isLoading && (
        <div ref={loadMoreRef} className='h-10' />
      )}

      {posts.length === 0 && !isLoading && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>No posts yet</p>
        </div>
      )}
    </div>
  );
}
