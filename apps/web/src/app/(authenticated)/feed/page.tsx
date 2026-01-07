'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Feed,
  PostForm,
  useInfiniteScroll,
  type PostCardProps,
} from '@scilent-one/ui';
import { toast } from 'sonner';

interface FeedPost extends PostCardProps {
  _count?: {
    likes: number;
    comments: number;
  };
}

interface PaginatedResponse {
  items: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

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

  // Fetch posts
  const fetchPosts = useCallback(async (cursorParam?: string) => {
    try {
      const url = new URL('/api/v1/feed', window.location.origin);
      if (cursorParam) {
        url.searchParams.set('cursor', cursorParam);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch posts');

      const data: PaginatedResponse = await res.json();

      setPosts((prev) =>
        cursorParam ? [...prev, ...data.items] : data.items
      );
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => cursor && fetchPosts(cursor),
  });

  const handleCreatePost = async (content: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error('Failed to create post');

      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      toast.success('Post created!');
    } catch (error) {
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

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
            : post
        )
      );
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleUnlikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unlike post');

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: false, likesCount: post.likesCount - 1 }
            : post
        )
      );
    } catch (error) {
      toast.error('Failed to unlike post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete post');

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className='container max-w-2xl py-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Home</h1>

      {currentUser && (
        <PostForm
          user={{
            name: currentUser.name,
            image: currentUser.image,
          }}
          onSubmit={handleCreatePost}
          isSubmitting={isSubmitting}
        />
      )}

      <Feed
        posts={posts.map((post) => ({
          ...post,
          likesCount: post._count?.likes ?? post.likesCount ?? 0,
          commentsCount: post._count?.comments ?? post.commentsCount ?? 0,
        }))}
        currentUserId={currentUser?.id}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMoreRef={sentinelRef}
        onLikePost={handleLikePost}
        onUnlikePost={handleUnlikePost}
        onPostClick={(postId) => router.push(`/post/${postId}`)}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
}
