'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { UserAvatar } from './user-avatar';
import { FollowButton } from './follow-button';
import { cn } from '../../utils';

/** Connected streaming platform information */
export interface ConnectedPlatform {
  providerId: string;
  connectedAt?: Date;
}

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
  /** Connected streaming platforms (Tidal, Spotify, etc.) */
  connectedPlatforms?: ConnectedPlatform[] | undefined;
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

/** Platform display labels and colors */
const platformConfig: Record<string, { label: string; color: string }> = {
  tidal: {
    label: 'Tidal',
    color: 'bg-black text-white',
  },
  spotify: {
    label: 'Spotify',
    color: 'bg-[#1DB954] text-white',
  },
  apple_music: {
    label: 'Apple Music',
    color: 'bg-[#FA243C] text-white',
  },
};

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
  connectedPlatforms = [],
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
      <CardContent className='pt-4 sm:pt-6 px-3 sm:px-6'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4'>
          <UserAvatar
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            image={image}
            size='xl'
            className='shrink-0'
          />
          <div className='flex-1 min-w-0 w-full'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-4'>
              <div className='text-center sm:text-left'>
                <h1 className='text-xl sm:text-2xl font-bold truncate'>
                  {name || username || 'Anonymous'}
                </h1>
                {username && (
                  <p className='text-muted-foreground text-sm sm:text-base'>@{username}</p>
                )}
                {connectedPlatforms.length > 0 && (
                  <div className='flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2'>
                    {connectedPlatforms.map((platform) => {
                      const config = platformConfig[platform.providerId] || {
                        label: platform.providerId,
                        color: 'bg-muted text-muted-foreground',
                      };
                      return (
                        <Badge
                          key={platform.providerId}
                          variant='secondary'
                          className={cn('text-xs', config.color)}
                        >
                          {config.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              {isCurrentUser ? (
                <Button 
                  variant='outline' 
                  onClick={onEditProfile}
                  className='w-full sm:w-auto touch-target'
                >
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
                    className='w-full sm:w-auto'
                  />
                )
              )}
            </div>

            {bio && (
              <p className='mt-3 text-muted-foreground whitespace-pre-wrap text-center sm:text-left text-sm sm:text-base'>
                {bio}
              </p>
            )}

            <div className='flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4'>
              <div className='text-center sm:text-left'>
                <span className='font-semibold'>{postsCount}</span>{' '}
                <span className='text-muted-foreground text-sm'>posts</span>
              </div>
              <button
                type='button'
                className='hover:underline active:opacity-70 touch-target flex items-center'
                onClick={onFollowersClick}
              >
                <span className='font-semibold'>{followersCount}</span>{' '}
                <span className='text-muted-foreground text-sm'>followers</span>
              </button>
              <button
                type='button'
                className='hover:underline active:opacity-70 touch-target flex items-center'
                onClick={onFollowingClick}
              >
                <span className='font-semibold'>{followingCount}</span>{' '}
                <span className='text-muted-foreground text-sm'>following</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
