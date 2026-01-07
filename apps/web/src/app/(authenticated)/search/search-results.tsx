'use client';

import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
} from '@scilent-one/harmony-engine';
import {
  AlbumCard,
  TrackCard,
  ArtistCard,
  GridSkeleton,
  ListSkeleton,
  PlatformBadgeList,
  formatDuration,
  formatArtistCredits,
  getFrontArtworkUrl,
  type HarmonizedArtistCredit,
} from '@scilent-one/harmony-ui';
import { Badge, cn } from '@scilent-one/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  AlertCircle,
  Music2,
  Search,
  Calendar,
  Disc,
  Music,
  Clock,
  User,
} from 'lucide-react';
import { useRef, useMemo, useState, useEffect } from 'react';

import type { SearchType } from './actions';

interface SearchResultsProps {
  releaseResults: HarmonizedRelease[];
  trackResults: HarmonizedTrack[];
  artistResults: HarmonizedArtist[];
  searchType: SearchType;
  view: 'list' | 'grid';
  isLoading?: boolean;
  error?: string | null;
  hasSearched: boolean;
}

// Estimated sizes for virtualization
const LIST_ITEM_HEIGHT = 88; // ~80px + padding
const GRID_ITEM_HEIGHT = 280; // Card height
const GRID_COLUMNS = {
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

// Inline list item components for search results
// These provide a compact horizontal layout for list view

interface ReleaseListItemProps {
  release: HarmonizedRelease;
  showProviders?: boolean;
  className?: string;
}

function ReleaseListItem({
  release,
  showProviders = false,
  className,
}: ReleaseListItemProps) {
  const artworkUrl = getFrontArtworkUrl(release.artwork);
  const year = release.releaseDate?.year;
  const trackCount = release.media.reduce((acc, m) => acc + m.tracks.length, 0);
  const totalDuration = release.media.reduce(
    (acc, m) =>
      acc + m.tracks.reduce((t, track) => t + (track.duration || 0), 0),
    0
  );
  const providers = release.sources.map((s) => s.provider);

  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-accent/50 cursor-pointer',
        className
      )}
    >
      <div className='size-16 rounded-md overflow-hidden bg-muted shrink-0'>
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt={release.title}
            className='size-full object-cover'
          />
        ) : (
          <div className='size-full flex items-center justify-center'>
            <Disc className='size-6 text-muted-foreground' />
          </div>
        )}
      </div>
      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex items-start gap-2'>
          <h3 className='font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors'>
            {release.title}
          </h3>
          <Badge
            variant='outline'
            className='text-[10px] uppercase tracking-wider shrink-0'
          >
            {release.releaseType}
          </Badge>
        </div>
        <p className='text-sm text-muted-foreground truncate'>
          {formatArtistCredits(release.artists as HarmonizedArtistCredit[])}
        </p>
        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          {year && (
            <span className='inline-flex items-center gap-1'>
              <Calendar className='size-3' />
              {year}
            </span>
          )}
          {trackCount > 0 && (
            <span className='inline-flex items-center gap-1'>
              <Music className='size-3' />
              {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
            </span>
          )}
          {totalDuration > 0 && (
            <span className='inline-flex items-center gap-1'>
              <Disc className='size-3' />
              {formatDuration(totalDuration)}
            </span>
          )}
        </div>
      </div>
      {showProviders && providers.length > 0 && (
        <PlatformBadgeList platforms={providers} abbreviated />
      )}
    </div>
  );
}

interface TrackListItemProps {
  track: HarmonizedTrack;
  showProviders?: boolean;
  className?: string;
}

function TrackListItem({
  track,
  showProviders = false,
  className,
}: TrackListItemProps) {
  const providers = track.sources.map((s) => s.provider);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group',
        className
      )}
    >
      <div className='w-8 text-center text-muted-foreground text-sm font-mono'>
        {track.position || '-'}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <h4 className='font-medium truncate'>{track.title}</h4>
          {track.explicit && (
            <Badge variant='outline' className='text-[10px] px-1 py-0 h-4'>
              E
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span className='truncate'>
            {formatArtistCredits(track.artists as HarmonizedArtistCredit[])}
          </span>
          {track.isrc && (
            <>
              <span className='text-muted-foreground/50'>·</span>
              <span className='font-mono text-xs'>{track.isrc}</span>
            </>
          )}
        </div>
      </div>
      <div className='flex items-center gap-1 text-sm text-muted-foreground'>
        <Clock className='size-3' />
        <span className='font-mono'>{formatDuration(track.duration)}</span>
      </div>
      {showProviders && providers.length > 0 && (
        <PlatformBadgeList platforms={providers} abbreviated />
      )}
    </div>
  );
}

interface ArtistListItemProps {
  artist: HarmonizedArtist;
  showProviders?: boolean;
  className?: string;
}

function ArtistListItem({
  artist,
  showProviders = false,
  className,
}: ArtistListItemProps) {
  const providers = artist.sources.map((s) => s.provider);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group',
        className
      )}
    >
      <div className='size-14 rounded-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center shrink-0'>
        <User className='size-6 text-muted-foreground/50' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <h4 className='font-medium truncate'>{artist.name}</h4>
          {artist.type && (
            <Badge
              variant='outline'
              className='text-[10px] px-1.5 py-0 h-4 capitalize'
            >
              {artist.type}
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          {artist.country && <span>{artist.country}</span>}
          {artist.disambiguation && (
            <>
              {artist.country && (
                <span className='text-muted-foreground/50'>·</span>
              )}
              <span className='truncate'>{artist.disambiguation}</span>
            </>
          )}
        </div>
        {artist.genres && artist.genres.length > 0 && (
          <div className='flex items-center gap-1 mt-1'>
            {artist.genres.slice(0, 3).map((genre) => (
              <Badge
                key={genre}
                variant='secondary'
                className='text-[10px] px-1.5 py-0 h-4'
              >
                {genre}
              </Badge>
            ))}
            {artist.genres.length > 3 && (
              <span className='text-xs text-muted-foreground'>
                +{artist.genres.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      {showProviders && providers.length > 0 && (
        <PlatformBadgeList platforms={providers} abbreviated />
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <div className='flex-1 flex flex-col items-center justify-center py-16 text-center'>
      <div className='rounded-full bg-muted p-4 mb-4'>
        <Icon className='size-8 text-muted-foreground' />
      </div>
      <h3 className='font-medium text-lg mb-1'>{title}</h3>
      <p className='text-sm text-muted-foreground max-w-sm'>{description}</p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className='p-1'>
      <GridSkeleton count={10} columns={5} aspectRatio='square' showContent />
    </div>
  );
}

function LoadingList() {
  return (
    <div className='p-1'>
      <ListSkeleton count={8} showAvatar avatarShape='square' lines={3} />
    </div>
  );
}

export function SearchResults({
  releaseResults,
  trackResults,
  artistResults,
  searchType,
  view,
  isLoading,
  error,
  hasSearched,
}: SearchResultsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(GRID_COLUMNS.lg);

  // Responsive column count based on window width
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumnCount(GRID_COLUMNS.xl);
      } else if (width >= 1024) {
        setColumnCount(GRID_COLUMNS.lg);
      } else if (width >= 768) {
        setColumnCount(GRID_COLUMNS.md);
      } else {
        setColumnCount(GRID_COLUMNS.sm);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Get the appropriate results count based on search type
  const resultCount = useMemo(() => {
    switch (searchType) {
      case 'track':
        return trackResults.length;
      case 'artist':
        return artistResults.length;
      default:
        return releaseResults.length;
    }
  }, [searchType, releaseResults, trackResults, artistResults]);

  // For grid view, we virtualize by rows
  const releaseGridRows = useMemo(() => {
    if (view !== 'grid' || searchType !== 'release') return [];
    const rows: HarmonizedRelease[][] = [];
    for (let i = 0; i < releaseResults.length; i += columnCount) {
      rows.push(releaseResults.slice(i, i + columnCount));
    }
    return rows;
  }, [releaseResults, view, searchType, columnCount]);

  const trackGridRows = useMemo(() => {
    if (view !== 'grid' || searchType !== 'track') return [];
    const rows: HarmonizedTrack[][] = [];
    for (let i = 0; i < trackResults.length; i += columnCount) {
      rows.push(trackResults.slice(i, i + columnCount));
    }
    return rows;
  }, [trackResults, view, searchType, columnCount]);

  const artistGridRows = useMemo(() => {
    if (view !== 'grid' || searchType !== 'artist') return [];
    const rows: HarmonizedArtist[][] = [];
    for (let i = 0; i < artistResults.length; i += columnCount) {
      rows.push(artistResults.slice(i, i + columnCount));
    }
    return rows;
  }, [artistResults, view, searchType, columnCount]);

  const gridRows = useMemo(() => {
    switch (searchType) {
      case 'track':
        return trackGridRows;
      case 'artist':
        return artistGridRows;
      default:
        return releaseGridRows;
    }
  }, [searchType, releaseGridRows, trackGridRows, artistGridRows]);

  const listVirtualizer = useVirtualizer({
    count: view === 'list' ? resultCount : gridRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (view === 'list' ? LIST_ITEM_HEIGHT : GRID_ITEM_HEIGHT),
    overscan: 5,
  });

  // Error state
  if (error) {
    return (
      <EmptyState icon={AlertCircle} title='Search Error' description={error} />
    );
  }

  // Initial state - no search yet
  if (!hasSearched) {
    return (
      <EmptyState
        icon={Search}
        title='Start your search'
        description='Enter a query above to search for releases, artists, and albums across all connected providers'
      />
    );
  }

  // Loading state
  if (isLoading && resultCount === 0) {
    return view === 'grid' ? <LoadingGrid /> : <LoadingList />;
  }

  // No results
  if (resultCount === 0) {
    const typeLabel =
      searchType === 'track'
        ? 'tracks'
        : searchType === 'artist'
          ? 'artists'
          : 'releases';
    return (
      <EmptyState
        icon={Music2}
        title='No results found'
        description={`Try adjusting your search query or removing some filters. Searching for ${typeLabel}.`}
      />
    );
  }

  return (
    <div ref={scrollRef} className='flex-1 overflow-auto -mx-1 px-1'>
      <div
        style={{
          height: `${listVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {listVirtualizer.getVirtualItems().map((virtualItem) => {
          if (view === 'list') {
            // List view rendering
            if (searchType === 'artist') {
              const artist = artistResults[virtualItem.index];
              if (!artist) return null;
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={listVirtualizer.measureElement}
                  className={cn(
                    'absolute top-0 left-0 w-full',
                    virtualItem.index % 2 === 0
                      ? 'bg-transparent'
                      : 'bg-muted/30'
                  )}
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ArtistListItem artist={artist} showProviders />
                </div>
              );
            }

            if (searchType === 'track') {
              const track = trackResults[virtualItem.index];
              if (!track) return null;
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={listVirtualizer.measureElement}
                  className={cn(
                    'absolute top-0 left-0 w-full',
                    virtualItem.index % 2 === 0
                      ? 'bg-transparent'
                      : 'bg-muted/30'
                  )}
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <TrackListItem track={track} showProviders />
                </div>
              );
            }

            const release = releaseResults[virtualItem.index];
            if (!release) return null;
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={listVirtualizer.measureElement}
                className={cn(
                  'absolute top-0 left-0 w-full',
                  virtualItem.index % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                )}
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ReleaseListItem release={release} showProviders />
              </div>
            );
          }

          // Grid view - render a row of items
          if (searchType === 'artist') {
            const row = artistGridRows[virtualItem.index];
            if (!row) return null;
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={listVirtualizer.measureElement}
                className='absolute top-0 left-0 w-full'
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-2'>
                  {row.map((artist) => (
                    <ArtistCard
                      key={artist.externalIds?.musicbrainz || artist.name}
                      artist={artist}
                    />
                  ))}
                </div>
              </div>
            );
          }

          if (searchType === 'track') {
            const row = trackGridRows[virtualItem.index];
            if (!row) return null;
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={listVirtualizer.measureElement}
                className='absolute top-0 left-0 w-full'
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-2'>
                  {row.map((track) => (
                    <TrackCard key={track.isrc || track.title} track={track} />
                  ))}
                </div>
              </div>
            );
          }

          const row = releaseGridRows[virtualItem.index];
          if (!row) return null;
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={listVirtualizer.measureElement}
              className='absolute top-0 left-0 w-full'
              style={{
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-2'>
                {row.map((release) => (
                  <AlbumCard
                    key={release.gtin || release.title}
                    release={release}
                    showYear
                    showType
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
