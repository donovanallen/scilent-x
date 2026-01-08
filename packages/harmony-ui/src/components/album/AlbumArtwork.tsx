import * as React from 'react';
import { cn, Skeleton } from '@scilent-one/ui';
import { Disc3 } from 'lucide-react';

export interface AlbumArtworkProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** URL of the artwork image */
  src?: string | undefined;
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

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
} as const;

/**
 * Album artwork component that displays release cover art from various platforms.
 * Handles loading states, fallback placeholders, and optional visual effects.
 */
export function AlbumArtwork({
  src,
  alt = 'Album artwork',
  size = 'lg',
  isLoading = false,
  shadow = false,
  hoverEffect = false,
  rounded = 'md',
  className,
  ...props
}: AlbumArtworkProps) {
  const [hasError, setHasError] = React.useState(false);
  const [isImageLoading, setIsImageLoading] = React.useState(!!src);

  const sizeClass = sizeClasses[size];
  const roundedClass = roundedClasses[rounded];

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false);
    setIsImageLoading(!!src);
  }, [src]);

  const handleImageLoad = React.useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleImageError = React.useCallback(() => {
    setHasError(true);
    setIsImageLoading(false);
  }, []);

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

  // No source or error - show placeholder
  if (!src || hasError) {
    return (
      <div
        className={cn(containerClasses, 'flex items-center justify-center')}
        role="img"
        aria-label={alt}
        {...props}
      >
        <Disc3 className="size-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(containerClasses, 'relative')} {...props}>
      {/* Show skeleton while image is loading */}
      {isImageLoading && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        className={cn(
          'h-full w-full object-cover',
          hoverEffect &&
            'transition-transform duration-300 group-hover:scale-105',
          isImageLoading && 'opacity-0'
        )}
        loading="lazy"
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
