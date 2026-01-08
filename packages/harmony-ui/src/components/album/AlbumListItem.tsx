'use client';

import * as React from 'react';
import { cn, Skeleton } from '@scilent-one/ui';
import type { HarmonizedRelease } from '@scilent-one/harmony-engine';
import { Calendar, Disc, Music } from 'lucide-react';
import { AlbumArtwork } from './AlbumArtwork';
import { ArtistCredit } from '../artist/ArtistCredit';
import { ReleaseTypePill } from '../common';
import { PlatformBadgeList } from '../common';
import { InteractiveWrapper } from '../../interactions/InteractiveWrapper';
import { formatDuration, getFrontArtworkUrl } from '../../utils';

export interface AlbumListItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onClick'
> {
  /** The harmonized release data */
  release: HarmonizedRelease;
  /** Optional artwork URL (overrides release artwork) */
  artworkUrl?: string | undefined;
  /** Size of the artwork @default 'md' */
  artworkSize?: 'sm' | 'md' | 'lg' | undefined;
  /** Whether to show release year @default true */
  showYear?: boolean | undefined;
  /** Whether to show year icon @default true */
  showYearIcon?: boolean | undefined;
  /** Whether to show track count @default true */
  showTrackCount?: boolean | undefined;
  /** Whether to show track count icon @default true */
  showTrackCountIcon?: boolean | undefined;
  /** Whether to show total duration @default false */
  showDuration?: boolean | undefined;
  /** Whether to show duration icon @default true */
  showDurationIcon?: boolean | undefined;
  /** Whether to show release type badge @default true */
  showType?: boolean | undefined;
  /** Placement of release type badge @default 'metadata' */
  typePlacement?: 'title' | 'metadata' | undefined;
  /** Maximum number of artists to display before showing "+X more" */
  maxArtists?: number | undefined;
  /** Whether to show source/provider badges @default false */
  showProviders?: boolean | undefined;
  /** Whether to show abbreviated provider names @default true */
  abbreviatedProviders?: boolean | undefined;
  /** Whether to show colored provider badges @default false */
  coloredProviders?: boolean | undefined;
  /** Maximum number of providers to show @default undefined (all) */
  maxProviders?: number | undefined;
  /** Callback when the item is clicked */
  onClick?: ((release: HarmonizedRelease) => void) | undefined;
  /** Whether to enable interactive features (context menu, hover preview) @default false */
  interactive?: boolean | undefined;
  /** Side to position the hover preview @default 'right' */
  previewSide?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  /** Alignment for the hover preview @default 'start' */
  previewAlign?: 'start' | 'center' | 'end' | undefined;
}

/**
 * Album list item component that displays release information in a horizontal row layout.
 * Ideal for search results, lists, and tables. Supports interactive features.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AlbumListItem release={release} />
 *
 * // With providers and all metadata
 * <AlbumListItem
 *   release={release}
 *   showProviders
 *   showDuration
 *   maxArtists={3}
 *   onClick={(release) => navigate(`/album/${release.externalIds.spotify}`)}
 * />
 *
 * // Interactive with context menu and hover preview
 * <AlbumListItem
 *   release={release}
 *   interactive
 *   previewSide="bottom"
 * />
 * ```
 */
export function AlbumListItem({
  release,
  artworkUrl,
  artworkSize = 'md',
  showYear = true,
  showYearIcon = true,
  showTrackCount = true,
  showTrackCountIcon = true,
  showDuration = false,
  showDurationIcon = true,
  showType = true,
  typePlacement = 'metadata',
  maxArtists = 3,
  showProviders = false,
  abbreviatedProviders = true,
  coloredProviders = false,
  maxProviders,
  onClick,
  interactive = false,
  previewSide = 'right',
  previewAlign = 'start',
  className,
  ...props
}: AlbumListItemProps) {
  const handleClick = React.useCallback(() => {
    onClick?.(release);
  }, [onClick, release]);

  const imageUrl = artworkUrl ?? getFrontArtworkUrl(release.artwork);
  const year = release.releaseDate?.year;
  const trackCount = release.media.reduce((acc, m) => acc + m.tracks.length, 0);
  const totalDuration = release.media.reduce(
    (acc, m) =>
      acc + m.tracks.reduce((t, track) => t + (track.duration || 0), 0),
    0
  );
  const providers = release.sources.map((s) => s.provider);

  const element = (
    <div
      className={cn(
        'group flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-accent/50 cursor-pointer',
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
      aria-label={`Album: ${release.title}`}
      {...props}
    >
      <AlbumArtwork
        src={imageUrl}
        alt={release.title}
        size={artworkSize}
        rounded="md"
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start gap-2">
          <h3 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
            {release.title}
          </h3>
          {showType && typePlacement === 'title' && (
            <ReleaseTypePill
              releaseType={release.releaseType}
              variant="outline"
              uppercase
              className="text-[10px] shrink-0"
            />
          )}
        </div>

        <ArtistCredit
          artists={release.artists}
          {...(maxArtists !== undefined && { maxDisplay: maxArtists })}
          className="text-sm line-clamp-1"
        />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {showType && typePlacement === 'metadata' && (
            <ReleaseTypePill
              releaseType={release.releaseType}
              variant="outline"
              uppercase
              className="text-[10px] shrink-0"
            />
          )}
          {showYear && year && (
            <span className="inline-flex items-center gap-1">
              {showYearIcon && <Calendar className="size-3" />}
              {year}
            </span>
          )}
          {showTrackCount && trackCount > 0 && (
            <span className="inline-flex items-center gap-1">
              {showTrackCountIcon && <Music className="size-3" />}
              {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
            </span>
          )}
          {showDuration && totalDuration > 0 && (
            <span className="inline-flex items-center gap-1">
              {showDurationIcon && <Disc className="size-3" />}
              {formatDuration(totalDuration)}
            </span>
          )}
        </div>
      </div>

      {showProviders && providers.length > 0 && (
        <PlatformBadgeList
          platforms={providers}
          abbreviated={abbreviatedProviders}
          colored={coloredProviders}
          maxVisible={maxProviders}
          className="shrink-0"
        />
      )}
    </div>
  );

  if (interactive) {
    return (
      <InteractiveWrapper
        entityType="album"
        entity={release}
        previewSide={previewSide}
        previewAlign={previewAlign}
      >
        {element}
      </InteractiveWrapper>
    );
  }

  return element;
}

export interface AlbumListItemSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the artwork skeleton @default 'md' */
  artworkSize?: 'sm' | 'md' | 'lg' | undefined;
  /** Whether to show provider badges skeleton @default false */
  showProviders?: boolean | undefined;
}

const artworkSizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-32 w-32',
} as const;

export function AlbumListItemSkeleton({
  artworkSize = 'md',
  showProviders = false,
  className,
  ...props
}: AlbumListItemSkeletonProps) {
  return (
    <div
      className={cn('flex items-center gap-4 p-3 rounded-lg', className)}
      {...props}
    >
      <Skeleton
        className={cn(artworkSizeClasses[artworkSize], 'rounded-md shrink-0')}
      />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      {showProviders && (
        <div className="flex gap-1 shrink-0">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-5 w-8" />
        </div>
      )}
    </div>
  );
}
