import * as React from 'react';
import { cn, Card, CardContent, Badge, Skeleton } from '@scilent-one/ui';
import type { HarmonizedTrack } from '../../types';
import {
  formatDuration,
  formatArtistCredits,
  formatTrackPosition,
} from '../../utils';
import { TrackArtwork } from './TrackArtwork';
import { InteractiveWrapper } from '../../interactions/InteractiveWrapper';

export interface TrackCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onPlay'
> {
  /** The harmonized track data */
  track: HarmonizedTrack;
  /** Optional artwork URL */
  artworkUrl?: string | undefined;
  /** Whether to show the track position */
  showPosition?: boolean | undefined;
  /** Whether to show the disc number */
  showDiscNumber?: boolean | undefined;
  /** Whether the track is currently playing */
  isPlaying?: boolean | undefined;
  /** Callback when the track is clicked */
  onPlay?: ((track: HarmonizedTrack) => void) | undefined;
  /** Whether to enable interactive features (context menu, hover preview) */
  interactive?: boolean | undefined;
}

export function TrackCard({
  track,
  artworkUrl,
  showPosition = true,
  showDiscNumber = false,
  isPlaying = false,
  onPlay,
  interactive = false,
  className,
  ...props
}: TrackCardProps) {
  const handleClick = React.useCallback(() => {
    onPlay?.(track);
  }, [onPlay, track]);

  const card = (
    <Card
      className={cn(
        'transition-colors hover:bg-accent/50 cursor-pointer',
        isPlaying && 'bg-accent',
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
      aria-label={`Track: ${track.title}`}
      {...props}
    >
      <CardContent className="flex items-center gap-4 p-3">
        {showPosition && (
          <span className="w-8 text-center text-sm text-muted-foreground tabular-nums">
            {formatTrackPosition(
              track.position,
              showDiscNumber ? track.discNumber : undefined
            )}
          </span>
        )}

        <TrackArtwork src={artworkUrl} alt={track.title} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium truncate',
                isPlaying && 'text-primary'
              )}
            >
              {track.title}
            </span>
            {track.explicit && (
              <Badge variant="outline" className="text-xs shrink-0">
                E
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {formatArtistCredits(track.artists)}
          </p>
        </div>

        <span className="text-sm text-muted-foreground tabular-nums shrink-0">
          {formatDuration(track.duration)}
        </span>
      </CardContent>
    </Card>
  );

  if (interactive) {
    return (
      <InteractiveWrapper entityType="track" entity={track}>
        {card}
      </InteractiveWrapper>
    );
  }

  return card;
}

export interface TrackCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showPosition?: boolean;
}

export function TrackCardSkeleton({
  showPosition = true,
  className,
  ...props
}: TrackCardSkeletonProps) {
  return (
    <Card className={cn('p-3', className)} {...props}>
      <div className="flex items-center gap-4">
        {showPosition && <Skeleton className="h-4 w-8" />}
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-10" />
      </div>
    </Card>
  );
}
