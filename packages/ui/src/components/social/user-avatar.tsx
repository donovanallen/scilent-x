'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { cn } from '../../utils';

export interface UserAvatarProps {
  name?: string | null | undefined;
  username?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  image?: string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
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
  size = 'md',
  className,
}: UserAvatarProps) {
  const src = avatarUrl || image;
  const initials = getInitials(name, username);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={name || username || 'User'} />}
      <AvatarFallback className={fontSizeClasses[size]}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
