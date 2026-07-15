'use client';

import * as React from 'react';
import { Card, CardContent } from '../card';
import { UserAvatar } from './user-avatar';
import { FollowButton } from './follow-button';
import { ProfileTypePill } from '../profile-type-pill';
import { cn } from '../../utils';
import type { ProfileType } from '../profile-type';

export interface UserCardProps {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  profileType?: ProfileType | null | undefined;
  showFollowButton?: boolean | undefined;
  followersCount?: number | undefined;
  followingCount?: number | undefined;
  isFollowing?: boolean | undefined;
  isCurrentUser?: boolean | undefined;
  isLoading?: boolean | undefined;
  onFollow?: (() => void | Promise<void>) | undefined;
  onUnfollow?: (() => void | Promise<void>) | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}

/**
 * A compact user profile card for displaying user information in lists and grids.
 * Styled consistently with ProfileHeader and other social components.
 */
export function UserCard({
  // id,
  name,
  username,
  bio,
  avatarUrl,
  image,
  profileType,
  showFollowButton = false,
  followersCount,
  followingCount,
  isFollowing = false,
  isCurrentUser = false,
  isLoading = false,
  onFollow,
  onUnfollow,
  onClick,
  className,
}: UserCardProps) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <Card
      className={cn(
        'transition-colors overflow-hidden',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            image={image}
            profileType={profileType}
            size="lg"
            onClick={onClick}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1" onClick={onClick}>
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate leading-tight">
                    {name || username || 'Anonymous'}
                  </p>
                  {profileType && profileType !== 'USER' && (
                    <ProfileTypePill profileType={profileType} />
                  )}
                </div>
                {username && (
                  <p className="text-muted-foreground text-sm truncate mt-0.5">
                    @{username}
                  </p>
                )}
              </div>
              {!isCurrentUser && showFollowButton && onFollow && onUnfollow && (
                <div className="shrink-0">
                  {/* Icon-only on small/medium screens */}
                  <FollowButton
                    isFollowing={isFollowing}
                    isLoading={isLoading}
                    onFollow={() => onFollow()}
                    onUnfollow={() => onUnfollow()}
                    iconOnly
                    className="lg:hidden"
                  />
                  {/* Full button on larger screens */}
                  <FollowButton
                    isFollowing={isFollowing}
                    isLoading={isLoading}
                    onFollow={() => onFollow()}
                    onUnfollow={() => onUnfollow()}
                    size="sm"
                    className="hidden lg:inline-flex"
                  />
                </div>
              )}
            </div>
            {bio && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {bio}
              </p>
            )}
            {(followersCount !== undefined || followingCount !== undefined) && (
              <div className="flex items-center gap-4 mt-4 text-sm">
                {followersCount !== undefined && (
                  <div className="whitespace-nowrap">
                    <span className="font-semibold">{followersCount}</span>{' '}
                    <span className="text-muted-foreground">followers</span>
                  </div>
                )}
                {followingCount !== undefined && (
                  <div className="whitespace-nowrap">
                    <span className="font-semibold">{followingCount}</span>{' '}
                    <span className="text-muted-foreground">following</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
