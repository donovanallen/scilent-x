'use client';

import { useCallback, useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  Button,
  UserCard,
  useInfiniteScroll,
  Skeleton,
} from '@scilent-one/ui';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  isFollowing?: boolean;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface PaginatedResponse {
  items: UserProfile[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface CurrentUser {
  id: string;
}

export default function FollowersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
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

  // Fetch followers
  const fetchFollowers = useCallback(
    async (cursorParam?: string) => {
      try {
        const url = new URL(
          `/api/v1/users/${username}/followers`,
          window.location.origin
        );
        if (cursorParam) {
          url.searchParams.set('cursor', cursorParam);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch followers');

        const data: PaginatedResponse = await res.json();

        setFollowers((prev) =>
          cursorParam ? [...prev, ...data.items] : data.items
        );
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch (error) {
        toast.error('Failed to load followers');
      } finally {
        setIsLoading(false);
      }
    },
    [username]
  );

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => cursor && fetchFollowers(cursor),
  });

  const handleFollow = async (targetUsername: string) => {
    try {
      const res = await fetch(`/api/v1/users/${targetUsername}/follow`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to follow user');

      setFollowers((prev) =>
        prev.map((user) =>
          user.username === targetUsername
            ? { ...user, isFollowing: true }
            : user
        )
      );
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (targetUsername: string) => {
    try {
      const res = await fetch(`/api/v1/users/${targetUsername}/follow`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unfollow user');

      setFollowers((prev) =>
        prev.map((user) =>
          user.username === targetUsername
            ? { ...user, isFollowing: false }
            : user
        )
      );
    } catch (error) {
      toast.error('Failed to unfollow user');
    }
  };

  return (
    <div className='container max-w-2xl py-6 space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-xl font-bold'>@{username}'s Followers</h1>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-24 w-full' />
        </div>
      ) : followers.length === 0 ? (
        <p className='text-center text-muted-foreground py-8'>
          No followers yet
        </p>
      ) : (
        <div className='space-y-4'>
          {followers.map((user) => (
            <UserCard
              key={user.id}
              {...user}
              followersCount={user._count?.followers}
              followingCount={user._count?.following}
              postsCount={user._count?.posts}
              isCurrentUser={currentUser?.id === user.id}
              onFollow={user.username ? () => handleFollow(user.username!) : undefined}
              onUnfollow={user.username ? () => handleUnfollow(user.username!) : undefined}
              onClick={() =>
                user.username && router.push(`/profile/${user.username}`)
              }
            />
          ))}
          {hasMore && <div ref={sentinelRef} className='h-10' />}
        </div>
      )}
    </div>
  );
}
