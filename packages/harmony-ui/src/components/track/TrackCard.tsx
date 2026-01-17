'use client';

import * as React from 'react';
import { cn, Card, CardContent, Badge, Skeleton } from '@scilent-one/ui';
import type { HarmonizedTrack } from '@scilent-one/harmony-engine';
import { Clock, ExternalLink, GripVertical, X } from 'lucide-react';
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
  /** Visual variant - 'card' wraps in Card component, 'list' renders as row, 'compact' minimal row @default 'card' */
  variant?: 'card' | 'list' | 'compact' | undefined;
  /** Optional artwork URL */
  artworkUrl?: string | undefined;
  /** Whether to show artwork @default true for card, false for list/compact */
  showArtwork?: boolean | undefined;
  /** Whether to show the track position/index */
  showPosition?: boolean | undefined;
  /** Whether to show the disc number */
  showDiscNumber?: boolean | undefined;
  /** Optional display index (1-based) */
  index?: number | undefined;
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
  /** Callback when the remove button is clicked */
  onRemove?: ((trackId: string) => void) | undefined;
  /** Whether to show the remove button @default false */
  showRemove?: boolean | undefined;
  /** Whether to show a drag handle (for sortable lists) @default false */
  showDragHandle?: boolean | undefined;
  /** Whether to enable interactive features (context menu, hover preview) */
  interactive?: boolean | undefined;
  /** Side to position the hover preview @default 'right' */
  previewSide?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  /** Alignment for the hover preview @default 'start' */
  previewAlign?: 'start' | 'center' | 'end' | undefined;
}

/**
 * Track card/list item component that displays track information.
 * Supports three variants: 'card' (wrapped in Card), 'list' (row), and 'compact' (minimal row).
 * Also supports interactive features like context menus and hover previews.
 *
 * @example
 * ```tsx
 * // Card variant (default)
 * <TrackCard track={track} />
 *
 * // List variant (row style with metadata)
 * <TrackCard
 *   track={track}
 *   variant="list"
 *   showArtwork
 *   showDurationIcon
 *   showSources
 * />
 *
 * // Compact variant (minimal row)
 * <TrackCard track={track} variant="compact" />
 *
 * // With all options
 * <TrackCard
 *   track={track}
 *   showPosition
 *   showIsrc
 *   showSources
 *   showRemove
 *   showDragHandle
 *   maxArtists={2}
 *   onPlay={(track) => playTrack(track)}
 *   onRemove={(id) => removeFromQueue(id)}
 *   interactive
 * />
 * ```
 */
export function TrackCard({
  track,
  variant = 'card',
  artworkUrl,
  showArtwork,
  showPosition = false,
  showDiscNumber = false,
  index,
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
  onRemove,
  showRemove = false,
  showDragHandle = false,
  interactive = false,
  previewSide = 'right',
  previewAlign = 'start',
  className,
  ...props
}: TrackCardProps) {
  const handleClick = React.useCallback(() => {
    onPlay?.(track);
  }, [onPlay, track]);

  const handleRemove = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const trackId = track.isrc || Object.values(track.externalIds)[0] || '';
      onRemove?.(trackId);
    },
    [onRemove, track]
  );

  const primarySource = track.sources[0];

  // Default showArtwork based on variant if not explicitly set
  const shouldShowArtwork = showArtwork ?? variant === 'card';

  // Get the display position/index
  const displayPosition = index ?? (showPosition ? track.position : undefined);

  const content = (
    <>
      {/* Drag handle */}
      {showDragHandle && (
        <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <GripVertical className="size-4" />
        </div>
      )}

      {/* Position/Index number */}
      {displayPosition !== undefined && (
        <span className="w-6 text-center text-sm text-muted-foreground tabular-nums font-mono shrink-0">
          {showDiscNumber && track.discNumber
            ? formatTrackPosition(track.position, track.discNumber)
            : displayPosition}
        </span>
      )}

      {/* Track artwork */}
      {shouldShowArtwork && (
        <TrackArtwork
          src={artworkUrl}
          alt={track.title}
          size={variant === 'compact' ? 'xs' : 'sm'}
          rounded="md"
        />
      )}

      {/* Track info - title, artists, metadata */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium truncate transition-colors',
              isPlaying ? 'text-primary' : 'group-hover:text-primary'
            )}
          >
            {track.title}
          </span>
          {track.explicit && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold"
            >
              E
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArtistCredit
            artists={track.artists}
            {...(maxArtists !== undefined && { maxDisplay: maxArtists })}
            className="truncate"
          />
          {inlineIsrc && showIsrc && track.isrc && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-mono text-xs text-muted-foreground/70 shrink-0">
                {track.isrc}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side - metadata, sources, duration, actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Source badges */}
        {showSources && track.sources.length > 0 && (
          <div className="flex items-center gap-1">
            {track.sources.slice(0, maxSources).map((source) => (
              <Badge
                key={source.provider}
                variant={fullProviderNames ? 'secondary' : 'outline'}
                className={cn(
                  'capitalize',
                  fullProviderNames
                    ? 'text-xs'
                    : 'text-[10px] px-1.5 py-0 h-4 font-medium'
                )}
              >
                {fullProviderNames
                  ? source.provider
                  : source.provider.charAt(0).toUpperCase()}
              </Badge>
            ))}
          </div>
        )}

        {/* Duration */}
        {track?.duration && track.duration > 0 && (
          <span className="text-sm text-muted-foreground tabular-nums flex items-center gap-1.5 min-w-[3rem] justify-end">
            {showDurationIcon && <Clock className="size-3.5" />}
            <span className={cn(showDurationIcon && 'font-mono text-xs')}>
              {formatDuration(track.duration)}
            </span>
          </span>
        )}

        {/* External link (subtle) */}
        {subtleExternalLink && primarySource?.url && (
          <a
            href={primarySource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-accent rounded-md shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
        )}

        {/* Remove button */}
        {showRemove && !isPlaying && (
          <button
            type="button"
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md shrink-0"
            aria-label="Remove track"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </>
  );

  // ISRC shown below content (non-inline mode)
  const isrcBelow = !inlineIsrc && showIsrc && track.isrc && (
    <div className="mt-1 text-[10px] font-mono text-muted-foreground/60 pl-0.5">
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
        className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
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

  let element: React.ReactNode;

  if (variant === 'card') {
    element = (
      <Card
        className={cn(
          'group relative transition-colors hover:bg-accent/50 cursor-pointer overflow-hidden',
          isPlaying && 'bg-accent ring-1 ring-primary/20',
          className
        )}
        {...sharedProps}
        {...props}
      >
        <CardContent className="flex items-center gap-3 p-3">
          {content}
        </CardContent>
        {isrcBelow && <div className="px-3 pb-2">{isrcBelow}</div>}
        {externalLinkOverlay}
      </Card>
    );
  } else if (variant === 'compact') {
    element = (
      <div
        className={cn(
          'flex items-center gap-2.5 py-2 px-2 rounded-md hover:bg-accent/50 transition-colors group cursor-pointer relative',
          isPlaying && 'bg-accent',
          className
        )}
        {...sharedProps}
        {...props}
      >
        {content}
        {externalLinkOverlay}
      </div>
    );
  } else {
    // list variant
    element = (
      <div
        className={cn(
          'flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer relative',
          isPlaying && 'bg-accent',
          className
        )}
        {...sharedProps}
        {...props}
      >
        {content}
        {isrcBelow && (
          <div className="absolute bottom-1 left-3">{isrcBelow}</div>
        )}
        {externalLinkOverlay}
      </div>
    );
  }

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
  variant?: 'card' | 'list' | 'compact' | undefined;
  /** Whether to show position/index skeleton */
  showPosition?: boolean | undefined;
  /** Whether to show artwork skeleton */
  showArtwork?: boolean | undefined;
  /** Whether to show source badges skeleton */
  showSources?: boolean | undefined;
  /** Whether to show ISRC skeleton */
  showIsrc?: boolean | undefined;
  /** Whether to show drag handle skeleton */
  showDragHandle?: boolean | undefined;
}

export function TrackCardSkeleton({
  variant = 'card',
  showPosition = false,
  showArtwork,
  showSources = false,
  showIsrc = false,
  showDragHandle = false,
  className,
  ...props
}: TrackCardSkeletonProps) {
  const shouldShowArtwork = showArtwork ?? variant === 'card';
  const isCompact = variant === 'compact';

  const content = (
    <div className="flex items-center gap-3 w-full">
      {showDragHandle && <Skeleton className="size-4 shrink-0" />}
      {showPosition && <Skeleton className="h-4 w-6 shrink-0" />}
      {shouldShowArtwork && (
        <Skeleton
          className={cn(
            'rounded-md shrink-0',
            isCompact ? 'size-8' : 'size-10'
          )}
        />
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {showSources && (
          <div className="flex gap-1">
            <Skeleton className="h-4 w-5 rounded-full" />
            <Skeleton className="h-4 w-5 rounded-full" />
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

  if (variant === 'compact') {
    return (
      <div className={cn('py-2 px-2 rounded-md', className)} {...props}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn('py-2.5 px-3 rounded-lg', className)} {...props}>
      {content}
      {showIsrc && <Skeleton className="h-3 w-24 mt-1" />}
    </div>
  );
}
