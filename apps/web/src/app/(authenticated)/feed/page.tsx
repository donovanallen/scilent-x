'use client';

import { ArtistMention } from '@scilent-one/scilent-ui';
import {
  Feed,
  PostForm,
  useInfiniteScroll,
  type PostCardProps,
} from '@scilent-one/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { fetcher } from '@/lib/swr';
import { useMentionSearch } from '@/lib/use-mention-search';

interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    image: string | null;
  };
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
}

interface FeedPost extends PostCardProps {
  _count?: {
    likes: number;
    comments: number;
  };
  comments?: FeedComment[];
}

interface PaginatedResponse {
  items: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface CurrentUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  avatarUrl: string | null;
}

export default function FeedPage() {
  const router = useRouter();
  const { searchUsers, searchArtists } = useMentionSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState<
    string | null
  >(null);
  const [replyingTo, setReplyingTo] = useState<{
    postId: string;
    commentId: string;
  } | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const { data: currentUser } = useSWR<CurrentUser>(
    '/api/v1/users/me',
    fetcher
  );

  const getKey = (
    pageIndex: number,
    previousPageData: PaginatedResponse | null
  ) => {
    if (pageIndex === 0) {
      return '/api/v1/feed';
    }
    if (!previousPageData?.hasMore || !previousPageData.nextCursor) {
      return null;
    }
    return `/api/v1/feed?cursor=${encodeURIComponent(
      previousPageData.nextCursor
    )}`;
  };

  const {
    data: feedPages,
    error: feedError,
    isLoading,
    isValidating,
    setSize,
    mutate,
  } = useSWRInfinite<PaginatedResponse>(getKey, fetcher);

  useEffect(() => {
    if (!feedError) return;
    console.error('Failed to load feed:', feedError);
    toast.error('Failed to load feed');
  }, [feedError]);

  const posts = useMemo(
    () => feedPages?.flatMap((page) => page.items) ?? [],
    [feedPages]
  );
  const lastPage = feedPages?.[feedPages.length - 1];
  const hasMore = lastPage?.hasMore ?? false;
  const isFeedLoading = isLoading && !feedPages;

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isValidating,
    onLoadMore: () => setSize((size) => size + 1),
  });

  const handleCreatePost = async (content: string, contentHtml: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentHtml }),
      });

      if (!res.ok) throw new Error('Failed to create post');

      const newPost: FeedPost = await res.json();
      mutate(
        (pages) => {
          if (!pages || pages.length === 0) {
            return [{ items: [newPost], nextCursor: null, hasMore: false }];
          }
          const firstPage = pages[0];
          if (!firstPage) {
            return pages;
          }
          const restPages = pages.slice(1);
          return [
            { ...firstPage, items: [newPost, ...firstPage.items] },
            ...restPages,
          ];
        },
        { revalidate: false }
      );
      toast.success('Post created!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to like post');

      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.map((post) => {
              if (post.id !== postId) return post;
              const currentLikes = post._count?.likes ?? post.likesCount ?? 0;
              return {
                ...post,
                isLiked: true,
                likesCount: currentLikes + 1,
                ...(post._count && {
                  _count: { ...post._count, likes: currentLikes + 1 },
                }),
              };
            }),
          })),
        { revalidate: false }
      );
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleUnlikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unlike post');

      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.map((post) => {
              if (post.id !== postId) return post;
              const currentLikes = post._count?.likes ?? post.likesCount ?? 0;
              return {
                ...post,
                isLiked: false,
                likesCount: currentLikes - 1,
                ...(post._count && {
                  _count: { ...post._count, likes: currentLikes - 1 },
                }),
              };
            }),
          })),
        { revalidate: false }
      );
    } catch (error) {
      console.error('Failed to unlike post:', error);
      toast.error('Failed to unlike post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete post');

      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.filter((post) => post.id !== postId),
          })),
        { revalidate: false }
      );
      toast.success('Post deleted');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
  };

  const handleSaveEdit = async (
    postId: string,
    content: string,
    contentHtml: string
  ) => {
    setIsSavingEdit(true);

    const originalPages = feedPages;

    // Optimistic update
    mutate(
      (pages) =>
        pages?.map((page) => ({
          ...page,
          items: page.items.map((post) =>
            post.id === postId ? { ...post, content, contentHtml } : post
          ),
        })),
      { revalidate: false }
    );

    try {
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentHtml }),
      });

      if (!res.ok) throw new Error('Failed to update post');

      setEditingPostId(null);
      toast.success('Post updated');
    } catch (error) {
      // Rollback on error
      mutate(originalPages, { revalidate: false });
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateComment = async (postId: string, content: string) => {
    setSubmittingCommentPostId(postId);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error('Failed to create comment');

      // Update comment count optimistically
      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.map((post) => {
              if (post.id !== postId) return post;
              const currentComments =
                post._count?.comments ?? post.commentsCount ?? 0;
              return {
                ...post,
                commentsCount: currentComments + 1,
                ...(post._count && {
                  _count: { ...post._count, comments: currentComments + 1 },
                }),
              };
            }),
          })),
        { revalidate: false }
      );

      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingCommentPostId(null);
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    // Optimistic update
    mutate(
      (pages) =>
        pages?.map((page) => ({
          ...page,
          items: page.items.map((post) => {
            if (post.id !== postId || !post.comments) return post;
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: true,
                      likesCount: comment.likesCount + 1,
                    }
                  : comment
              ),
            };
          }),
        })),
      { revalidate: false }
    );

    try {
      const res = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to like comment');
    } catch (error) {
      // Rollback on error
      mutate();
      console.error('Failed to like comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleUnlikeComment = async (postId: string, commentId: string) => {
    // Optimistic update
    mutate(
      (pages) =>
        pages?.map((page) => ({
          ...page,
          items: page.items.map((post) => {
            if (post.id !== postId || !post.comments) return post;
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: false,
                      likesCount: Math.max(0, comment.likesCount - 1),
                    }
                  : comment
              ),
            };
          }),
        })),
      { revalidate: false }
    );

    try {
      const res = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to unlike comment');
    } catch (error) {
      // Rollback on error
      mutate();
      console.error('Failed to unlike comment:', error);
      toast.error('Failed to unlike comment');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/v1/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete comment');

      // Update comment count optimistically
      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.map((post) => {
              if (post.id !== postId) return post;
              const currentComments =
                post._count?.comments ?? post.commentsCount ?? 0;
              return {
                ...post,
                commentsCount: Math.max(0, currentComments - 1),
                ...(post._count && {
                  _count: {
                    ...post._count,
                    comments: Math.max(0, currentComments - 1),
                  },
                }),
              };
            }),
          })),
        { revalidate: false }
      );

      toast.success('Comment deleted');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleReplyComment = (postId: string, commentId: string) => {
    // Toggle - if clicking the same comment, close it
    if (replyingTo?.postId === postId && replyingTo?.commentId === commentId) {
      setReplyingTo(null);
    } else {
      setReplyingTo({ postId, commentId });
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSubmitReply = async (
    postId: string,
    commentId: string,
    content: string
  ) => {
    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: commentId }),
      });

      if (!res.ok) throw new Error('Failed to add reply');

      // Update comment count
      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.map((post) => {
              if (post.id !== postId) return post;
              const currentComments =
                post._count?.comments ?? post.commentsCount ?? 0;
              return {
                ...post,
                commentsCount: currentComments + 1,
                ...(post._count && {
                  _count: { ...post._count, comments: currentComments + 1 },
                }),
              };
            }),
          })),
        { revalidate: false }
      );

      setReplyingTo(null);
      toast.success('Reply added!');
    } catch (error) {
      console.error('Failed to add reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className='flex flex-col h-full min-h-0 space-y-6'>
      {currentUser && (
        <PostForm
          user={{
            name: currentUser.name,
            image: currentUser.image,
          }}
          onSubmit={handleCreatePost}
          isSubmitting={isSubmitting}
          onMentionQuery={searchUsers}
          onArtistMentionQuery={searchArtists}
        />
      )}

      <Feed
        posts={posts.map((post) => ({
          ...post,
          likesCount: post._count?.likes ?? post.likesCount ?? 0,
          commentsCount: post._count?.comments ?? post.commentsCount ?? 0,
        }))}
        currentUserId={currentUser?.id}
        isLoading={isFeedLoading}
        hasMore={hasMore}
        loadMoreRef={sentinelRef}
        editingPostId={editingPostId}
        isSavingEdit={isSavingEdit}
        onLikePost={handleLikePost}
        onUnlikePost={handleUnlikePost}
        onPostClick={(postId) => router.push(`/post/${postId}`)}
        onEditPost={handleEditPost}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onDeletePost={handleDeletePost}
        onAuthorClick={(username) => router.push(`/profile/${username}`)}
        onMentionClick={(username) => router.push(`/profile/${username}`)}
        onMentionQuery={searchUsers}
        onArtistMentionQuery={searchArtists}
        renderArtistMention={(props) => <ArtistMention {...props} />}
        // Inline comments
        currentUser={
          currentUser
            ? {
                id: currentUser.id,
                name: currentUser.name,
                username: currentUser.username,
                avatarUrl: currentUser.avatarUrl,
                image: currentUser.image,
              }
            : undefined
        }
        submittingCommentPostId={submittingCommentPostId}
        onCreateComment={handleCreateComment}
        onViewAllComments={(postId) => router.push(`/post/${postId}`)}
        onLikeComment={handleLikeComment}
        onUnlikeComment={handleUnlikeComment}
        onReplyComment={handleReplyComment}
        onSubmitReply={handleSubmitReply}
        onCancelReply={handleCancelReply}
        replyingToCommentId={replyingTo?.commentId ?? null}
        isSubmittingReply={isSubmittingReply}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
}
