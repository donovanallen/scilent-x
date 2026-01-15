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
} from '@scilent-one/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, use } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { ApiError, fetcher } from '@/lib/swr';
import { useMentionSearch } from '@/lib/use-mention-search';

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
}

interface FeedPost extends PostCardProps {
  _count?: {
    likes: number;
    comments: number;
  };
}

interface PaginatedPosts {
  items: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface ProfileResponse extends UserProfile {
  posts?: PaginatedPosts;
}

interface CurrentUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const { searchUsers, searchArtists } = useMentionSearch();
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { data: currentUser } = useSWR<CurrentUser>(
    '/api/v1/users/me',
    fetcher
  );

  const getKey = (
    pageIndex: number,
    previousPageData: ProfileResponse | null
  ) => {
    if (pageIndex === 0) {
      return `/api/v1/users/${username}?includePosts=true`;
    }
    if (
      !previousPageData?.posts?.hasMore ||
      !previousPageData.posts?.nextCursor
    ) {
      return null;
    }
    return `/api/v1/users/${username}?includePosts=true&cursor=${encodeURIComponent(
      previousPageData.posts.nextCursor
    )}`;
  };

  const {
    data: profilePages,
    error: profileError,
    isLoading,
    isValidating,
    setSize,
    mutate,
  } = useSWRInfinite<ProfileResponse>(getKey, fetcher);

  useEffect(() => {
    if (!profileError) return;
    if (profileError instanceof ApiError && profileError.status === 404) {
      router.push('/feed');
      toast.error('User not found');
      return;
    }
    console.error('Failed to load profile:', profileError);
    toast.error('Failed to load profile');
  }, [profileError, router]);

  const profile = useMemo(() => {
    const firstPage = profilePages?.[0];
    if (!firstPage) return null;
    const { posts: _posts, ...rest } = firstPage;
    return rest;
  }, [profilePages]);

  const posts = useMemo(
    () =>
      profilePages?.flatMap((page) => page.posts?.items ?? []) ??
      ([] as FeedPost[]),
    [profilePages]
  );
  const lastPage = profilePages?.[profilePages.length - 1];
  const hasMore = lastPage?.posts?.hasMore ?? false;
  const isProfileLoading = isLoading && !profilePages;
  const isPostsLoading = isLoading || isValidating;

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isPostsLoading,
    onLoadMore: () => setSize((size) => size + 1),
  });

  const handleFollow = async () => {
    if (!profile) return;
    setIsFollowLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${username}/follow`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to follow user');

      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            isFollowing: true,
            _count: page._count
              ? { ...page._count, followers: page._count.followers + 1 }
              : page._count,
          })),
        { revalidate: false }
      );
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

      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            isFollowing: false,
            _count: page._count
              ? { ...page._count, followers: page._count.followers - 1 }
              : page._count,
          })),
        { revalidate: false }
      );
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

      mutate(
        (pages) =>
          pages?.map((page) => {
            if (!page.posts) {
              return page;
            }
            return {
              ...page,
              posts: {
                ...page.posts,
                items: page.posts.items.map((post) => {
                  if (post.id !== postId) return post;
                  const currentLikes =
                    post._count?.likes ?? post.likesCount ?? 0;
                  return {
                    ...post,
                    isLiked: true,
                    likesCount: currentLikes + 1,
                    ...(post._count && {
                      _count: { ...post._count, likes: currentLikes + 1 },
                    }),
                  };
                }),
              },
            };
          }),
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
          pages?.map((page) => {
            if (!page.posts) {
              return page;
            }
            return {
              ...page,
              posts: {
                ...page.posts,
                items: page.posts.items.map((post) => {
                  if (post.id !== postId) return post;
                  const currentLikes =
                    post._count?.likes ?? post.likesCount ?? 0;
                  return {
                    ...post,
                    isLiked: false,
                    likesCount: currentLikes - 1,
                    ...(post._count && {
                      _count: { ...post._count, likes: currentLikes - 1 },
                    }),
                  };
                }),
              },
            };
          }),
        { revalidate: false }
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

    const originalPages = profilePages;

    // Optimistic update
    mutate(
      (pages) =>
        pages?.map((page) => {
          if (!page.posts) {
            return page;
          }
          return {
            ...page,
            posts: {
              ...page.posts,
              items: page.posts.items.map((post) =>
                post.id === postId ? { ...post, content, contentHtml } : post
              ),
            },
          };
        }),
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

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete post');

      mutate(
        (pages) =>
          pages?.map((page) => {
            if (!page.posts) {
              return page;
            }
            return {
              ...page,
              posts: {
                ...page.posts,
                items: page.posts.items.filter((post) => post.id !== postId),
              },
            };
          }),
        { revalidate: false }
      );
      toast.success('Post deleted');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (isProfileLoading) {
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
    <div className='w-full h-full min-h-0 max-w-4xl mx-auto'>
      <div className='flex flex-col space-y-6'>
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
          isCurrentUser={false}
          isLoading={isFollowLoading}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
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
              isLoading={isPostsLoading}
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
              onAuthorClick={(clickedUsername) =>
                router.push(`/profile/${clickedUsername}`)
              }
              onMentionClick={(clickedUsername) =>
                router.push(`/profile/${clickedUsername}`)
              }
              onMentionQuery={searchUsers}
              onArtistMentionQuery={searchArtists}
              renderArtistMention={(props) => <ArtistMention {...props} />}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
