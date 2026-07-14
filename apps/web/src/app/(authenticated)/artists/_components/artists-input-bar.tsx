'use client';

import { Button, Input } from '@scilent-one/ui';
import { Search, X } from 'lucide-react';
import { useCallback } from 'react';

import {
  ALL_PROVIDERS_VALUE,
  ProviderFilterToggle,
} from '@/components/provider-filter-toggle';

interface ArtistsInputBarProps {
  filterQuery: string;
  onFilterQueryChange: (query: string) => void;
  selectedProvider: string;
  onProviderChange: (value: string) => void;
  enabledProviders: string[];
}

export function ArtistsInputBar({
  filterQuery,
  onFilterQueryChange,
  selectedProvider,
  onProviderChange,
  enabledProviders,
}: ArtistsInputBarProps) {
  const handleClear = useCallback(() => {
    onFilterQueryChange('');
  }, [onFilterQueryChange]);

  return (
    <div className='flex w-full gap-2'>
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
        <Input
          value={filterQuery}
          onChange={(e) => onFilterQueryChange(e.target.value)}
          placeholder='Filter artists...'
          className='pl-10 pr-10 h-12'
          aria-label='Filter artists by name'
        />
        {filterQuery && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='absolute right-1 top-1/2 -translate-y-1/2 size-8'
            onClick={handleClear}
            aria-label='Clear filter'
          >
            <X className='size-4' />
          </Button>
        )}
      </div>

      <ProviderFilterToggle
        selectedProvider={selectedProvider}
        onProviderChange={onProviderChange}
        enabledProviders={enabledProviders}
        showAllOption
      />
    </div>
  );
}

export { ALL_PROVIDERS_VALUE };
