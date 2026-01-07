'use client';

import * as React from 'react';
import { Badge, cn } from '@scilent-one/ui';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedTrack } from '../../types';
import { formatDuration, formatArtistCredits } from '../../utils';
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

  // Links only mode
  if (mode === 'links') {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="font-medium truncate">{track.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {formatArtistCredits(track.artists)}
        </p>
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} abbreviated />
        )}
      </div>
    );
  }

  // Mini mode - compact preview
  if (mode === 'mini') {
    return (
      <div className={cn('space-y-3', className)}>
        <div>
          <p className="font-medium leading-tight">{track.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatArtistCredits(track.artists)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {track.duration && (
            <span>{formatDuration(track.duration)}</span>
          )}
          {track.explicit && (
            <Badge variant="outline" className="text-xs">
              Explicit
            </Badge>
          )}
          {track.isrc && (
            <span className="text-xs font-mono">{track.isrc}</span>
          )}
        </div>

        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} abbreviated />
        )}
      </div>
    );
  }

  // Full mode - detailed preview
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <p className="font-semibold text-base leading-tight">{track.title}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {formatArtistCredits(track.artists)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {track.duration && (
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-1">{formatDuration(track.duration)}</span>
          </div>
        )}
        {track.position && (
          <div>
            <span className="text-muted-foreground">Track:</span>
            <span className="ml-1">
              {track.discNumber ? `${track.discNumber}-` : ''}{track.position}
            </span>
          </div>
        )}
        {track.isrc && (
          <div className="col-span-2">
            <span className="text-muted-foreground">ISRC:</span>
            <span className="ml-1 font-mono text-xs">{track.isrc}</span>
          </div>
        )}
      </div>

      {track.explicit && (
        <Badge variant="secondary" className="text-xs">
          Explicit Content
        </Badge>
      )}

      {track.credits && track.credits.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Credits</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {track.credits.slice(0, 4).map((credit, i) => (
              <p key={i}>
                {credit.name} <span className="text-muted-foreground/60">({credit.role})</span>
              </p>
            ))}
            {track.credits.length > 4 && (
              <p className="text-muted-foreground/60">
                +{track.credits.length - 4} more
              </p>
            )}
          </div>
        </div>
      )}

      {platforms.length > 0 && (
        <PlatformBadgeList platforms={platforms} abbreviated />
      )}
    </div>
  );
}
