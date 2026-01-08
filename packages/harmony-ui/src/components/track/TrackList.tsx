import * as React from 'react';
import { cn } from '@scilent-one/ui';
import type { HarmonizedTrack } from '../../types';
import { TrackCard, TrackCardSkeleton } from './TrackCard';

export interface TrackListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of tracks to display */
  tracks: HarmonizedTrack[];
  /** Optional map of track ISRCs/IDs to artwork URLs */
  artworkMap?: Record<string, string> | undefined;
  /** Whether to show track positions */
  showPositions?: boolean | undefined;
  /** Whether to group by disc number */
  groupByDisc?: boolean | undefined;
  /** Currently playing track ISRC or external ID */
  playingTrackId?: string | undefined;
  /** Callback when a track is clicked */
  onTrackPlay?: ((track: HarmonizedTrack) => void) | undefined;
}

export function TrackList({
  tracks,
  artworkMap = {},
  showPositions = true,
  groupByDisc = false,
  playingTrackId,
  onTrackPlay,
  className,
  ...props
}: TrackListProps) {
  const groupedTracks = React.useMemo(() => {
    if (!groupByDisc) return { 1: tracks };

    return tracks.reduce(
      (acc, track) => {
        const disc = track.discNumber ?? 1;
        if (!acc[disc]) acc[disc] = [];
        (acc[disc] as HarmonizedTrack[]).push(track);
        return acc;
      },
      {} as Record<number, HarmonizedTrack[]>
    );
  }, [tracks, groupByDisc]);

  const discNumbers = Object.keys(groupedTracks)
    .map(Number)
    .sort((a, b) => a - b);
  const hasMultipleDiscs = discNumbers.length > 1;

  const getTrackId = (track: HarmonizedTrack) => {
    return (
      track.isrc || Object.values(track.externalIds)[0] || `${track.position}`
    );
  };

  const getArtworkUrl = (track: HarmonizedTrack) => {
    const id = getTrackId(track);
    return artworkMap[id];
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {discNumbers.map((discNum) => {
        const discTracks = groupedTracks[discNum] ?? [];
        return (
          <div key={discNum} className="space-y-1">
            {hasMultipleDiscs && (
              <h3 className="text-sm font-medium text-muted-foreground px-1 pt-4 first:pt-0">
                Disc {discNum}
              </h3>
            )}
            {discTracks.map((track: HarmonizedTrack) => {
              const trackId = getTrackId(track);
              return (
                <TrackCard
                  key={trackId}
                  track={track}
                  artworkUrl={getArtworkUrl(track)}
                  showPosition={showPositions}
                  showDiscNumber={!groupByDisc && hasMultipleDiscs}
                  isPlaying={playingTrackId === trackId}
                  onPlay={onTrackPlay}
                  previewSide="bottom"
                  previewAlign="start"
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export interface TrackListSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton tracks to show */
  count?: number;
  showPositions?: boolean;
}

export function TrackListSkeleton({
  count = 5,
  showPositions = true,
  className,
  ...props
}: TrackListSkeletonProps) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <TrackCardSkeleton key={i} showPosition={showPositions} />
      ))}
    </div>
  );
}
