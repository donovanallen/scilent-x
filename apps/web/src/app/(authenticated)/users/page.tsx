'use client';

import {
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Switch,
  UserCard,
  useInfiniteScroll,
} from '@scilent-one/ui';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  Filter,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { fetcher } from '@/lib/swr';

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

interface PaginatedResponse {
  items: UserProfile[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface CurrentUser {
  id: string;
}

type SortField = 'createdAt' | 'name' | 'username' | 'followers' | 'posts';
type SortOrder = 'asc' | 'desc';

const sortFieldLabels: Record<SortField, string> = {
  createdAt: 'Date Joined',
  name: 'Name',
  username: 'Username',
  followers: 'Followers',
  posts: 'Posts',
};

export default function UsersPage() {
  const router = useRouter();

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [hasUsername, setHasUsername] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: currentUser } = useSWR<CurrentUser>(
    '/api/v1/users/me',
    fetcher
  );

  const buildUsersKey = (cursorParam?: string) => {
    const params = new URLSearchParams();
    if (cursorParam) {
      params.set('cursor', cursorParam);
    }
    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    }
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (hasUsername) {
      params.set('hasUsername', 'true');
    }

    const query = params.toString();
    return query ? `/api/v1/users?${query}` : '/api/v1/users';
  };

  const getKey = (
    pageIndex: number,
    previousPageData: PaginatedResponse | null
  ) => {
    if (pageIndex === 0) {
      return buildUsersKey();
    }
    if (!previousPageData?.hasMore || !previousPageData.nextCursor) {
      return null;
    }
    return buildUsersKey(previousPageData.nextCursor);
  };

  const {
    data: userPages,
    error: usersError,
    isLoading,
    isValidating,
    setSize,
    mutate,
  } = useSWRInfinite<PaginatedResponse>(getKey, fetcher);

  useEffect(() => {
    if (!usersError) return;
    console.error('Failed to load users:', usersError);
    toast.error('Failed to load users');
  }, [usersError]);

  useEffect(() => {
    setSize(1);
  }, [debouncedQuery, sortBy, sortOrder, hasUsername, setSize]);

  const users = useMemo(
    () => userPages?.flatMap((page) => page.items) ?? [],
    [userPages]
  );
  const lastPage = userPages?.[userPages.length - 1];
  const hasMore = lastPage?.hasMore ?? false;
  const isUsersLoading = isLoading && !userPages;
  const isPageLoading = isLoading || isValidating;

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isPageLoading,
    onLoadMore: () => setSize((size) => size + 1),
  });

  const handleFollow = async (username: string | null | undefined) => {
    // Defensive check: ensure username is valid before making API call
    if (!username) {
      console.error('Cannot follow user without username');
      return;
    }

    try {
      const res = await fetch(`/api/v1/users/${username}/follow`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to follow user');

      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.map((user) =>
              user.username === username
                ? {
                    ...user,
                    isFollowing: true,
                    followersCount: user.followersCount + 1,
                  }
                : user
            ),
          })),
        { revalidate: false }
      );
      toast.success(`Following @${username}`);
    } catch (error) {
      console.error('Failed to follow user:', error);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (username: string | null | undefined) => {
    // Defensive check: ensure username is valid before making API call
    if (!username) {
      console.error('Cannot unfollow user without username');
      return;
    }

    try {
      const res = await fetch(`/api/v1/users/${username}/follow`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unfollow user');

      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            items: page.items.map((user) =>
              user.username === username
                ? {
                    ...user,
                    isFollowing: false,
                    followersCount: user.followersCount - 1,
                  }
                : user
            ),
          })),
        { revalidate: false }
      );
      toast.success(`Unfollowed @${username}`);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      toast.error('Failed to unfollow user');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setHasUsername(false);
  };

  const hasActiveFilters =
    searchQuery ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc' ||
    hasUsername;

  return (
    <div className='flex flex-col h-full min-h-0 space-y-6'>
      <div className='mb-6'>
        <h2>Users</h2>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='pt-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            {/* Search Input */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by name, username, or bio...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            <div className='flex items-center gap-2'>
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <SlidersHorizontal className='h-4 w-4 mr-2' />
                    Sort
                    {sortBy !== 'createdAt' && (
                      <span className='ml-1 text-xs text-muted-foreground'>
                        ({sortFieldLabels[sortBy]})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(sortFieldLabels) as SortField[]).map(
                    (field) => (
                      <DropdownMenuItem
                        key={field}
                        onClick={() => setSortBy(field)}
                        className={sortBy === field ? 'bg-accent' : ''}
                      >
                        {field === 'createdAt' && (
                          <Calendar className='h-4 w-4 mr-2' />
                        )}
                        {sortFieldLabels[field]}
                      </DropdownMenuItem>
                    )
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Order</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setSortOrder('asc')}
                    className={sortOrder === 'asc' ? 'bg-accent' : ''}
                  >
                    <ArrowUpAZ className='h-4 w-4 mr-2' />
                    Ascending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOrder('desc')}
                    className={sortOrder === 'desc' ? 'bg-accent' : ''}
                  >
                    <ArrowDownAZ className='h-4 w-4 mr-2' />
                    Descending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Filter className='h-4 w-4 mr-2' />
                    Filter
                    {hasUsername && (
                      <span className='ml-1 rounded-full bg-primary/10 px-1.5 text-xs'>
                        1
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel>Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className='p-2'>
                    <div className='flex items-center justify-between'>
                      <label
                        htmlFor='has-username'
                        className='text-sm cursor-pointer'
                      >
                        Has username
                      </label>
                      <Switch
                        id='has-username'
                        checked={hasUsername}
                        onCheckedChange={setHasUsername}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  <X className='h-4 w-4 mr-1' />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {isUsersLoading && users.length === 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-40' />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className='py-12'>
            <div className='text-center text-muted-foreground'>
              <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium'>No users found</p>
              <p className='text-sm mt-1'>
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'No users have joined yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {users.map((user) => {
              const username = user.username;

              return (
                <UserCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  username={username}
                  bio={user.bio}
                  avatarUrl={user.avatarUrl}
                  image={user.image}
                  followersCount={user.followersCount}
                  followingCount={user.followingCount}
                  isFollowing={user.isFollowing}
                  showFollowButton={true}
                  isCurrentUser={currentUser?.id === user.id}
                  onFollow={username ? () => handleFollow(username) : undefined}
                  onUnfollow={
                    username ? () => handleUnfollow(username) : undefined
                  }
                  onClick={() =>
                    username && router.push(`/profile/${username}`)
                  }
                />
              );
            })}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className='flex justify-center py-4'>
              {isPageLoading && <Skeleton className='h-40 w-full max-w-sm' />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
