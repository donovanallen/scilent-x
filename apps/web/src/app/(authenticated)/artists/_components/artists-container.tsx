'use client';

import type { HarmonizedArtist } from '@scilent-one/harmony-engine';
import { useInfiniteScroll } from '@scilent-one/ui';
import { useSearchParams } from 'next/navigation';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWRInfinite from 'swr/infinite';

import { ALL_PROVIDERS_VALUE } from '@/components/provider-filter-toggle';
import { mergeFollowedArtistPages } from '@/lib/aggregate-followed-artists';
import { fetcher, ApiError } from '@/lib/swr';

import { ArtistsInputBar } from './artists-input-bar';
import { ArtistsResults } from './artists-results';
import { ArtistsToolbar, type ArtistsSortOption } from './artists-toolbar';

type ProviderCursors = Record<string, string | null>;

interface SingleProviderResponse {
  mode: 'single';
  items: HarmonizedArtist[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
  provider: string;
}

interface AggregateProviderResponse {
  mode: 'aggregate';
  items: HarmonizedArtist[];
  providerCursors: ProviderCursors;
  hasMore: boolean;
  total?: number;
  tokenErrors?: Array<{
    provider: string;
    code: string;
    reconnectVia: string;
  }>;
}

type ArtistsFollowingResponse =
  SingleProviderResponse | AggregateProviderResponse;

interface ArtistsContainerProps {
  providers: Array<{ name: string; displayName: string }>;
}

const PAGE_LIMIT = 50;

function buildArtistsKey(
  provider: string | null,
  cursor?: string | null,
  providerCursors?: ProviderCursors
): string {
  const params = new URLSearchParams();
  params.set('limit', String(PAGE_LIMIT));

  if (provider && provider !== ALL_PROVIDERS_VALUE) {
    params.set('provider', provider);
    if (cursor) {
      params.set('cursor', cursor);
    }
  } else if (providerCursors && Object.keys(providerCursors).length > 0) {
    params.set('providerCursors', JSON.stringify(providerCursors));
  }

  return `/api/v1/me/artists/following?${params.toString()}`;
}

export function ArtistsContainer({ providers }: ArtistsContainerProps) {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const providerParam = searchParams.get('provider');
  const lockedProvider =
    providerParam && providerParam !== ALL_PROVIDERS_VALUE
      ? providerParam
      : null;
  const isSingleProviderMode = lockedProvider !== null;

  const selectedProvider = lockedProvider ?? ALL_PROVIDERS_VALUE;

  const [filterQuery, setFilterQuery] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [sort, setSort] = useState<ArtistsSortOption>({ direction: 'asc' });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(filterQuery), 300);
    return () => clearTimeout(timer);
  }, [filterQuery]);

  const enabledProviderNames = providers.map((p) => p.name);

  const getKey = (
    pageIndex: number,
    previousPageData: ArtistsFollowingResponse | null
  ) => {
    if (pageIndex === 0) {
      return buildArtistsKey(lockedProvider);
    }

    if (!previousPageData?.hasMore) {
      return null;
    }

    if (previousPageData.mode === 'single') {
      return buildArtistsKey(lockedProvider, previousPageData.nextCursor);
    }

    return buildArtistsKey(null, null, previousPageData.providerCursors);
  };

  const {
    data: artistPages,
    error: artistsError,
    isLoading,
    isValidating,
    setSize,
    mutate,
  } = useSWRInfinite<ArtistsFollowingResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  useEffect(() => {
    setSize(1);
    void mutate();
  }, [lockedProvider, setSize, mutate]);

  useEffect(() => {
    if (!artistsError) return;
    console.error('Failed to load artists:', artistsError);
    toast.error('Failed to load artists');
  }, [artistsError]);

  const allArtists = useMemo(() => {
    if (!artistPages) return [];

    if (isSingleProviderMode) {
      return artistPages.flatMap((page) => page.items);
    }

    return artistPages.reduce(
      (acc, page) => mergeFollowedArtistPages(acc, page.items),
      [] as HarmonizedArtist[]
    );
  }, [artistPages, isSingleProviderMode]);

  const displayedArtists = useMemo(() => {
    let result = allArtists;

    if (debouncedFilter.trim()) {
      const query = debouncedFilter.trim().toLowerCase();
      result = result.filter((artist) =>
        (artist.nameNormalized ?? artist.name).toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => {
      const nameA = a.nameNormalized ?? a.name;
      const nameB = b.nameNormalized ?? b.name;
      const cmp = nameA.localeCompare(nameB, undefined, {
        sensitivity: 'base',
      });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [allArtists, debouncedFilter, sort]);

  const lastPage = artistPages?.[artistPages.length - 1];
  const hasMore = lastPage?.hasMore ?? false;
  const isPageLoading = isLoading || isValidating;
  const hasLoaded = !!artistPages;

  const noProvidersConnected =
    artistsError instanceof ApiError &&
    typeof artistsError.info === 'object' &&
    artistsError.info !== null &&
    'code' in artistsError.info &&
    (artistsError.info as { code: string }).code === 'NO_PROVIDER';

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isPageLoading,
    onLoadMore: () => setSize((size) => size + 1),
  });

  const handleProviderChange = useCallback(
    (value: string) => {
      if (isSingleProviderMode) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value === ALL_PROVIDERS_VALUE) {
        params.delete('provider');
      } else {
        params.set('provider', value);
      }

      const query = params.toString();
      router.replace(query ? `/artists?${query}` : '/artists');
    },
    [isSingleProviderMode, router, searchParams]
  );

  const errorMessage = useMemo(() => {
    if (!artistsError || noProvidersConnected) return null;
    if (artistsError instanceof ApiError) return artistsError.message;
    return 'Failed to load artists';
  }, [artistsError, noProvidersConnected]);

  const apiTotal = lastPage?.total;

  return (
    <div className='flex flex-col flex-1 min-h-0 gap-2'>
      <ArtistsInputBar
        filterQuery={filterQuery}
        onFilterQueryChange={setFilterQuery}
        selectedProvider={selectedProvider}
        onProviderChange={handleProviderChange}
        enabledProviders={enabledProviderNames}
        showProviderFilter={!isSingleProviderMode}
      />

      {hasLoaded && (
        <ArtistsToolbar
          total={
            debouncedFilter
              ? displayedArtists.length
              : (apiTotal ?? displayedArtists.length)
          }
          view={view}
          onViewChange={setView}
          sort={sort}
          onSortChange={setSort}
          isLoading={isPageLoading && !artistPages}
        />
      )}

      <ArtistsResults
        artists={displayedArtists}
        view={view}
        isLoading={isPageLoading}
        error={errorMessage}
        hasLoaded={hasLoaded}
        noProvidersConnected={noProvidersConnected}
        sentinelRef={sentinelRef}
      />
    </div>
  );
}
