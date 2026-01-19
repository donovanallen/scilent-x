'use client';

import * as React from 'react';
import { Badge, cn, Separator } from '@scilent-one/ui';
import { Clock, Hash, Music, Users } from 'lucide-react';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedTrack } from '../../types';
import { formatDuration, formatTrackPosition } from '../../utils';
import { PlatformBadgeList } from '../../components/common';
import { ArtistCredit } from '../../components/artist/ArtistCredit';

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
 * Styled to match TrackCard component patterns.
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
          <div className="size-10 rounded-md bg-muted flex items-center justify-center shrink-0 ring-1 ring-border/50">
            <Music className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{track.title}</p>
            <ArtistCredit
              artists={track.artists}
              maxDisplay={2}
              className="text-xs text-muted-foreground truncate"
            />
          </div>
        </div>
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} colored className="pt-1" />
        )}
      </div>
    );
  }

  // Mini mode - compact preview with key details (matches TrackCard layout)
  if (mode === 'mini') {
    return (
      <div className={cn('group space-y-3', className)}>
        {/* Header with icon - mirrors TrackCard artwork area */}
        <div className="flex gap-3">
          <div className="size-12 rounded-md bg-muted flex items-center justify-center shrink-0 ring-1 ring-border/50">
            <Music className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
            <div className="flex items-center gap-2">
              <p className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {track.title}
              </p>
              {track.explicit && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold"
                >
                  E
                </Badge>
              )}
            </div>
            <ArtistCredit
              artists={track.artists}
              maxDisplay={2}
              className="text-sm text-muted-foreground truncate"
            />
          </div>
        </div>

        {/* Quick stats row - matches TrackCard metadata styling */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {track.duration && track.duration > 0 && (
            <span className="tabular-nums flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {formatDuration(track.duration)}
            </span>
          )}
          {track.position && (
            <>
              {track.duration && track.duration > 0 && (
                <span className="text-muted-foreground/40">·</span>
              )}
              <span className="flex items-center gap-1.5">
                <Hash className="size-3.5" />
                Track {formatTrackPosition(track.position, track.discNumber)}
              </span>
            </>
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
    <div className={cn('group space-y-4', className)}>
      {/* Header with large icon - mirrors TrackCard structure */}
      <div className="flex items-start gap-3">
        <div className="size-14 rounded-md bg-muted flex items-center justify-center shrink-0 ring-1 ring-border/50">
          <Music className="size-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {track.title}
            </h4>
            {track.explicit && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold"
              >
                E
              </Badge>
            )}
          </div>
          <ArtistCredit
            artists={track.artists}
            maxDisplay={3}
            className="text-sm text-muted-foreground mt-0.5"
          />
        </div>
      </div>

      <Separator />

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {track.duration && track.duration > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Duration
            </span>
            <span className="flex items-center gap-1.5 font-medium tabular-nums">
              <Clock className="size-3.5 text-muted-foreground" />
              {formatDuration(track.duration)}
            </span>
          </div>
        )}
        {track.position && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Position
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Hash className="size-3.5 text-muted-foreground" />
              {formatTrackPosition(track.position, track.discNumber)}
            </span>
          </div>
        )}
      </div>

      {/* ISRC code */}
      {track.isrc && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">ISRC</span>
          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {track.isrc}
          </span>
        </div>
      )}

      {/* Credits section */}
      {track.credits && track.credits.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-muted-foreground" />
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
                <span className="truncate font-medium">{credit.name}</span>
                <Badge
                  variant="outline"
                  className="text-xs shrink-0 ml-2 font-normal"
                >
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
