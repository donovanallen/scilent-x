'use client';

import { ArtistMention } from '@scilent-one/scilent-ui';
import {
  Button,
  PostCard,
  PostCardCommentInput,
  CommentList,
  Skeleton,
  type PostCardProps,
  type CommentCardProps,
} from '@scilent-one/ui';
import { ArrowLeft } from 'lucide-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect, useState, use } from 'react';
import { toast } from 'sonner';

import { useMentionSearch } from '@/lib/use-mention-search';

interface PostWithComments extends PostCardProps {
  _count?: {
    likes: number;
    comments: number;
    reposts: number;
  };
}

interface CommentReply extends CommentCardProps {
  _count?: {
    likes: number;
    replies: number;
  };
}

interface CommentWithReplies extends CommentCardProps {
  replies?: CommentReply[];
  _count?: {
    likes: number;
    replies: number;
  };
}

interface PaginatedResponse {
  items: CommentWithReplies[];
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

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useTransitionRouter();
  const { searchUsers, searchArtists } = useMentionSearch();
  const [post, setPost] = useState<PostWithComments | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [commentsCursor, setCommentsCursor] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/v1/users/me');
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    }
    fetchUser();
  }, []);

  // Fetch post
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/v1/posts/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/feed');
            toast.error('Post not found');
            return;
          }
          throw new Error('Failed to fetch post');
        }
        const data = await res.json();
        setPost(data);
      } catch (error) {
        console.error('Failed to load post:', error);
        toast.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [id, router]);

  // Fetch comments
  const fetchComments = useCallback(
    async (cursor?: string) => {
      setCommentsLoading(true);
      try {
        const url = new URL(
          `/api/v1/posts/${id}/comments`,
          window.location.origin
        );
        if (cursor) {
          url.searchParams.set('cursor', cursor);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch comments');

        const data: PaginatedResponse = await res.json();

        setComments((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setHasMoreComments(data.hasMore);
        setCommentsCursor(data.nextCursor);
      } catch (error) {
        console.error('Failed to load comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setCommentsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleLikePost = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/v1/posts/${id}/like`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to like post');

      setPost({
        ...post,
        isLiked: true,
        likesCount: (post._count?.likes ?? post.likesCount ?? 0) + 1,
      });
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleUnlikePost = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/v1/posts/${id}/like`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unlike post');

      setPost({
        ...post,
        isLiked: false,
        likesCount: (post._count?.likes ?? post.likesCount ?? 0) - 1,
      });
    } catch (error) {
      console.error('Failed to unlike post:', error);
      toast.error('Failed to unlike post');
    }
  };

  const handleRepostPost = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/v1/posts/${id}/repost`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to repost');

      setPost({
        ...post,
        isReposted: true,
        repostsCount: (post._count?.reposts ?? post.repostsCount ?? 0) + 1,
      });
    } catch (error) {
      console.error('Failed to repost:', error);
      toast.error('Failed to repost');
    }
  };

  const handleUnrepostPost = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/v1/posts/${id}/repost`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove repost');

      setPost({
        ...post,
        isReposted: false,
        repostsCount: Math.max(
          0,
          (post._count?.reposts ?? post.repostsCount ?? 0) - 1
        ),
      });
    } catch (error) {
      console.error('Failed to remove repost:', error);
      toast.error('Failed to remove repost');
    }
  };

  const handleDeletePost = async () => {
    try {
      const res = await fetch(`/api/v1/posts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete post');

      toast.success('Post deleted');
      router.push('/feed');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleEditPost = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (content: string, contentHtml: string) => {
    if (!post) return;
    setIsSavingEdit(true);

    // Store original post for rollback
    const originalPost = { ...post };

    // Optimistic update
    setPost({
      ...post,
      content,
      contentHtml,
    });

    try {
      const res = await fetch(`/api/v1/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentHtml }),
      });

      if (!res.ok) throw new Error('Failed to update post');

      setIsEditing(false);
      toast.success('Post updated');
    } catch (error) {
      // Rollback on error
      setPost(originalPost);
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateComment = async (content: string, contentHtml: string) => {
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/v1/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentHtml }),
      });

      if (!res.ok) throw new Error('Failed to add comment');

      const newComment = await res.json();

      setComments((prev) => [newComment, ...prev]);

      if (post) {
        setPost({
          ...post,
          commentsCount: (post._count?.comments ?? post.commentsCount ?? 0) + 1,
        });
      }

      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveEditComment = async (
    commentId: string,
    content: string,
    contentHtml: string
  ) => {
    try {
      const res = await fetch(`/api/v1/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentHtml }),
      });

      if (!res.ok) throw new Error('Failed to update comment');

      const updated = await res.json();

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, ...updated };
          }
          if (comment.replies?.some((reply) => reply.id === commentId)) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId ? { ...reply, ...updated } : reply
              ),
            };
          }
          return comment;
        })
      );

      toast.success('Comment updated');
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
      throw error;
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to like comment');

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: true,
                likesCount:
                  (comment._count?.likes ?? comment.likesCount ?? 0) + 1,
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to like comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleUnlikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unlike comment');

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: false,
                likesCount:
                  (comment._count?.likes ?? comment.likesCount ?? 0) - 1,
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to unlike comment:', error);
      toast.error('Failed to unlike comment');
    }
  };

  const handleReplyComment = async (
    commentId: string,
    content: string,
    contentHtml?: string
  ) => {
    try {
      const res = await fetch(`/api/v1/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentHtml, parentId: commentId }),
      });

      if (!res.ok) throw new Error('Failed to add reply');

      const newReply = await res.json();

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
                repliesCount:
                  (comment._count?.replies ?? comment.repliesCount ?? 0) + 1,
              }
            : comment
        )
      );

      toast.success('Reply added!');
    } catch (error) {
      console.error('Failed to add reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/v1/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete comment');

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      if (post) {
        setPost({
          ...post,
          commentsCount: (post._count?.comments ?? post.commentsCount ?? 0) - 1,
        });
      }

      toast.success('Comment deleted');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (isLoading) {
    return (
      <div className='container max-w-2xl py-6 space-y-6'>
        <Skeleton className='h-8 w-32' />
        <div className='space-y-4'>
          <Skeleton className='h-40 w-full' />
          <Skeleton className='h-20 w-full' />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className='flex flex-col h-full min-h-0 space-y-4'>
      <Button variant='ghost' onClick={() => router.back()} className='w-fit'>
        <ArrowLeft className='h-4 w-4' />
        Back
      </Button>

      <PostCard
        {...post}
        likesCount={post._count?.likes ?? post.likesCount ?? 0}
        commentsCount={post._count?.comments ?? post.commentsCount ?? 0}
        repostsCount={post._count?.reposts ?? post.repostsCount ?? 0}
        isOwner={currentUser?.id === post.author.id}
        isEditing={isEditing}
        isSaving={isSavingEdit}
        onLike={handleLikePost}
        onUnlike={handleUnlikePost}
        onRepost={handleRepostPost}
        onUnrepost={handleUnrepostPost}
        onEdit={handleEditPost}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDeletePost}
        onAuthorClick={(username) => router.push(`/profile/${username}`)}
        onMentionClick={(username) => router.push(`/profile/${username}`)}
        onMentionQuery={searchUsers}
        onArtistMentionQuery={searchArtists}
        renderArtistMention={(props) => <ArtistMention {...props} />}
      />

      <div className='space-y-4'>
        <h3>Comments</h3>

        {currentUser && (
          <PostCardCommentInput
            user={currentUser}
            placeholder='Write a comment...'
            isSubmitting={isSubmittingComment}
            onSubmit={handleCreateComment}
            onMentionQuery={searchUsers}
            onArtistMentionQuery={searchArtists}
          />
        )}

        <CommentList
          comments={comments.map((comment) => ({
            ...comment,
            likesCount: comment._count?.likes ?? comment.likesCount ?? 0,
            repliesCount: comment._count?.replies ?? comment.repliesCount ?? 0,
            replies: comment.replies?.map((reply) => ({
              ...reply,
              likesCount: reply._count?.likes ?? reply.likesCount ?? 0,
              repliesCount: reply._count?.replies ?? reply.repliesCount ?? 0,
            })),
          }))}
          currentUser={currentUser ?? undefined}
          isLoading={commentsLoading}
          hasMore={hasMoreComments}
          onLoadMore={() => commentsCursor && fetchComments(commentsCursor)}
          onLikeComment={handleLikeComment}
          onUnlikeComment={handleUnlikeComment}
          onReplyComment={handleReplyComment}
          onSaveEditComment={handleSaveEditComment}
          onDeleteComment={handleDeleteComment}
          onMentionClick={(username) => router.push(`/profile/${username}`)}
          renderArtistMention={(props) => <ArtistMention {...props} />}
          onMentionQuery={searchUsers}
          onArtistMentionQuery={searchArtists}
        />
      </div>
    </div>
  );
}
