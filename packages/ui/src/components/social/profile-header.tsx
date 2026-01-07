'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '../card';
import { Button } from '../button';
import { UserAvatar } from './user-avatar';
import { FollowButton } from './follow-button';
import { cn } from '../../utils';

export interface ProfileHeaderProps {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean | undefined;
  isCurrentUser?: boolean | undefined;
  isLoading?: boolean | undefined;
  onFollow?: (() => void | Promise<void>) | undefined;
  onUnfollow?: (() => void | Promise<void>) | undefined;
  onEditProfile?: (() => void) | undefined;
  onFollowersClick?: (() => void) | undefined;
  onFollowingClick?: (() => void) | undefined;
  className?: string | undefined;
}

export function ProfileHeader({
  id,
  name,
  username,
  bio,
  avatarUrl,
  image,
  followersCount,
  followingCount,
  postsCount,
  isFollowing = false,
  isCurrentUser = false,
  isLoading = false,
  onFollow,
  onUnfollow,
  onEditProfile,
  onFollowersClick,
  onFollowingClick,
  className,
}: ProfileHeaderProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className='pt-6'>
        <div className='flex flex-col sm:flex-row items-start gap-4'>
          <UserAvatar
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            image={image}
            size='xl'
          />
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h1 className='text-2xl font-bold truncate'>
                  {name || username || 'Anonymous'}
                </h1>
                {username && (
                  <p className='text-muted-foreground'>@{username}</p>
                )}
              </div>
              {isCurrentUser ? (
                <Button variant='outline' onClick={onEditProfile}>
                  <Settings className='mr-2 h-4 w-4' />
                  Edit Profile
                </Button>
              ) : (
                onFollow &&
                onUnfollow && (
                  <FollowButton
                    isFollowing={isFollowing}
                    isLoading={isLoading}
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                  />
                )
              )}
            </div>

            {bio && (
              <p className='mt-3 text-muted-foreground whitespace-pre-wrap'>
                {bio}
              </p>
            )}

            <div className='flex items-center gap-6 mt-4'>
              <div>
                <span className='font-semibold'>{postsCount}</span>{' '}
                <span className='text-muted-foreground'>posts</span>
              </div>
              <button
                type='button'
                className='hover:underline'
                onClick={onFollowersClick}
              >
                <span className='font-semibold'>{followersCount}</span>{' '}
                <span className='text-muted-foreground'>followers</span>
              </button>
              <button
                type='button'
                className='hover:underline'
                onClick={onFollowingClick}
              >
                <span className='font-semibold'>{followingCount}</span>{' '}
                <span className='text-muted-foreground'>following</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
