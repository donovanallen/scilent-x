'use client';

import * as React from 'react';
import {
  cn,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@scilent-one/ui';
import type { HarmonizedRelease } from '@scilent-one/harmony-engine';
import { AlbumArtwork } from './AlbumArtwork';
import { InteractiveWrapper } from '../../interactions/InteractiveWrapper';
import { ReleaseTypePill } from '../common';
import { ArtistCredit } from '../artist/ArtistCredit';
import { formatPartialDate, getFrontArtworkUrl } from '../../utils';

export interface AlbumCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onClick'
> {
  /** The harmonized release data */
  release: HarmonizedRelease;
  /** Optional artwork URL (overrides release artwork) */
  artworkUrl?: string | undefined;
  /** Whether to show release year */
  showYear?: boolean | undefined;
  /** Whether to show release type badge */
  showType?: boolean | undefined;
  /** Whether to show track count */
  showTrackCount?: boolean | undefined;
  /** Maximum number of artists to display before showing "+X more" */
  maxArtists?: number | undefined;
  /** Callback when the album is clicked */
  onClick?: ((release: HarmonizedRelease) => void) | undefined;
  /** Whether to enable interactive features (context menu, hover preview) */
  interactive?: boolean | undefined;
  /** Side to position the hover preview @default 'right' */
  previewSide?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  /** Alignment for the hover preview @default 'start' */
  previewAlign?: 'start' | 'center' | 'end' | undefined;
}

/**
 * Album card component that displays release information in a card layout.
 * Supports interactive features like context menus and hover previews.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AlbumCard release={release} />
 *
 * // With all options
 * <AlbumCard
 *   release={release}
 *   showYear
 *   showType
 *   showTrackCount
 *   maxArtists={2}
 *   onClick={(release) => navigate(`/album/${release.externalIds.spotify}`)}
 *   interactive
 *   previewSide="right"
 * />
 * ```
 */
export function AlbumCard({
  release,
  artworkUrl,
  showYear = true,
  showType = true,
  showTrackCount = false,
  maxArtists,
  onClick,
  interactive = false,
  previewSide = 'right',
  previewAlign = 'start',
  className,
  ...props
}: AlbumCardProps) {
  const handleClick = React.useCallback(() => {
    onClick?.(release);
  }, [onClick, release]);

  const imageUrl = artworkUrl ?? getFrontArtworkUrl(release.artwork);
  const trackCount = release.media.reduce((acc, m) => acc + m.tracks.length, 0);

  const card = (
    <Card
      className={cn(
        'overflow-hidden transition-colors cursor-pointer hover:bg-accent/50 group',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View ${release.title}`}
      {...props}
    >
      <div className="relative">
        <AlbumArtwork
          src={imageUrl}
          alt={release.title}
          size="full"
          rounded="none"
          hoverEffect
        />
      </div>

      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {release.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1">
        <ArtistCredit
          artists={release.artists}
          {...(maxArtists !== undefined && { maxDisplay: maxArtists })}
          className="text-sm line-clamp-1"
        />
        <div className="flex items-center gap-2 justify-between">
          {showYear && release.releaseDate?.year && (
            <span className="text-xs text-muted-foreground">
              {formatPartialDate(release.releaseDate)}
            </span>
          )}
          {showYear &&
            release.releaseDate?.year &&
            showTrackCount &&
            trackCount > 0 && <span>·</span>}
          {showType && release.releaseType && (
            <ReleaseTypePill
              releaseType={release.releaseType}
              uppercase
              className="ml-auto"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (interactive) {
    return (
      <InteractiveWrapper
        entityType="album"
        entity={release}
        previewSide={previewSide}
        previewAlign={previewAlign}
      >
        {card}
      </InteractiveWrapper>
    );
  }

  return card;
}

export interface AlbumCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show track count skeleton */
  showTrackCount?: boolean | undefined;
}

export function AlbumCardSkeleton({
  showTrackCount = false,
  className,
  ...props
}: AlbumCardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      <Skeleton className="aspect-square w-full" />
      <CardHeader className="p-3 pb-1">
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-1">
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          {showTrackCount && <Skeleton className="h-3 w-16" />}
        </div>
      </CardContent>
    </Card>
  );
}
