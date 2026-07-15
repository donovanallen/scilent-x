import * as React from 'react';
import { cn, Skeleton } from '@scilent-one/ui';
import { Album } from 'lucide-react';
import Image from 'next/image';

export interface AlbumArtworkProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** URL of the artwork image */
  src?: string | undefined;
  /** Fallback URLs tried in order when the primary src fails */
  fallbackSrc?: string[] | undefined;
  /** Alt text for the image */
  alt?: string | undefined;
  /**
   * Size of the artwork
   * - sm: 48x48 (3rem)
   * - md: 64x64 (4rem)
   * - lg: 128x128 (8rem)
   * - xl: 192x192 (12rem)
   * - 2xl: 256x256 (16rem)
   * - full: 100% width, aspect-square
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | undefined;
  /** Whether to show a loading skeleton */
  isLoading?: boolean | undefined;
  /** Whether to add shadow to the artwork */
  shadow?: boolean | undefined;
  /** Whether to enable hover scale effect */
  hoverEffect?: boolean | undefined;
  /** Border radius style */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | undefined;
}

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-32 w-32',
  xl: 'h-48 w-48',
  '2xl': 'h-64 w-64',
  full: 'w-full aspect-square',
} as const;

const sizePx: Record<
  Exclude<AlbumArtworkProps['size'], 'full' | undefined>,
  number
> = {
  sm: 48,
  md: 64,
  lg: 128,
  xl: 192,
  '2xl': 256,
};

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
} as const;

const EMPTY_FALLBACKS: string[] = [];

/**
 * Album artwork component that displays release cover art from various platforms.
 * Handles loading states, fallback placeholders, and optional visual effects.
 */
export function AlbumArtwork({
  src,
  fallbackSrc = EMPTY_FALLBACKS,
  alt = 'Album artwork',
  size = 'lg',
  isLoading = false,
  shadow = false,
  hoverEffect = false,
  rounded = 'md',
  className,
  ...props
}: AlbumArtworkProps) {
  const sources = React.useMemo(
    () => [src, ...fallbackSrc].filter((url): url is string => Boolean(url)),
    [src, fallbackSrc]
  );
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [hasFailed, setHasFailed] = React.useState(false);
  const [isImageLoading, setIsImageLoading] = React.useState(
    sources.length > 0
  );
  const currentSrc = !hasFailed ? sources[sourceIndex] : undefined;

  const sizeClass = sizeClasses[size];
  const roundedClass = roundedClasses[rounded];

  React.useEffect(() => {
    setSourceIndex(0);
    setHasFailed(false);
    setIsImageLoading(sources.length > 0);
  }, [sources]);

  const handleImageLoad = React.useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleImageError = React.useCallback(() => {
    setSourceIndex((index) => {
      if (index < sources.length - 1) {
        setIsImageLoading(true);
        return index + 1;
      }
      setIsImageLoading(false);
      setHasFailed(true);
      return index;
    });
  }, [sources.length]);

  // Loading state - skeleton
  if (isLoading) {
    return (
      <Skeleton
        className={cn(sizeClass, roundedClass, 'shrink-0', className)}
        {...props}
      />
    );
  }

  const containerClasses = cn(
    sizeClass,
    roundedClass,
    'shrink-0 overflow-hidden bg-muted',
    shadow && 'shadow-lg',
    className
  );

  // No source or all sources failed - show placeholder
  if (!currentSrc) {
    return (
      <div
        className={cn(containerClasses, 'flex items-center justify-center')}
        role="img"
        aria-label={alt}
        {...props}
      >
        <Album className="text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  const isFull = size === 'full';
  const px = !isFull ? sizePx[size] : undefined;

  return (
    <div className={cn(containerClasses, 'relative')} {...props}>
      {isImageLoading && <Skeleton className="absolute inset-0" />}
      <Image
        src={currentSrc}
        alt={alt}
        {...(isFull
          ? { fill: true as const, sizes: '100vw' }
          : { width: px!, height: px!, sizes: `${px}px` })}
        className={cn(
          'object-cover',
          isFull ? 'absolute inset-0 h-full w-full' : 'h-full w-full',
          hoverEffect &&
            'transition-transform duration-base ease-out group-hover:scale-105',
          isImageLoading && 'opacity-0'
        )}
        priority={size === 'xl' || size === '2xl'}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}

export interface AlbumArtworkSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: AlbumArtworkProps['size'];
  rounded?: AlbumArtworkProps['rounded'];
}

export function AlbumArtworkSkeleton({
  size = 'lg',
  rounded = 'md',
  className,
  ...props
}: AlbumArtworkSkeletonProps) {
  const sizeClass = sizeClasses[size];
  const roundedClass = roundedClasses[rounded];

  return (
    <Skeleton
      className={cn(sizeClass, roundedClass, 'shrink-0', className)}
      {...props}
    />
  );
}
