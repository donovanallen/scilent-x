'use client';

import * as React from 'react';
import { Card, CardContent } from '../card';
import { UserAvatar } from './user-avatar';
import { FollowButton } from './follow-button';
import { cn } from '../../utils';

export interface UserCardProps {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  followersCount?: number | undefined;
  followingCount?: number | undefined;
  postsCount?: number | undefined;
  isFollowing?: boolean | undefined;
  isCurrentUser?: boolean | undefined;
  isLoading?: boolean | undefined;
  onFollow?: (() => void | Promise<void>) | undefined;
  onUnfollow?: (() => void | Promise<void>) | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}

export function UserCard({
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
  onClick,
  className,
}: UserCardProps) {
  return (
    <Card
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <UserAvatar
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            image={image}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="font-semibold truncate">
                  {name || username || 'Anonymous'}
                </h5>
                {username && (
                  <p className="text-muted-foreground text-sm">@{username}</p>
                )}
              </div>
              {!isCurrentUser && onFollow && onUnfollow && (
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                  {/* Icon-only on small screens */}
                  <FollowButton
                    isFollowing={isFollowing}
                    isLoading={isLoading}
                    onFollow={() => onFollow()}
                    onUnfollow={() => onUnfollow()}
                    iconOnly
                    className="sm:hidden"
                  />
                  {/* Full button on larger screens */}
                  <FollowButton
                    isFollowing={isFollowing}
                    isLoading={isLoading}
                    onFollow={() => onFollow()}
                    onUnfollow={() => onUnfollow()}
                    size="sm"
                    className="hidden sm:inline-flex"
                  />
                </div>
              )}
            </div>
            {bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {bio}
              </p>
            )}
            {(followersCount !== undefined ||
              followingCount !== undefined ||
              postsCount !== undefined) && (
              <div className="flex items-center gap-4 mt-3 text-sm">
                {postsCount !== undefined && (
                  <div>
                    <span className="font-semibold">{postsCount}</span>{' '}
                    <span className="text-muted-foreground">posts</span>
                  </div>
                )}
                {followersCount !== undefined && (
                  <div>
                    <span className="font-semibold">{followersCount}</span>{' '}
                    <span className="text-muted-foreground">followers</span>
                  </div>
                )}
                {followingCount !== undefined && (
                  <div>
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
