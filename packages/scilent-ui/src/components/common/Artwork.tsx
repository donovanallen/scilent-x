'use client';

import { cn } from '@scilent-one/ui';
import { Album, Music } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

export type ArtworkFallback = 'album' | 'track';

export interface ArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /**
   * Icon shown when artwork is missing or fails to load.
   * - `album`: album/release icon (default)
   * - `track`: music note
   */
  fallback?: ArtworkFallback;
}

const sizeClasses = {
  sm: 'size-10',
  md: 'size-16',
  lg: 'size-24',
  xl: 'size-32',
} as const;

const sizePx = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 128,
} as const;

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const;

function FallbackIcon({
  fallback,
  className,
}: {
  fallback: ArtworkFallback;
  className?: string;
}) {
  if (fallback === 'track') {
    return <Music className={className} aria-hidden="true" />;
  }
  return <Album className={className} aria-hidden="true" />;
}

export function Artwork({
  src,
  alt,
  size = 'md',
  rounded = 'md',
  fallback = 'album',
  className,
  ...props
}: ArtworkProps) {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const showFallback = !src || hasError;
  const px = sizePx[size];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted flex-shrink-0',
        sizeClasses[size],
        roundedClasses[rounded],
        className
      )}
      {...props}
    >
      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
          <FallbackIcon
            fallback={fallback}
            className="size-1/2 text-muted-foreground/40"
          />
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <Image
            src={src}
            alt={alt}
            width={px}
            height={px}
            sizes={`${px}px`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            className={cn(
              'absolute inset-0 size-full object-cover transition-opacity duration-200',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
          />
        </>
      )}
    </div>
  );
}
