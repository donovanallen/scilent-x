'use server';

import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
  ReleaseType,
  ReleaseStatus,
} from '@scilent-one/harmonization-engine';

import { getHarmonizationEngine } from '@/lib/harmonization';

// Search type
export type SearchType = 'release' | 'track' | 'artist';

// Search filter types
export interface SearchFilters {
  releaseTypes?: ReleaseType[] | undefined;
  releaseStatuses?: ReleaseStatus[] | undefined;
  genres?: string[] | undefined;
  providers?: string[] | undefined;
  yearFrom?: number | undefined;
  yearTo?: number | undefined;
}

// Sort options
export type SortField = 'relevance' | 'releaseDate' | 'title' | 'artist';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

// Search response for releases
export interface ReleaseSearchResponse {
  results: HarmonizedRelease[];
  total: number;
  filters: SearchFilters;
  appliedFilters: SearchFilters;
  availableFilters: {
    releaseTypes: ReleaseType[];
    genres: string[];
    providers: string[];
  };
  error?: string;
}

// Search response for tracks
export interface TrackSearchResponse {
  results: HarmonizedTrack[];
  total: number;
  filters: SearchFilters;
  appliedFilters: SearchFilters;
  availableFilters: {
    providers: string[];
  };
  error?: string;
}

// Search response for artists
export interface ArtistSearchResponse {
  results: HarmonizedArtist[];
  total: number;
  filters: SearchFilters;
  appliedFilters: SearchFilters;
  availableFilters: {
    providers: string[];
  };
  error?: string;
}

// Legacy alias for backwards compatibility
export type SearchResponse = ReleaseSearchResponse;

// Sort function helper
function sortReleases(
  releases: HarmonizedRelease[],
  sort: SortOption
): HarmonizedRelease[] {
  const sorted = [...releases];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'title':
        comparison = (a.titleNormalized || a.title).localeCompare(
          b.titleNormalized || b.title
        );
        break;
      case 'artist':
        const artistA = a.artists[0]?.name || '';
        const artistB = b.artists[0]?.name || '';
        comparison = artistA.localeCompare(artistB);
        break;
      case 'releaseDate':
        const yearA = a.releaseDate?.year || 0;
        const yearB = b.releaseDate?.year || 0;
        comparison = yearA - yearB;
        break;
      case 'relevance':
      default:
        // Relevance is the default order from search
        return 0;
    }

    return sort.direction === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

// Filter function helper
function filterReleases(
  releases: HarmonizedRelease[],
  filters: SearchFilters
): HarmonizedRelease[] {
  return releases.filter((release) => {
    // Filter by release type
    if (
      filters.releaseTypes?.length &&
      !filters.releaseTypes.includes(release.releaseType)
    ) {
      return false;
    }

    // Filter by release status
    if (
      filters.releaseStatuses?.length &&
      release.status &&
      !filters.releaseStatuses.includes(release.status)
    ) {
      return false;
    }

    // Filter by genre
    if (filters.genres?.length) {
      const releaseGenres = release.genres || [];
      if (!filters.genres.some((g) => releaseGenres.includes(g))) {
        return false;
      }
    }

    // Filter by provider
    if (filters.providers?.length) {
      const releaseProviders = release.sources.map((s) => s.provider);
      if (!filters.providers.some((p) => releaseProviders.includes(p))) {
        return false;
      }
    }

    // Filter by year range
    const year = release.releaseDate?.year;
    if (filters.yearFrom && (!year || year < filters.yearFrom)) {
      return false;
    }
    if (filters.yearTo && (!year || year > filters.yearTo)) {
      return false;
    }

    return true;
  });
}

// Extract available filters from results
function extractAvailableFilters(releases: HarmonizedRelease[]) {
  const releaseTypes = new Set<ReleaseType>();
  const genres = new Set<string>();
  const providers = new Set<string>();

  for (const release of releases) {
    releaseTypes.add(release.releaseType);
    release.genres?.forEach((g) => genres.add(g));
    release.sources.forEach((s) => providers.add(s.provider));
  }

  return {
    releaseTypes: Array.from(releaseTypes),
    genres: Array.from(genres).sort(),
    providers: Array.from(providers).sort(),
  };
}

export async function searchReleases(
  query: string,
  filters?: SearchFilters,
  sort?: SortOption,
  limit = 50
): Promise<SearchResponse> {
  if (!query.trim()) {
    return {
      results: [],
      total: 0,
      filters: filters || {},
      appliedFilters: {},
      availableFilters: {
        releaseTypes: [],
        genres: [],
        providers: [],
      },
    };
  }

  const engine = getHarmonizationEngine();

  try {
    // Fetch more results than limit to allow for filtering
    const rawResults = await engine.search(
      query,
      filters?.providers,
      limit * 2
    );

    // Extract available filters before applying filters
    const availableFilters = extractAvailableFilters(rawResults);

    // Apply filters
    let filteredResults = filters
      ? filterReleases(rawResults, filters)
      : rawResults;

    // Apply sorting
    if (sort && sort.field !== 'relevance') {
      filteredResults = sortReleases(filteredResults, sort);
    }

    // Limit results
    const results = filteredResults.slice(0, limit);

    return {
      results,
      total: filteredResults.length,
      filters: filters || {},
      appliedFilters: filters || {},
      availableFilters,
    };
  } catch (err) {
    return {
      results: [],
      total: 0,
      filters: filters || {},
      appliedFilters: {},
      availableFilters: {
        releaseTypes: [],
        genres: [],
        providers: [],
      },
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function searchTracks(
  query: string,
  filters?: SearchFilters,
  sort?: SortOption,
  limit = 50
): Promise<TrackSearchResponse> {
  if (!query.trim()) {
    return {
      results: [],
      total: 0,
      filters: filters || {},
      appliedFilters: {},
      availableFilters: {
        providers: [],
      },
    };
  }

  const engine = getHarmonizationEngine();

  try {
    // Fetch track results
    const rawResults = await engine.searchTracks(
      query,
      filters?.providers,
      limit * 2
    );

    // Extract available providers from results
    const providers = new Set<string>();
    for (const track of rawResults) {
      track.sources.forEach((s) => providers.add(s.provider));
    }

    // Filter by provider if specified
    let filteredResults = rawResults;
    if (filters?.providers?.length) {
      filteredResults = rawResults.filter((track) => {
        const trackProviders = track.sources.map((s) => s.provider);
        return filters.providers!.some((p) => trackProviders.includes(p));
      });
    }

    // Apply sorting for tracks
    if (sort && sort.field !== 'relevance') {
      const sorted = [...filteredResults];
      sorted.sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
          case 'title':
            comparison = (a.titleNormalized || a.title).localeCompare(
              b.titleNormalized || b.title
            );
            break;
          case 'artist':
            const artistA = a.artists[0]?.name || '';
            const artistB = b.artists[0]?.name || '';
            comparison = artistA.localeCompare(artistB);
            break;
          case 'releaseDate':
          default:
            return 0;
        }

        return sort.direction === 'desc' ? -comparison : comparison;
      });
      filteredResults = sorted;
    }

    // Limit results
    const results = filteredResults.slice(0, limit);

    return {
      results,
      total: filteredResults.length,
      filters: filters || {},
      appliedFilters: filters || {},
      availableFilters: {
        providers: Array.from(providers).sort(),
      },
    };
  } catch (err) {
    return {
      results: [],
      total: 0,
      filters: filters || {},
      appliedFilters: {},
      availableFilters: {
        providers: [],
      },
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function searchArtists(
  query: string,
  filters?: SearchFilters,
  sort?: SortOption,
  limit = 50
): Promise<ArtistSearchResponse> {
  if (!query.trim()) {
    return {
      results: [],
      total: 0,
      filters: filters || {},
      appliedFilters: {},
      availableFilters: {
        providers: [],
      },
    };
  }

  const engine = getHarmonizationEngine();

  try {
    // Fetch artist results
    const rawResults = await engine.searchArtists(
      query,
      filters?.providers,
      limit * 2
    );

    // Extract available providers from results
    const providers = new Set<string>();
    for (const artist of rawResults) {
      artist.sources.forEach((s) => providers.add(s.provider));
    }

    // Filter by provider if specified
    let filteredResults = rawResults;
    if (filters?.providers?.length) {
      filteredResults = rawResults.filter((artist) => {
        const artistProviders = artist.sources.map((s) => s.provider);
        return filters.providers!.some((p) => artistProviders.includes(p));
      });
    }

    // Apply sorting for artists
    if (sort && sort.field !== 'relevance') {
      const sorted = [...filteredResults];
      sorted.sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
          case 'title':
          case 'artist':
            // For artists, sort by name
            comparison = (a.nameNormalized || a.name).localeCompare(
              b.nameNormalized || b.name
            );
            break;
          case 'releaseDate':
          default:
            return 0;
        }

        return sort.direction === 'desc' ? -comparison : comparison;
      });
      filteredResults = sorted;
    }

    // Limit results
    const results = filteredResults.slice(0, limit);

    return {
      results,
      total: filteredResults.length,
      filters: filters || {},
      appliedFilters: filters || {},
      availableFilters: {
        providers: Array.from(providers).sort(),
      },
    };
  } catch (err) {
    return {
      results: [],
      total: 0,
      filters: filters || {},
      appliedFilters: {},
      availableFilters: {
        providers: [],
      },
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function getEnabledProviders() {
  const engine = getHarmonizationEngine();
  const providers = engine.getEnabledProviders();
  return providers.map((p) => ({
    name: p.name,
    displayName: p.displayName,
  }));
}
