'use client';

import * as React from 'react';
import { Badge, cn, Separator } from '@scilent-one/ui';
import { Clock, Hash, Music, AlertTriangle, Users } from 'lucide-react';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedTrack } from '../../types';
import {
  formatDuration,
  formatArtistCredits,
  formatTrackPosition,
} from '../../utils';
import { PlatformBadgeList } from '../../components/common';

export interface TrackHoverPreviewProps {
  /** The track entity */
  entity: HarmonizedEntity;
  /** Preview mode */
  mode?: 'mini' | 'full' | 'links';
  /** Additional class name */
  className?: string;
}

/**
 * Hover preview content for track entities.
 * Shows track info with configurable detail level.
 */
export function TrackHoverPreview({
  entity,
  mode = 'mini',
  className,
}: TrackHoverPreviewProps) {
  const track = entity as HarmonizedTrack;

  // Build platform list for badge display
  const platforms = React.useMemo(() => {
    return track.sources?.map((s) => s.provider) ?? [];
  }, [track.sources]);

  // Links only mode - streamlined platform links
  if (mode === 'links') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
            <Music className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {formatArtistCredits(track.artists)}
            </p>
          </div>
        </div>
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} colored className="pt-1" />
        )}
      </div>
    );
  }

  // Mini mode - compact preview with key details
  if (mode === 'mini') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Header with icon */}
        <div className="flex gap-3">
          <div className="size-14 rounded-lg bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center shrink-0 shadow-inner">
            <Music className="size-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
            <p className="font-semibold leading-tight line-clamp-2">
              {track.title}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {formatArtistCredits(track.artists)}
            </p>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-2 flex-wrap">
          {track.duration && (
            <div className="flex items-center gap-1">
              <Clock className="size-4" />
              <span>{formatDuration(track.duration)}</span>
            </div>
          )}
          {track.position && (
            <div className="flex items-center gap-1">
              <Hash className="size-4" />
              <span>
                Track {formatTrackPosition(track.position, track.discNumber)}
              </span>
            </div>
          )}
          {track.explicit && (
            <Badge
              variant="destructive"
              className="text-xs gap-1 flex items-center"
            >
              <AlertTriangle className="size-4" />
              Explicit
            </Badge>
          )}
        </div>

        {/* Platform badges */}
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} maxVisible={4} />
        )}
      </div>
    );
  }

  // Full mode - detailed preview with all metadata
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with large icon */}
      <div className="flex items-start gap-4">
        <div className="size-16 rounded-lg bg-linear-to-br from-primary/25 via-primary/10 to-background flex items-center justify-center shrink-0 shadow-lg">
          <Music className="size-7 text-primary" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h4 className="font-semibold text-base leading-tight line-clamp-2">
            {track.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatArtistCredits(track.artists)}
          </p>
          {track.explicit && (
            <Badge
              variant="destructive"
              className="text-xs flex gap-1 items-center"
            >
              <AlertTriangle className="size-4" />
              Explicit Content
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {track.duration && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Duration
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-muted-foreground" />
              {formatDuration(track.duration)}
            </span>
          </div>
        )}
        {/* {track.position && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Position
            </span>
            <span className="flex items-center gap-1.5">
              {track.discNumber && track.discNumber > 1 ? (
                <Disc className="size-4 text-muted-foreground" />
              ) : (
                <Hash className="size-4 text-muted-foreground" />
              )}
              {formatTrackPosition(track.position, track.discNumber)}
            </span>
          </div>
        )} */}
      </div>

      {/* ISRC code */}
      {track.isrc && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">ISRC</span>
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
            {track.isrc}
          </span>
        </div>
      )}

      {/* Credits section */}
      {track.credits && track.credits.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Credits
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/30 rounded-md p-2.5">
            {track.credits.slice(0, 4).map((credit, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <span className="truncate">{credit.name}</span>
                <Badge variant="outline" className="text-xs shrink-0 ml-2">
                  {credit.role}
                </Badge>
              </div>
            ))}
            {track.credits.length > 4 && (
              <p className="text-xs text-muted-foreground pt-1">
                +{track.credits.length - 4} more credits
              </p>
            )}
          </div>
        </div>
      )}

      {/* Platform links */}
      {platforms.length > 0 && (
        <div className="pt-1">
          <PlatformBadgeList platforms={platforms} colored maxVisible={5} />
        </div>
      )}
    </div>
  );
}
