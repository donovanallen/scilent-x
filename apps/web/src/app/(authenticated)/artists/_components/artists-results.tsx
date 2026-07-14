'use client';

import type { HarmonizedArtist } from '@scilent-one/harmony-engine';
import {
  ArtistCard,
  ArtistCardSkeleton,
  ArtistListItem,
  ArtistListItemSkeleton,
  ListSkeleton,
} from '@scilent-one/scilent-ui';
import { cn, Reveal, ScrollArea } from '@scilent-one/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlertCircle, MicVocal, Settings, type LucideIcon } from 'lucide-react';
import { Link } from 'next-view-transitions';
import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';

import { artistIdentityKey } from '@/lib/aggregate-followed-artists';

interface ArtistsResultsProps {
  artists: HarmonizedArtist[];
  view: 'list' | 'grid';
  isLoading?: boolean;
  /** Trailing skeletons while the next infinite-scroll page loads */
  isLoadingMore?: boolean;
  error?: string | null;
  hasLoaded?: boolean;
  hasMore?: boolean;
  isFiltering?: boolean;
  noProvidersConnected?: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
}

const LOAD_MORE_SKELETON_COUNT = 4;

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className='flex-1 flex flex-col items-center justify-center py-16 text-center'>
      <div className='rounded-full bg-muted p-4 mb-4'>
        <Icon className='size-8 text-muted-foreground' />
      </div>
      <h3 className='font-medium text-lg mb-1'>{title}</h3>
      <p className='text-sm text-muted-foreground max-w-sm mb-4'>
        {description}
      </p>
      {action}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 py-2'>
      {Array.from({ length: 8 }).map((_, i) => (
        <ArtistCardSkeleton key={i} />
      ))}
    </div>
  );
}

function LoadingMoreSkeletons({ view }: { view: 'list' | 'grid' }) {
  if (view === 'grid') {
    return (
      <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 py-2'>
        {Array.from({ length: LOAD_MORE_SKELETON_COUNT }).map((_, i) => (
          <ArtistCardSkeleton key={`load-more-grid-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col py-1' aria-hidden>
      {Array.from({ length: LOAD_MORE_SKELETON_COUNT }).map((_, i) => (
        <ArtistListItemSkeleton
          key={`load-more-list-${i}`}
          showProviders
          className={cn('rounded-lg', i % 2 !== 0 && 'bg-muted/30')}
        />
      ))}
    </div>
  );
}

export function ArtistsResults({
  artists,
  view,
  isLoading,
  isLoadingMore = false,
  error,
  hasLoaded = false,
  hasMore = false,
  isFiltering = false,
  noProvidersConnected = false,
  sentinelRef,
}: ArtistsResultsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const columnCount = 4;

  const artistGridRows = useMemo(() => {
    if (view !== 'grid') return [];
    const rows: HarmonizedArtist[][] = [];
    for (let i = 0; i < artists.length; i += columnCount) {
      rows.push(artists.slice(i, i + columnCount));
    }
    return rows;
  }, [artists, view, columnCount]);

  const listVirtualizer = useVirtualizer({
    count: view === 'grid' ? artistGridRows.length : artists.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (view === 'grid' ? 220 : 72),
    overscan: 5,
  });

  useEffect(() => {
    listVirtualizer.measure();
  }, [view, artists.length, listVirtualizer]);

  if (noProvidersConnected) {
    return (
      <EmptyState
        icon={Settings}
        title='No music providers connected'
        description='Connect Spotify, Tidal, or Apple Music in settings to see your followed artists.'
        action={
          <Link
            href='/settings'
            className='text-sm font-medium text-primary hover:underline'
          >
            Go to Settings
          </Link>
        }
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title='Failed to load artists'
        description={error}
      />
    );
  }

  if (isLoading && !hasLoaded) {
    return view === 'grid' ? <LoadingGrid /> : <ListSkeleton count={8} />;
  }

  // Don't flash empty while pages are still loading for an active filter.
  const stillSearching = isFiltering && (hasMore || isLoadingMore || isLoading);
  if (hasLoaded && artists.length === 0 && !stillSearching) {
    return (
      <EmptyState
        icon={MicVocal}
        title='No artists found'
        description='Try adjusting your filter or connect another music provider.'
      />
    );
  }

  return (
    <ScrollArea
      viewportRef={scrollRef}
      showShadow
      className='flex-1 -mx-1 px-1'
    >
      <div
        style={{
          height: `${listVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {listVirtualizer.getVirtualItems().map((virtualItem) => {
          if (view === 'list') {
            const artist = artists[virtualItem.index];
            if (!artist) return null;
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={listVirtualizer.measureElement}
                className='absolute top-0 left-0 w-full py-1'
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ArtistListItem
                  artist={artist}
                  showProviders
                  interactive
                  previewSide='bottom'
                  className={cn(virtualItem.index % 2 !== 0 && 'bg-muted/30')}
                />
              </div>
            );
          }

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
              <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 py-2'>
                {row.map((artist, i) => (
                  <Reveal
                    key={`${artistIdentityKey(artist)}#${virtualItem.index}-${i}`}
                    index={i}
                    className='h-full'
                  >
                    <ArtistCard
                      artist={artist}
                      interactive
                      previewSide='right'
                      previewAlign='start'
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isLoadingMore ? <LoadingMoreSkeletons view={view} /> : null}

      {sentinelRef && (
        <div ref={sentinelRef} className='h-4 w-full' aria-hidden />
      )}
    </ScrollArea>
  );
}
