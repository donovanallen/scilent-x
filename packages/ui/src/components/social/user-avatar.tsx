'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Badge } from '../badge';
import { cn } from '../../utils';
import type { ProfileType } from '@scilent-one/db';

export interface UserAvatarProps {
  name?: string | null | undefined;
  username?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  image?: string | null | undefined;
  profileType?: ProfileType | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: (() => void) | undefined;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const fontSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const badgeSizeClasses = {
  sm: 'h-4 w-4 text-[0.6rem]',
  md: 'h-5 w-5 text-xs',
  lg: 'h-6 w-6 text-xs',
  xl: 'h-7 w-7 text-sm',
};

const profileTypeBadgeIcons = {
  VOICE: '✓',
  ARTIST: '★',
};

function getInitials(name?: string | null, username?: string | null): string {
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (username) {
    return username.slice(0, 2).toUpperCase();
  }
  return '?';
}

export function UserAvatar({
  name,
  username,
  avatarUrl,
  image,
  profileType,
  size = 'md',
  className,
  onClick,
}: UserAvatarProps) {
  const src = avatarUrl || image;
  const initials = getInitials(name, username);
  const showBadge = profileType && profileType !== 'USER';

  const badgeColors = {
    VOICE: 'bg-blue-600 text-white',
    ARTIST: 'bg-purple-600 text-white',
  };

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)} onClick={onClick}>
        {src && <AvatarImage src={src} alt={name || username || 'User'} />}
        <AvatarFallback className={fontSizeClasses[size]}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {showBadge && (
        <Badge
          className={cn(
            'absolute -bottom-1 -right-1 rounded-full border-2 border-background flex items-center justify-center p-0',
            badgeSizeClasses[size],
            badgeColors[profileType as keyof typeof badgeColors]
          )}
        >
          {
            profileTypeBadgeIcons[
              profileType as keyof typeof profileTypeBadgeIcons
            ]
          }
        </Badge>
      )}
    </div>
  );
}
