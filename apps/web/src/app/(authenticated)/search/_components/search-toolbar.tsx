'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from '@scilent-one/ui';
import { Grid3X3, List, Loader2 } from 'lucide-react';

import type { SearchType, SortField, SortOption } from '../actions';

interface SearchToolbarProps {
  total: number;
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  isLoading?: boolean;
  searchType?: SearchType;
}

const SORT_OPTIONS: {
  value: string;
  label: string;
  field: SortField;
  direction: 'asc' | 'desc';
}[] = [
  {
    value: 'relevance-desc',
    label: 'Relevance',
    field: 'relevance',
    direction: 'desc',
  },
  {
    value: 'releaseDate-desc',
    label: 'Newest First',
    field: 'releaseDate',
    direction: 'desc',
  },
  {
    value: 'releaseDate-asc',
    label: 'Oldest First',
    field: 'releaseDate',
    direction: 'asc',
  },
  { value: 'title-asc', label: 'Title A-Z', field: 'title', direction: 'asc' },
  {
    value: 'title-desc',
    label: 'Title Z-A',
    field: 'title',
    direction: 'desc',
  },
  {
    value: 'artist-asc',
    label: 'Artist A-Z',
    field: 'artist',
    direction: 'asc',
  },
  {
    value: 'artist-desc',
    label: 'Artist Z-A',
    field: 'artist',
    direction: 'desc',
  },
];

export function SearchToolbar({
  total,
  view,
  onViewChange,
  sort,
  onSortChange,
  isLoading,
  searchType = 'release',
}: SearchToolbarProps) {
  const currentSortValue = `${sort.field}-${sort.direction}`;

  // Filter sort options based on search type
  // Tracks and artists don't have releaseDate
  // For artists, we also hide "Artist" sort since it's redundant with "Title" (name)
  const availableSortOptions = SORT_OPTIONS.filter((option) => {
    if (
      (searchType === 'track' || searchType === 'artist') &&
      option.field === 'releaseDate'
    ) {
      return false;
    }
    if (searchType === 'artist' && option.field === 'artist') {
      return false;
    }
    return true;
  }).map((option) => {
    // Rename "Title" to "Name" for artist search
    if (searchType === 'artist' && option.field === 'title') {
      return {
        ...option,
        label: option.direction === 'asc' ? 'Name A-Z' : 'Name Z-A',
      };
    }
    return option;
  });

  const handleSortChange = (value: string) => {
    const option = availableSortOptions.find((o) => o.value === value);
    if (option) {
      onSortChange({ field: option.field, direction: option.direction });
    }
  };

  return (
    <div className='flex items-center justify-between gap-4 py-2 border-b'>
      {/* Results count */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        {isLoading ? (
          <Loader2 className='size-4 animate-spin' />
        ) : (
          <span>
            {total} {total === 1 ? 'result' : 'results'}
          </span>
        )}
      </div>

      <div className='flex items-center gap-3'>
        {/* Sort Dropdown */}
        <Select value={currentSortValue} onValueChange={handleSortChange}>
          <SelectTrigger className='w-[160px] h-8 text-sm'>
            <SelectValue placeholder='Sort by...' />
          </SelectTrigger>
          <SelectContent>
            {availableSortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <ToggleGroup
          type='single'
          value={view}
          onValueChange={(value) => {
            if (value) onViewChange(value as 'list' | 'grid');
          }}
          className='bg-muted text-muted-foreground rounded-md p-0.5'
        >
          <ToggleGroupItem
            value='list'
            aria-label='List view'
            className={cn(
              'h-7 w-7 p-0',
              'data-[state=on]:bg-border data-[state=on]:text-foreground'
            )}
          >
            <List className='size-4' />
          </ToggleGroupItem>
          <ToggleGroupItem
            value='grid'
            aria-label='Grid view'
            className={cn(
              'h-7 w-7 p-0',
              'data-[state=on]:bg-border data-[state=on]:text-foreground'
            )}
          >
            <Grid3X3 className='size-4' />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
