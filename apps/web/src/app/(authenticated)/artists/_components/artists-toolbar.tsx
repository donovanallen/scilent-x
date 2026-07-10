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

export type ArtistsSortDirection = 'asc' | 'desc';

export interface ArtistsSortOption {
  direction: ArtistsSortDirection;
}

interface ArtistsToolbarProps {
  total: number;
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  sort: ArtistsSortOption;
  onSortChange: (sort: ArtistsSortOption) => void;
  isLoading?: boolean;
}

const SORT_OPTIONS: {
  value: string;
  label: string;
  direction: ArtistsSortDirection;
}[] = [
  { value: 'name-asc', label: 'Name A-Z', direction: 'asc' },
  { value: 'name-desc', label: 'Name Z-A', direction: 'desc' },
];

export function ArtistsToolbar({
  total,
  view,
  onViewChange,
  sort,
  onSortChange,
  isLoading,
}: ArtistsToolbarProps) {
  const currentSortValue = `name-${sort.direction}`;

  const handleSortChange = (value: string) => {
    const option = SORT_OPTIONS.find((o) => o.value === value);
    if (option) {
      onSortChange({ direction: option.direction });
    }
  };

  return (
    <div className='flex items-center justify-between gap-4 py-2 border-b'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        {isLoading ? (
          <Loader2 className='size-4 animate-spin' />
        ) : (
          <span>
            {total} {total === 1 ? 'artist' : 'artists'}
          </span>
        )}
      </div>

      <div className='flex items-center gap-3'>
        <Select value={currentSortValue} onValueChange={handleSortChange}>
          <SelectTrigger className='w-[160px] h-8 text-sm'>
            <SelectValue placeholder='Sort by...' />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
