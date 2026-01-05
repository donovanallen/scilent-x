'use client';

import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
} from '@scilent-one/harmonization-engine';
import { useCallback, useState, useTransition } from 'react';

import {
  searchReleases,
  searchTracks,
  searchArtists,
  type SearchFilters,
  type SearchType,
  type SortOption,
} from './actions';
import { SearchInput } from './search-input';
import { SearchResults } from './search-results';
import { SearchToolbar } from './search-toolbar';

interface SearchContainerProps {
  providers: Array<{ name: string; displayName: string }>;
}

export function SearchContainer({ providers }: SearchContainerProps) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('release');
  const [releaseResults, setReleaseResults] = useState<HarmonizedRelease[]>([]);
  const [trackResults, setTrackResults] = useState<HarmonizedTrack[]>([]);
  const [artistResults, setArtistResults] = useState<HarmonizedArtist[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({});
  const [availableFilters, setAvailableFilters] = useState<{
    releaseTypes: string[];
    genres: string[];
    providers: string[];
  }>({
    releaseTypes: [],
    genres: [],
    providers: providers.map((p) => p.name),
  });

  // Sort & View
  const [sort, setSort] = useState<SortOption>({
    field: 'relevance',
    direction: 'desc',
  });
  const [view, setView] = useState<'list' | 'grid'>('list');

  const handleSearch = useCallback(
    (searchQuery: string, searchFilters?: SearchFilters, type?: SearchType) => {
      setQuery(searchQuery);
      if (searchFilters) {
        setFilters(searchFilters);
      }
      const currentType = type ?? searchType;
      if (type) {
        setSearchType(type);
      }

      if (!searchQuery.trim()) {
        setReleaseResults([]);
        setTrackResults([]);
        setArtistResults([]);
        setTotal(0);
        setHasSearched(false);
        setError(null);
        return;
      }

      setHasSearched(true);

      startTransition(async () => {
        if (currentType === 'artist') {
          const response = await searchArtists(
            searchQuery,
            searchFilters ?? filters,
            sort
          );

          if (response.error) {
            setError(response.error);
            setArtistResults([]);
            setTotal(0);
          } else {
            setError(null);
            setArtistResults(response.results);
            setReleaseResults([]);
            setTrackResults([]);
            setTotal(response.total);
            setAvailableFilters({
              releaseTypes: [],
              genres: [],
              providers: response.availableFilters.providers,
            });
          }
        } else if (currentType === 'track') {
          const response = await searchTracks(
            searchQuery,
            searchFilters ?? filters,
            sort
          );

          if (response.error) {
            setError(response.error);
            setTrackResults([]);
            setTotal(0);
          } else {
            setError(null);
            setTrackResults(response.results);
            setReleaseResults([]);
            setArtistResults([]);
            setTotal(response.total);
            setAvailableFilters({
              releaseTypes: [],
              genres: [],
              providers: response.availableFilters.providers,
            });
          }
        } else {
          const response = await searchReleases(
            searchQuery,
            searchFilters ?? filters,
            sort
          );

          if (response.error) {
            setError(response.error);
            setReleaseResults([]);
            setTotal(0);
          } else {
            setError(null);
            setReleaseResults(response.results);
            setTrackResults([]);
            setArtistResults([]);
            setTotal(response.total);
            setAvailableFilters(response.availableFilters);
          }
        }
      });
    },
    [filters, sort, searchType]
  );

  const handleFilterChange = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters);
      if (query.trim()) {
        handleSearch(query, newFilters);
      }
    },
    [query, handleSearch]
  );

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      if (query.trim()) {
        startTransition(async () => {
          if (searchType === 'artist') {
            const response = await searchArtists(query, filters, newSort);
            if (!response.error) {
              setArtistResults(response.results);
              setTotal(response.total);
            }
          } else if (searchType === 'track') {
            const response = await searchTracks(query, filters, newSort);
            if (!response.error) {
              setTrackResults(response.results);
              setTotal(response.total);
            }
          } else {
            const response = await searchReleases(query, filters, newSort);
            if (!response.error) {
              setReleaseResults(response.results);
              setTotal(response.total);
            }
          }
        });
      }
    },
    [query, filters, searchType]
  );

  const handleSearchTypeChange = useCallback(
    (type: SearchType) => {
      setSearchType(type);
      // Re-run search with new type if there's an active query
      if (query.trim()) {
        handleSearch(query, filters, type);
      }
    },
    [query, filters, handleSearch]
  );

  return (
    <div className='flex flex-col flex-1 min-h-0 gap-4'>
      <SearchInput
        onSearch={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        availableFilters={availableFilters}
        providers={providers}
        isLoading={isPending}
        searchType={searchType}
        onSearchTypeChange={handleSearchTypeChange}
      />

      {hasSearched && (
        <SearchToolbar
          total={total}
          view={view}
          onViewChange={setView}
          sort={sort}
          onSortChange={handleSortChange}
          isLoading={isPending}
          searchType={searchType}
        />
      )}

      <SearchResults
        releaseResults={releaseResults}
        trackResults={trackResults}
        artistResults={artistResults}
        searchType={searchType}
        view={view}
        isLoading={isPending}
        error={error}
        hasSearched={hasSearched}
      />
    </div>
  );
}
