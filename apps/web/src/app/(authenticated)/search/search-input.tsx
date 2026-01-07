'use client';

import type { ReleaseType } from '@scilent-one/harmony-engine';
import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  Input,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from '@scilent-one/ui';
import { Disc3, Loader2, Music, Search, User, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import type { SearchFilters, SearchType } from './actions';

const RELEASE_TYPES: { value: ReleaseType; label: string }[] = [
  { value: 'album', label: 'Album' },
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'soundtrack', label: 'Soundtrack' },
  { value: 'live', label: 'Live' },
  { value: 'remix', label: 'Remix' },
];

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
  providers,
  isLoading,
  searchType,
  onSearchTypeChange,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const toggleReleaseType = useCallback(
    (type: ReleaseType) => {
      const currentTypes = filters.releaseTypes || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];

      onFilterChange({
        ...filters,
        releaseTypes: newTypes.length > 0 ? newTypes : undefined,
      });
    },
    [filters, onFilterChange]
  );

  const toggleProvider = useCallback(
    (provider: string) => {
      const currentProviders = filters.providers || [];
      const newProviders = currentProviders.includes(provider)
        ? currentProviders.filter((p) => p !== provider)
        : [...currentProviders, provider];

      onFilterChange({
        ...filters,
        providers: newProviders.length > 0 ? newProviders : undefined,
      });
    },
    [filters, onFilterChange]
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
        <div className='relative'>
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

        {/* Suggestions Dropdown */}
        {showSuggestions && inputValue.length > 0 && (
          <div className='absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden'>
            <Command>
              <CommandList>
                <CommandEmpty>
                  Press Enter to search for &quot;{inputValue}&quot;
                </CommandEmpty>
                <CommandGroup heading='Quick Filters'>
                  <CommandItem
                    onSelect={() => {
                      setInputValue(`artist:${inputValue}`);
                      setShowSuggestions(false);
                    }}
                  >
                    <Search className='size-4 mr-2' />
                    Search artist: {inputValue}
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setInputValue(`album:${inputValue}`);
                      setShowSuggestions(false);
                    }}
                  >
                    <Search className='size-4 mr-2' />
                    Search album: {inputValue}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </form>

      {/* Search Type Toggle & Filter Pills */}
      <div className='flex flex-wrap items-center gap-2'>
        <ToggleGroup
          type='single'
          value={searchType}
          onValueChange={(value) => {
            if (value) onSearchTypeChange(value as SearchType);
          }}
          className='border rounded-lg p-1'
        >
          <ToggleGroupItem
            value='release'
            size='sm'
            className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          >
            <Disc3 className='size-3.5' />
            Releases
          </ToggleGroupItem>
          <ToggleGroupItem
            value='track'
            size='sm'
            className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          >
            <Music className='size-3.5' />
            Tracks
          </ToggleGroupItem>
          <ToggleGroupItem
            value='artist'
            size='sm'
            className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          >
            <User className='size-3.5' />
            Artists
          </ToggleGroupItem>
        </ToggleGroup>

        <span className='text-muted-foreground/50'>|</span>

        <span className='text-sm text-muted-foreground font-medium'>
          Filters:
        </span>

        {/* Release Type Pills - only shown for release search */}
        {searchType === 'release' && (
          <>
            {RELEASE_TYPES.map((type) => (
              <Badge
                key={type.value}
                variant={
                  filters.releaseTypes?.includes(type.value)
                    ? 'default'
                    : 'outline'
                }
                className={cn(
                  'cursor-pointer transition-colors select-none',
                  filters.releaseTypes?.includes(type.value)
                    ? 'hover:bg-primary/80'
                    : 'hover:bg-accent'
                )}
                onClick={() => toggleReleaseType(type.value)}
              >
                {type.label}
              </Badge>
            ))}
            <span className='text-muted-foreground/50'>|</span>
          </>
        )}

        {/* Provider Pills */}
        {providers.map((provider) => (
          <Badge
            key={provider.name}
            variant={
              filters.providers?.includes(provider.name) ? 'default' : 'outline'
            }
            className={cn(
              'cursor-pointer transition-colors select-none',
              filters.providers?.includes(provider.name)
                ? 'hover:bg-primary/80'
                : 'hover:bg-accent'
            )}
            onClick={() => toggleProvider(provider.name)}
          >
            {provider.displayName}
          </Badge>
        ))}

        {hasActiveFilters && (
          <>
            <span className='text-muted-foreground/50'>|</span>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
