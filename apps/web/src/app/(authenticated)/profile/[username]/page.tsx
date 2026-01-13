'use client';

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
  Badge,
} from '@scilent-one/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, use } from 'react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  email: string;
  createdAt: string;
  isFollowing?: boolean | undefined;
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

interface CurrentUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

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

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(
          `/api/v1/users/${username}?includeConnectedAccounts=true`
        );
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/feed');
            toast.error('User not found');
            return;
          }
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
  }, [username, router]);

  // Fetch posts
  const fetchPosts = useCallback(
    async (cursorParam?: string) => {
      if (!profile) return;

      setPostsLoading(true);
      try {
        const url = new URL(
          `/api/v1/users/${username}`,
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
    [username, profile]
  );

  useEffect(() => {
    if (profile) {
      fetchPosts();
    }
  }, [fetchPosts, profile]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: postsLoading,
    onLoadMore: () => cursor && fetchPosts(cursor),
  });

  const handleFollow = async () => {
    if (!profile) return;
    setIsFollowLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${username}/follow`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to follow user');

      setProfile({
        ...profile,
        isFollowing: true,
        _count: profile._count
          ? { ...profile._count, followers: profile._count.followers + 1 }
          : undefined,
      });
      toast.success(`Following @${username}`);
    } catch (error) {
      console.error('Failed to follow user:', error);
      toast.error('Failed to follow user');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profile) return;
    setIsFollowLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${username}/follow`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unfollow user');

      setProfile({
        ...profile,
        isFollowing: false,
        _count: profile._count
          ? { ...profile._count, followers: profile._count.followers - 1 }
          : undefined,
      });
      toast.success(`Unfollowed @${username}`);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      toast.error('Failed to unfollow user');
    } finally {
      setIsFollowLoading(false);
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

  const isCurrentUser = currentUser?.id === profile.id;

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
          isFollowing={profile.isFollowing}
          isCurrentUser={isCurrentUser}
          isLoading={isFollowLoading}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          onEditProfile={() => router.push('/settings/profile')}
          onFollowersClick={() => router.push(`/profile/${username}/followers`)}
          onFollowingClick={() => router.push(`/profile/${username}/following`)}
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
              currentUserId={currentUser?.id}
              isLoading={postsLoading}
              hasMore={hasMore}
              loadMoreRef={sentinelRef}
              onLikePost={handleLikePost}
              onUnlikePost={handleUnlikePost}
              onPostClick={(postId) => router.push(`/post/${postId}`)}
            />
          </CardContent>
        </Card>
      </div>
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-2'>
            {profile.connectedPlatforms?.map((platform) => (
              <Badge key={platform.providerId}>{platform.providerId}</Badge>
            ))}
            {profile.connectedPlatforms?.length === 0 && (
              <p className='text-muted-foreground'>No connected platforms</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
