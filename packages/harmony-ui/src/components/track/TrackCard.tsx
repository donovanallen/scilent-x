'use client';

import * as React from 'react';
import { cn, Card, CardContent, Badge, Skeleton } from '@scilent-one/ui';
import type { HarmonizedTrack } from '@scilent-one/harmony-engine';
import { Clock, ExternalLink } from 'lucide-react';
import { formatDuration, formatTrackPosition } from '../../utils';
import { TrackArtwork } from './TrackArtwork';
import { ArtistCredit } from '../artist/ArtistCredit';
import { InteractiveWrapper } from '../../interactions/InteractiveWrapper';

export interface TrackCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onPlay'
> {
  /** The harmonized track data */
  track: HarmonizedTrack;
  /** Visual variant - 'card' wraps in Card component, 'list' renders as simple div @default 'card' */
  variant?: 'card' | 'list' | undefined;
  /** Optional artwork URL */
  artworkUrl?: string | undefined;
  /** Whether to show artwork (only applies to 'card' variant) @default true for card, false for list */
  showArtwork?: boolean | undefined;
  /** Whether to show the track position */
  showPosition?: boolean | undefined;
  /** Whether to show the disc number */
  showDiscNumber?: boolean | undefined;
  /** Whether to show the ISRC code */
  showIsrc?: boolean | undefined;
  /** Show ISRC inline with artists instead of below content @default false */
  inlineIsrc?: boolean | undefined;
  /** Whether to show source/provider badges */
  showSources?: boolean | undefined;
  /** Show full provider names instead of just initials @default false */
  fullProviderNames?: boolean | undefined;
  /** Maximum number of sources to display */
  maxSources?: number | undefined;
  /** Whether to show clock icon before duration @default false */
  showDurationIcon?: boolean | undefined;
  /** Whether to show hover overlay with external link (mutually exclusive with subtleExternalLink) */
  showExternalLink?: boolean | undefined;
  /** Whether to show subtle external link icon on hover (mutually exclusive with showExternalLink) */
  subtleExternalLink?: boolean | undefined;
  /** Maximum number of artists to display before showing "+X more" */
  maxArtists?: number | undefined;
  /** Whether the track is currently playing */
  isPlaying?: boolean | undefined;
  /** Callback when the track is clicked */
  onPlay?: ((track: HarmonizedTrack) => void) | undefined;
  /** Whether to enable interactive features (context menu, hover preview) */
  interactive?: boolean | undefined;
  /** Side to position the hover preview @default 'right' */
  previewSide?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  /** Alignment for the hover preview @default 'start' */
  previewAlign?: 'start' | 'center' | 'end' | undefined;
}

/**
 * Track card/list item component that displays track information.
 * Supports two variants: 'card' (wrapped in Card) and 'list' (simple row).
 * Also supports interactive features like context menus and hover previews.
 *
 * @example
 * ```tsx
 * // Card variant (default)
 * <TrackCard track={track} />
 *
 * // List variant (compact row style)
 * <TrackCard
 *   track={track}
 *   variant="list"
 *   showArtwork={false}
 *   showDurationIcon
 *   fullProviderNames
 *   inlineIsrc
 *   subtleExternalLink
 * />
 *
 * // With all card options
 * <TrackCard
 *   track={track}
 *   showPosition
 *   showIsrc
 *   showSources
 *   showExternalLink
 *   maxArtists={2}
 *   onPlay={(track) => playTrack(track)}
 *   interactive
 *   previewSide="right"
 * />
 * ```
 */
export function TrackCard({
  track,
  variant = 'card',
  artworkUrl,
  showArtwork,
  showPosition = true,
  showDiscNumber = false,
  showIsrc = false,
  inlineIsrc = false,
  showSources = false,
  fullProviderNames = false,
  maxSources = 2,
  showDurationIcon = false,
  showExternalLink = false,
  subtleExternalLink = false,
  maxArtists,
  isPlaying = false,
  onPlay,
  interactive = false,
  previewSide = 'right',
  previewAlign = 'start',
  className,
  ...props
}: TrackCardProps) {
  const handleClick = React.useCallback(() => {
    onPlay?.(track);
  }, [onPlay, track]);

  const primarySource = track.sources[0];

  // Default showArtwork based on variant if not explicitly set
  const shouldShowArtwork = showArtwork ?? variant === 'card';

  const content = (
    <>
      {showPosition && (
        <span className="w-8 text-center text-sm text-muted-foreground tabular-nums font-mono">
          {formatTrackPosition(
            track.position,
            showDiscNumber ? track.discNumber : undefined
          )}
        </span>
      )}

      {shouldShowArtwork && (
        <TrackArtwork src={artworkUrl} alt={track.title} size="sm" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium truncate group-hover:text-primary transition-colors',
              isPlaying && 'text-primary'
            )}
          >
            {track.title}
          </span>
          {track.explicit && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 h-4 shrink-0"
            >
              E
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArtistCredit
            artists={track.artists}
            {...(maxArtists !== undefined && { maxDisplay: maxArtists })}
            className="line-clamp-1"
          />
          {inlineIsrc && showIsrc && track.isrc && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-mono text-xs">{track.isrc}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {showSources && track.sources.length > 0 && (
          <div className="flex items-center gap-1">
            {track.sources.slice(0, maxSources).map((source) => (
              <Badge
                key={source.provider}
                variant={fullProviderNames ? 'secondary' : 'outline'}
                className={cn(
                  'capitalize',
                  fullProviderNames ? 'text-xs' : 'text-[10px] px-1 py-0 h-4'
                )}
              >
                {fullProviderNames
                  ? source.provider
                  : source.provider.charAt(0).toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
        <span className="text-sm text-muted-foreground tabular-nums flex items-center gap-1">
          {showDurationIcon && <Clock className="size-3" />}
          <span className={showDurationIcon ? 'font-mono' : ''}>
            {formatDuration(track.duration)}
          </span>
        </span>
      </div>

      {/* Subtle external link icon (appears on hover) */}
      {subtleExternalLink && primarySource?.url && (
        <a
          href={primarySource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-4 text-muted-foreground" />
        </a>
      )}
    </>
  );

  // ISRC shown below content (non-inline mode)
  const isrcBelow = !inlineIsrc && showIsrc && track.isrc && (
    <div className="px-3 pb-2 text-[10px] font-mono text-muted-foreground/70">
      {track.isrc}
    </div>
  );

  // Full overlay external link
  const externalLinkOverlay = showExternalLink &&
    !subtleExternalLink &&
    primarySource?.url && (
      <a
        href={primarySource.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <ExternalLink className="size-4" />
          View on {primarySource.provider}
        </div>
      </a>
    );

  const sharedProps = {
    onClick: handleClick,
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    'aria-label': `Track: ${track.title}`,
  };

  const element =
    variant === 'card' ? (
      <Card
        className={cn(
          'group relative transition-colors hover:bg-accent/50 cursor-pointer',
          isPlaying && 'bg-accent',
          className
        )}
        {...sharedProps}
        {...props}
      >
        <CardContent className="flex items-center gap-4 p-3">
          {content}
        </CardContent>
        {isrcBelow}
        {externalLinkOverlay}
      </Card>
    ) : (
      <div
        className={cn(
          'flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer relative',
          isPlaying && 'bg-muted',
          className
        )}
        {...sharedProps}
        {...props}
      >
        {content}
        {isrcBelow && (
          <div className="absolute bottom-0 left-3 text-[10px] font-mono text-muted-foreground/70">
            {track.isrc}
          </div>
        )}
        {externalLinkOverlay}
      </div>
    );

  if (interactive) {
    return (
      <InteractiveWrapper
        entityType="track"
        entity={track}
        previewSide={previewSide}
        previewAlign={previewAlign}
      >
        {element}
      </InteractiveWrapper>
    );
  }

  return element;
}

export interface TrackCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant @default 'card' */
  variant?: 'card' | 'list' | undefined;
  /** Whether to show position skeleton */
  showPosition?: boolean | undefined;
  /** Whether to show artwork skeleton */
  showArtwork?: boolean | undefined;
  /** Whether to show source badges skeleton */
  showSources?: boolean | undefined;
  /** Whether to show ISRC skeleton */
  showIsrc?: boolean | undefined;
}

export function TrackCardSkeleton({
  variant = 'card',
  showPosition = true,
  showArtwork,
  showSources = false,
  showIsrc = false,
  className,
  ...props
}: TrackCardSkeletonProps) {
  const shouldShowArtwork = showArtwork ?? variant === 'card';

  const content = (
    <div className="flex items-center gap-4">
      {showPosition && <Skeleton className="h-4 w-8" />}
      {shouldShowArtwork && (
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
      )}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-3">
        {showSources && (
          <div className="flex gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
        )}
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={cn('p-3', className)} {...props}>
        {content}
        {showIsrc && <Skeleton className="h-3 w-24 mt-2" />}
      </Card>
    );
  }

  return (
    <div className={cn('p-3 rounded-lg', className)} {...props}>
      {content}
      {showIsrc && <Skeleton className="h-3 w-24 mt-2" />}
    </div>
  );
}
