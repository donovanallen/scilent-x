'use client';

import { ArtistMention } from '@scilent-one/scilent-ui';
import {
  Feed,
  useInfiniteScroll,
  type PostCardProps,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@scilent-one/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useMentionSearch } from '@/lib/use-mention-search';

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

export default function ExplorePage() {
  const router = useRouter();
  const { searchUsers, searchArtists } = useMentionSearch();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'trending'>('recent');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
  const fetchPosts = useCallback(
    async (cursorParam?: string, trending = false) => {
      setIsLoading(true);
      try {
        const url = new URL('/api/v1/feed/explore', window.location.origin);
        if (cursorParam) {
          url.searchParams.set('cursor', cursorParam);
        }
        if (trending) {
          url.searchParams.set('trending', 'true');
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
        console.error('Failed to load posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    fetchPosts(undefined, activeTab === 'trending');
  }, [fetchPosts, activeTab]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => cursor && fetchPosts(cursor, activeTab === 'trending'),
  });

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to like post');

      setPosts((prev) =>
        prev.map((post) => {
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
        })
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

      setPosts((prev) =>
        prev.map((post) => {
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
        })
      );
    } catch (error) {
      console.error('Failed to unlike post:', error);
      toast.error('Failed to unlike post');
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

    // Store original posts for rollback
    const originalPosts = [...posts];

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, content, contentHtml } : post
      )
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
      setPosts(originalPosts);
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSavingEdit(false);
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
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className='flex flex-col h-full min-h-0 space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'recent' | 'trending')}
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='recent'>Recent</TabsTrigger>
          <TabsTrigger value='trending'>Trending</TabsTrigger>
        </TabsList>

        <TabsContent value='recent' className='mt-6'>
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
          />
        </TabsContent>

        <TabsContent value='trending' className='mt-6'>
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
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
