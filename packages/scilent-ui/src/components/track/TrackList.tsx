'use client';

import * as React from 'react';
import { cn, ScrollArea } from '@scilent-one/ui';
import { Music } from 'lucide-react';
import type { HarmonizedTrack } from '../../types';
import { TrackCard, TrackCardSkeleton } from './TrackCard';

export interface TrackListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of tracks to display */
  tracks: HarmonizedTrack[];
  /** Optional map of track ISRCs/IDs to artwork URLs */
  artworkMap?: Record<string, string> | undefined;
  /** Whether to show track positions/indices @default false */
  showPositions?: boolean | undefined;
  /** Whether to show artwork on each track @default true */
  showArtwork?: boolean | undefined;
  /** Whether to group by disc number */
  groupByDisc?: boolean | undefined;
  /** Currently playing track ISRC or external ID */
  playingTrackId?: string | undefined;
  /** Callback when a track is selected/clicked */
  onTrackSelect?: ((index: number, track?: HarmonizedTrack) => void) | undefined;
  /** Callback when a track is removed */
  onTrackRemove?: ((trackId: string) => void) | undefined;
  /** Layout variant @default 'default' */
  variant?: 'default' | 'grid' | undefined;
  /** Simple text filter (matches title or artist) */
  filterQuery?: string | undefined;
  /** Custom filter function (overrides filterQuery) */
  filterFn?: ((track: HarmonizedTrack) => boolean) | undefined;
  /** Label shown when the list is empty @default 'No tracks found' */
  emptyLabel?: string | undefined;
  /** Description shown in the empty state @default 'Try adding some tracks' */
  emptyDescription?: string | undefined;
  /** Whether the list should be scrollable @default false */
  scrollable?: boolean | undefined;
  /** Maximum height when scrollable */
  maxHeight?: string | number | undefined;
}

/**
 * TrackList renders a list or grid of tracks with optional filtering and empty state.
 *
 * @example
 * ```tsx
 * // Default list mode
 * <TrackList
 *   tracks={tracks}
 *   onTrackSelect={(index) => console.log('Selected:', index)}
 * />
 *
 * // Grid mode
 * <TrackList tracks={tracks} variant="grid" />
 *
 * // With filtering
 * <TrackList tracks={tracks} filterQuery="jazz" />
 *
 * // With removal
 * <TrackList
 *   tracks={tracks}
 *   onTrackRemove={(id) => removeFromQueue(id)}
 * />
 * ```
 */
export function TrackList({
  tracks,
  artworkMap = {},
  showPositions = false,
  showArtwork = true,
  groupByDisc = false,
  playingTrackId,
  onTrackSelect,
  onTrackRemove,
  variant = 'default',
  filterQuery,
  filterFn,
  emptyLabel = 'No tracks found',
  emptyDescription = 'Try adding some tracks',
  scrollable = false,
  maxHeight,
  className,
  ...props
}: TrackListProps) {
  // Apply filtering
  const filteredTracks = React.useMemo(() => {
    if (filterFn) {
      return tracks.filter(filterFn);
    }
    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      return tracks.filter(
        (track) =>
          track.title.toLowerCase().includes(query) ||
          track.artists.some((a) => a.name.toLowerCase().includes(query))
      );
    }
    return tracks;
  }, [tracks, filterQuery, filterFn]);

  // Group tracks by disc if needed
  const groupedTracks = React.useMemo(() => {
    if (!groupByDisc) return { 1: filteredTracks };

    return filteredTracks.reduce(
      (acc, track) => {
        const disc = track.discNumber ?? 1;
        if (!acc[disc]) acc[disc] = [];
        (acc[disc] as HarmonizedTrack[]).push(track);
        return acc;
      },
      {} as Record<number, HarmonizedTrack[]>
    );
  }, [filteredTracks, groupByDisc]);

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

  // Empty state
  if (filteredTracks.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          className
        )}
        {...props}
      >
        <div className="rounded-full bg-muted p-3 mb-3">
          <Music className="size-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-sm">{emptyLabel}</p>
        <p className="text-sm text-muted-foreground mt-1">{emptyDescription}</p>
      </div>
    );
  }

  const isGrid = variant === 'grid';

  const renderContent = () => (
    <div
      className={cn(
        isGrid
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
          : 'space-y-0.5',
        className
      )}
      {...props}
    >
      {discNumbers.map((discNum) => {
        const discTracks = groupedTracks[discNum] ?? [];

        if (isGrid) {
          // Grid variant - cards wrapped in a fragment for each disc
          return (
            <React.Fragment key={discNum}>
              {hasMultipleDiscs && (
                <div className="col-span-full">
                  <h3 className="text-sm font-medium text-muted-foreground pt-4 first:pt-0">
                    Disc {discNum}
                  </h3>
                </div>
              )}
              {discTracks.map((track: HarmonizedTrack, idx: number) => {
                const trackId = getTrackId(track);
                const globalIndex = filteredTracks.indexOf(track);
                return (
                  <TrackCard
                    key={trackId}
                    track={track}
                    variant="card"
                    artworkUrl={getArtworkUrl(track)}
                    showArtwork={showArtwork}
                    showPosition={showPositions}
                    index={showPositions ? idx + 1 : undefined}
                    showDiscNumber={!groupByDisc && hasMultipleDiscs}
                    isPlaying={playingTrackId === trackId}
                    onPlay={
                      onTrackSelect
                        ? () => onTrackSelect(globalIndex, track)
                        : undefined
                    }
                    onRemove={onTrackRemove}
                    showRemove={!!onTrackRemove}
                    previewSide="bottom"
                    previewAlign="center"
                  />
                );
              })}
            </React.Fragment>
          );
        }

        // Default list variant
        return (
          <div key={discNum} className="space-y-0.5">
            {hasMultipleDiscs && (
              <h3 className="text-sm font-medium text-muted-foreground px-1 pt-4 first:pt-0 pb-2">
                Disc {discNum}
              </h3>
            )}
            {discTracks.map((track: HarmonizedTrack, idx: number) => {
              const trackId = getTrackId(track);
              const globalIndex = filteredTracks.indexOf(track);
              return (
                <TrackCard
                  key={trackId}
                  track={track}
                  variant="list"
                  artworkUrl={getArtworkUrl(track)}
                  showArtwork={showArtwork}
                  showPosition={showPositions}
                  index={showPositions ? idx + 1 : undefined}
                  showDiscNumber={!groupByDisc && hasMultipleDiscs}
                  isPlaying={playingTrackId === trackId}
                  onPlay={
                    onTrackSelect
                      ? () => onTrackSelect(globalIndex, track)
                      : undefined
                  }
                  onRemove={onTrackRemove}
                  showRemove={!!onTrackRemove}
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

  if (scrollable) {
    return (
      <ScrollArea
        className={cn('w-full', className)}
        style={{ maxHeight: maxHeight ?? '400px' }}
      >
        {renderContent()}
      </ScrollArea>
    );
  }

  return renderContent();
}

export interface TrackListSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton tracks to show @default 5 */
  count?: number | undefined;
  /** Whether to show position numbers @default false */
  showPositions?: boolean | undefined;
  /** Whether to show artwork @default true */
  showArtwork?: boolean | undefined;
  /** Layout variant @default 'default' */
  variant?: 'default' | 'grid' | undefined;
}

export function TrackListSkeleton({
  count = 5,
  showPositions = false,
  showArtwork = true,
  variant = 'default',
  className,
  ...props
}: TrackListSkeletonProps) {
  const isGrid = variant === 'grid';

  return (
    <div
      className={cn(
        isGrid
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
          : 'space-y-0.5',
        className
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <TrackCardSkeleton
          key={i}
          variant={isGrid ? 'card' : 'list'}
          showPosition={showPositions}
          showArtwork={showArtwork}
        />
      ))}
    </div>
  );
}
