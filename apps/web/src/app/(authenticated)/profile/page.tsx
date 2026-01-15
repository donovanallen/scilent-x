'use client';

import { ArtistMention } from '@scilent-one/harmony-ui';
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
} from '@scilent-one/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useMentionSearch } from '@/lib/use-mention-search';

import { TidalProfileCard } from './[username]/_components';

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
  };
}

export default function MyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

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

  // Fetch posts
  const fetchPosts = useCallback(
    async (cursorParam?: string) => {
      if (!profile?.username) return;

      setPostsLoading(true);
      try {
        const url = new URL(
          `/api/v1/users/${profile.username}`,
          window.location.origin
        );
        url.searchParams.set('includePosts', 'true');
        if (cursorParam) {
          url.searchParams.set('cursor', cursorParam);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch posts');

        const data = await res.json();

        if (data.posts) {
          setPosts((prev) =>
            cursorParam ? [...prev, ...data.posts.items] : data.posts.items
          );
          setHasMore(data.posts.hasMore);
          setCursor(data.posts.nextCursor);
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

  useEffect(() => {
    if (profile?.username) {
      fetchPosts();
    }
  }, [fetchPosts, profile?.username]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: postsLoading,
    onLoadMore: () => cursor && fetchPosts(cursor),
  });

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
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: false, likesCount: post.likesCount - 1 }
            : post
        )
      );
    } catch (error) {
      console.error('Failed to unlike post:', error);
      toast.error('Failed to unlike post');
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
      // Add the new post to the beginning of the list
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
          isLiked: false,
        },
        ...prev,
      ]);
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

  return (
    <div className='w-full h-full min-h-0 grid grid-cols-3 gap-6'>
      <div className='flex flex-col space-y-6 col-span-2'>
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
          <CardHeader>
            <CardTitle>Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Feed
              posts={posts.map((post) => ({
                ...post,
                likesCount: post._count?.likes ?? post.likesCount ?? 0,
                commentsCount: post._count?.comments ?? post.commentsCount ?? 0,
              }))}
              currentUserId={profile.id}
              isLoading={postsLoading}
              hasMore={hasMore}
              loadMoreRef={sentinelRef}
              onLikePost={handleLikePost}
              onUnlikePost={handleUnlikePost}
              onPostClick={(postId) => router.push(`/post/${postId}`)}
              onAuthorClick={(username) => router.push(`/profile/${username}`)}
              onMentionClick={(username) => router.push(`/profile/${username}`)}
              renderArtistMention={(props) => <ArtistMention {...props} />}
            />
          </CardContent>
        </Card>
      </div>

      {/* Connected Platform Profiles */}
      <div className='space-y-4'>
        {/* Show Tidal profile card if user has Tidal connected */}
        {profile.connectedPlatforms?.some((p) => p.providerId === 'tidal') && (
          <TidalProfileCard userId={profile.id} isCurrentUser={true} />
        )}

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
      </div>
    </div>
  );
}
