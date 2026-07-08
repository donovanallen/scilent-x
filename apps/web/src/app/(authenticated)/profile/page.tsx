'use client';

import { ArtistMention } from '@scilent-one/scilent-ui';
import {
  ProfileHeader,
  Feed,
  useInfiniteScroll,
  Skeleton,
  type PostCardProps,
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  PostForm,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@scilent-one/ui';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useMentionSearch } from '@/lib/use-mention-search';

import {
  TidalProfileCard,
  SpotifyProfileCard,
  AppleMusicProfileCard,
} from './[username]/_components';

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  email: string;
  createdAt: string;
  _count?:
    | {
        posts: number;
        followers: number;
        following: number;
      }
    | undefined;
  connectedPlatforms?: { providerId: string; connectedAt: Date }[];
}

interface FeedPost extends PostCardProps {
  _count?: {
    likes: number;
    comments: number;
    reposts: number;
  };
}

type ProfileTab = 'posts' | 'liked' | 'reposts';

const TAB_QUERY_PARAM: Record<ProfileTab, string> = {
  posts: 'includePosts',
  liked: 'includeLiked',
  reposts: 'includeReposts',
};

const TAB_RESPONSE_FIELD: Record<ProfileTab, string> = {
  posts: 'posts',
  liked: 'liked',
  reposts: 'reposts',
};

export default function MyProfilePage() {
  const router = useTransitionRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { searchUsers, searchArtists } = useMentionSearch();

  // Fetch current user's profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        // First get current user to get their username
        const meRes = await fetch('/api/v1/users/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const me = await meRes.json();

        if (!me.username) {
          // User doesn't have a username set yet
          setProfile(me);
          setIsLoading(false);
          return;
        }

        // Fetch full profile with connected accounts
        const res = await fetch(
          `/api/v1/users/${me.username}?includeConnectedAccounts=true`
        );
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  // Fetch posts for the active tab
  const fetchPosts = useCallback(
    async (tab: ProfileTab, cursorParam?: string) => {
      if (!profile?.username) return;

      setPostsLoading(true);
      try {
        const url = new URL(
          `/api/v1/users/${profile.username}`,
          window.location.origin
        );
        url.searchParams.set(TAB_QUERY_PARAM[tab], 'true');
        if (cursorParam) {
          url.searchParams.set('cursor', cursorParam);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch posts');

        const data = await res.json();
        const page = data[TAB_RESPONSE_FIELD[tab]];

        if (page) {
          setPosts((prev) =>
            cursorParam ? [...prev, ...page.items] : page.items
          );
          setHasMore(page.hasMore);
          setCursor(page.nextCursor);
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setPostsLoading(false);
      }
    },
    [profile?.username]
  );

  // Reset and refetch when the profile loads or the active tab changes
  useEffect(() => {
    if (profile?.username) {
      setPosts([]);
      setCursor(null);
      fetchPosts(activeTab);
    }
  }, [fetchPosts, profile?.username, activeTab]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: postsLoading,
    onLoadMore: () => cursor && fetchPosts(activeTab, cursor),
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
            likesCount: Math.max(0, currentLikes - 1),
            ...(post._count && {
              _count: { ...post._count, likes: Math.max(0, currentLikes - 1) },
            }),
          };
        })
      );
    } catch (error) {
      console.error('Failed to unlike post:', error);
      toast.error('Failed to unlike post');
    }
  };

  const handleRepostPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/repost`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to repost');

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const currentReposts = post._count?.reposts ?? post.repostsCount ?? 0;
          return {
            ...post,
            isReposted: true,
            repostsCount: currentReposts + 1,
            ...(post._count && {
              _count: { ...post._count, reposts: currentReposts + 1 },
            }),
          };
        })
      );
    } catch (error) {
      console.error('Failed to repost:', error);
      toast.error('Failed to repost');
    }
  };

  const handleUnrepostPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/repost`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove repost');

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const currentReposts = post._count?.reposts ?? post.repostsCount ?? 0;
          return {
            ...post,
            isReposted: false,
            repostsCount: Math.max(0, currentReposts - 1),
            ...(post._count && {
              _count: {
                ...post._count,
                reposts: Math.max(0, currentReposts - 1),
              },
            }),
          };
        })
      );
    } catch (error) {
      console.error('Failed to remove repost:', error);
      toast.error('Failed to remove repost');
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

  const handleCreatePost = async (content: string, contentHtml: string) => {
    if (!profile) return;

    setIsSubmittingPost(true);
    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentHtml }),
      });

      if (!res.ok) throw new Error('Failed to create post');

      const newPost = await res.json();
      // Add the new post to the beginning of the list if we're viewing "Posts"
      if (activeTab === 'posts') {
        setPosts((prev) => [
          {
            ...newPost,
            author: {
              id: profile.id,
              name: profile.name,
              username: profile.username,
              avatarUrl: profile.avatarUrl,
              image: profile.image,
            },
            likesCount: 0,
            commentsCount: 0,
            repostsCount: 0,
            isLiked: false,
            isReposted: false,
          },
          ...prev,
        ]);
      }
      toast.success('Post created!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  if (isLoading) {
    return (
      <div className='container max-w-2xl py-6 space-y-6'>
        <Skeleton className='h-48 w-full' />
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-32 w-full' />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Render the connected platform cards
  const renderPlatformCards = () => (
    <>
      {/* Show Tidal profile card if user has Tidal connected */}
      {profile.connectedPlatforms?.some((p) => p.providerId === 'tidal') && (
        <TidalProfileCard userId={profile.id} isCurrentUser={true} />
      )}

      {/* Show Spotify profile card if user has Spotify connected */}
      {profile.connectedPlatforms?.some((p) => p.providerId === 'spotify') && (
        <SpotifyProfileCard userId={profile.id} isCurrentUser={true} />
      )}

      {/* Show Apple Music profile card if user has Apple Music connected */}
      {profile.connectedPlatforms?.some(
        (p) => p.providerId === 'apple_music'
      ) && <AppleMusicProfileCard userId={profile.id} isCurrentUser={true} />}

      {/* Placeholder for other platforms - can be extended later */}
      {(!profile.connectedPlatforms ||
        profile.connectedPlatforms.length === 0) && (
        <Card className='h-fit'>
          <CardHeader>
            <CardTitle className='text-base'>Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Connect your streaming accounts to see your profiles here.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );

  return (
    <div className='w-full h-full min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <div className='flex flex-col space-y-6 lg:col-span-2'>
        <ProfileHeader
          id={profile.id}
          name={profile.name}
          username={profile.username}
          bio={profile.bio}
          avatarUrl={profile.avatarUrl}
          image={profile.image}
          postsCount={profile._count?.posts ?? 0}
          followersCount={profile._count?.followers ?? 0}
          followingCount={profile._count?.following ?? 0}
          isCurrentUser={true}
          onEditProfile={() => router.push('/settings/profile')}
          onFollowersClick={() =>
            profile.username &&
            router.push(`/profile/${profile.username}/followers`)
          }
          onFollowingClick={() =>
            profile.username &&
            router.push(`/profile/${profile.username}/following`)
          }
        />

        {/* Platform cards - show inline on smaller screens */}
        <div className='lg:hidden space-y-4'>{renderPlatformCards()}</div>

        <PostForm
          user={{
            name: profile.name,
            username: profile.username,
            avatarUrl: profile.avatarUrl,
            image: profile.image,
          }}
          placeholder="What's on your mind?"
          isSubmitting={isSubmittingPost}
          onSubmit={handleCreatePost}
          onMentionQuery={searchUsers}
          onArtistMentionQuery={searchArtists}
        />

        <Card>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ProfileTab)}
          >
            <CardHeader>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='posts'>Posts</TabsTrigger>
                <TabsTrigger value='liked'>Liked</TabsTrigger>
                <TabsTrigger value='reposts'>Reposts</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value={activeTab} className='mt-0'>
                <Feed
                  posts={posts.map((post) => ({
                    ...post,
                    likesCount: post._count?.likes ?? post.likesCount ?? 0,
                    commentsCount:
                      post._count?.comments ?? post.commentsCount ?? 0,
                    repostsCount:
                      post._count?.reposts ?? post.repostsCount ?? 0,
                  }))}
                  currentUserId={profile.id}
                  isLoading={postsLoading}
                  hasMore={hasMore}
                  loadMoreRef={sentinelRef}
                  editingPostId={editingPostId}
                  isSavingEdit={isSavingEdit}
                  onLikePost={handleLikePost}
                  onUnlikePost={handleUnlikePost}
                  onRepostPost={handleRepostPost}
                  onUnrepostPost={handleUnrepostPost}
                  onPostClick={(postId) => router.push(`/post/${postId}`)}
                  onCommentPost={(postId) => router.push(`/post/${postId}`)}
                  onEditPost={handleEditPost}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onDeletePost={handleDeletePost}
                  onAuthorClick={(username) =>
                    router.push(`/profile/${username}`)
                  }
                  onMentionClick={(username) =>
                    router.push(`/profile/${username}`)
                  }
                  onMentionQuery={searchUsers}
                  onArtistMentionQuery={searchArtists}
                  renderArtistMention={(props) => <ArtistMention {...props} />}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Connected Platform Profiles - sidebar on larger screens */}
      <div className='hidden lg:block space-y-4'>{renderPlatformCards()}</div>
    </div>
  );
}
