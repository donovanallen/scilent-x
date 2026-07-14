'use client';

import { cn } from '@scilent-one/ui';
import { Album, Music } from 'lucide-react';
import * as React from 'react';

export type ArtworkFallback = 'album' | 'track';

export interface ArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null | undefined;
  /** Fallback URLs tried in order when the primary src fails */
  fallbackSrc?: string[] | undefined;
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

const EMPTY_FALLBACKS: string[] = [];

const sizeClasses = {
  sm: 'size-10',
  md: 'size-16',
  lg: 'size-24',
  xl: 'size-32',
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
  fallbackSrc = EMPTY_FALLBACKS,
  alt,
  size = 'md',
  rounded = 'md',
  fallback = 'album',
  className,
  ...props
}: ArtworkProps) {
  const sources = React.useMemo(
    () => [src, ...fallbackSrc].filter((url): url is string => Boolean(url)),
    [src, fallbackSrc]
  );
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setSourceIndex(0);
    setHasError(false);
    setIsLoading(sources.length > 0);
  }, [sources]);

  const currentSrc = sources[sourceIndex];
  const showFallback = !currentSrc || hasError;

  const handleError = React.useCallback(() => {
    setSourceIndex((index) => {
      if (index < sources.length - 1) {
        setIsLoading(true);
        return index + 1;
      }
      setHasError(true);
      setIsLoading(false);
      return index;
    });
  }, [sources.length]);

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
          <img
            src={currentSrc}
            alt={alt}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={handleError}
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
