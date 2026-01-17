'use client';

import * as React from 'react';
import {
  cn,
  Skeleton,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@scilent-one/ui';
import { Music } from 'lucide-react';

export interface TrackArtworkProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** URL of the artwork image */
  src?: string | undefined;
  /** Alt text for the image */
  alt?: string | undefined;
  /** Size of the artwork */
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  /** Border radius style */
  rounded?: 'sm' | 'md' | 'lg' | undefined;
  /** Whether to show a loading skeleton */
  isLoading?: boolean | undefined;
}

const sizeClasses = {
  xs: 'size-8',
  sm: 'size-10',
  md: 'size-12',
  lg: 'size-16',
} as const;

const iconSizes = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
} as const;

/**
 * Track artwork component that displays album/track artwork with fallback.
 * Uses Avatar pattern for consistent loading states and fallback handling.
 *
 * @example
 * ```tsx
 * <TrackArtwork src={artworkUrl} alt="Track title" />
 * <TrackArtwork size="lg" rounded="lg" />
 * ```
 */
export function TrackArtwork({
  src,
  alt = 'Track artwork',
  size = 'md',
  rounded = 'md',
  isLoading = false,
  className,
  ...props
}: TrackArtworkProps) {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];
  const roundedClass = roundedClasses[rounded];

  if (isLoading) {
    return (
      <Skeleton
        className={cn(sizeClass, roundedClass, 'shrink-0', className)}
        {...props}
      />
    );
  }

  return (
    <Avatar
      className={cn(sizeClass, roundedClass, 'shrink-0', className)}
      {...props}
    >
      {src && <AvatarImage src={src} alt={alt} className="object-cover" />}
      <AvatarFallback
        className={cn(
          roundedClass,
          'bg-muted text-muted-foreground'
        )}
      >
        <Music className={iconSize} />
      </AvatarFallback>
    </Avatar>
  );
}

export interface TrackArtworkSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the skeleton */
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  /** Border radius style */
  rounded?: 'sm' | 'md' | 'lg' | undefined;
}

export function TrackArtworkSkeleton({
  size = 'md',
  rounded = 'md',
  className,
  ...props
}: TrackArtworkSkeletonProps) {
  return (
    <Skeleton
      className={cn(sizeClasses[size], roundedClasses[rounded], 'shrink-0', className)}
      {...props}
    />
  );
}
