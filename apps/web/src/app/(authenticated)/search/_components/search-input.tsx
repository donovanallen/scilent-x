'use client';

import { Button, Input } from '@scilent-one/ui';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import type { SearchFilters, SearchType } from '../actions';

// import { SearchFiltersProvider } from './search-filters-provider';
import { SearchFiltersReleaseType } from './search-filters-release-type';
import { SearchTypeToggle } from './search-type-toggle';

interface SearchInputProps {
  onSearch: (query: string, filters?: SearchFilters, type?: SearchType) => void;
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  availableFilters: {
    releaseTypes: string[];
    genres: string[];
    providers: string[];
  };
  providers: Array<{ name: string; displayName: string }>;
  isLoading?: boolean;
  searchType: SearchType;
  onSearchTypeChange: (type: SearchType) => void;
}

export function SearchInput({
  onSearch,
  filters,
  onFilterChange,
  // providers,
  isLoading,
  searchType,
  onSearchTypeChange,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [_showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (inputValue.trim()) {
        onSearch(inputValue.trim());
        setShowSuggestions(false);
      }
    },
    [inputValue, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const clearAllFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters =
    (filters.releaseTypes?.length ?? 0) > 0 ||
    (filters.providers?.length ?? 0) > 0 ||
    (filters.genres?.length ?? 0) > 0;

  return (
    <div className='space-y-3' ref={containerRef}>
      {/* Main Search Input */}
      <form onSubmit={handleSubmit} className='relative'>
        <div className='flex w-full gap-2'>
          <SearchTypeToggle
            searchType={searchType}
            onSearchTypeChange={onSearchTypeChange}
          />
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              ref={inputRef}
              type='text'
              placeholder='Search releases, artists, albums...'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className='pl-10 pr-24 h-12 text-base'
            />
            <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2'>
              {inputValue && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2'
                  onClick={() => {
                    setInputValue('');
                    inputRef.current?.focus();
                  }}
                >
                  <X className='size-4' />
                </Button>
              )}
              <Button
                type='submit'
                size='sm'
                className='h-8'
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Search Type Toggle & Filter Pills */}
      <div className='flex flex-col lg:flex-row gap-2'>
        {/* Release Type Pills - only shown for release search */}
        <div className='flex flex-wrap items-center gap-2'>
          {searchType === 'release' && (
            <>
              <SearchFiltersReleaseType
                filters={filters}
                onFilterChange={onFilterChange}
              />
              {/* <Separator
                orientation='vertical'
                className='bg-amber-500 border-amber-400'
              /> */}
            </>
          )}

          {/* Provider Pills */}
          {/* <SearchFiltersProvider
            providers={providers}
            filters={filters}
            onFilterChange={onFilterChange}
          /> */}
        </div>

        {hasActiveFilters && (
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
