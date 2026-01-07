import * as React from "react";
import { cn, Separator, Skeleton } from "@scilent-one/ui";
import type { HarmonizedRelease, HarmonizedTrack } from "../../types";
import { TrackList, TrackListSkeleton } from "../track/TrackList";

export interface AlbumTrackListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The harmonized release data */
  release: HarmonizedRelease;
  /** Optional map of track ISRCs/IDs to artwork URLs */
  trackArtworkMap?: Record<string, string> | undefined;
  /** Whether to show track positions */
  showPositions?: boolean | undefined;
  /** Currently playing track ISRC or external ID */
  playingTrackId?: string | undefined;
  /** Callback when a track is clicked */
  onTrackPlay?: ((track: HarmonizedTrack) => void) | undefined;
}

export function AlbumTrackList({
  release,
  trackArtworkMap = {},
  showPositions = true,
  playingTrackId,
  onTrackPlay,
  className,
  ...props
}: AlbumTrackListProps) {
  const hasMultipleMedia = release.media.length > 1;

  // Calculate total duration
  const totalDuration = React.useMemo(() => {
    let total = 0;
    release.media.forEach((medium) => {
      medium.tracks.forEach((track) => {
        if (track.duration) total += track.duration;
      });
    });
    return total;
  }, [release.media]);

  const totalTracks = release.media.reduce(
    (sum, medium) => sum + medium.tracks.length,
    0
  );

  const formatTotalDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} hr ${mins} min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalTracks} {totalTracks === 1 ? "track" : "tracks"}
        </span>
        {totalDuration > 0 && <span>{formatTotalDuration(totalDuration)}</span>}
      </div>

      <div className="space-y-6">
        {release.media.map((medium) => (
          <div key={medium.position} className="space-y-2">
            {hasMultipleMedia && (
              <>
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {medium.format ? `${medium.format} ` : "Disc "}
                    {medium.position}
                  </h3>
                  <Separator className="flex-1" />
                </div>
              </>
            )}
            <TrackList
              tracks={medium.tracks}
              artworkMap={trackArtworkMap}
              showPositions={showPositions}
              groupByDisc={false}
              playingTrackId={playingTrackId}
              onTrackPlay={onTrackPlay}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export interface AlbumTrackListSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  trackCount?: number;
}

export function AlbumTrackListSkeleton({
  trackCount = 10,
  className,
  ...props
}: AlbumTrackListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <TrackListSkeleton count={trackCount} />
    </div>
  );
}
