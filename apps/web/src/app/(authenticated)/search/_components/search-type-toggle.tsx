'use client';

import { ToggleGroup, ToggleGroupItem, useIsMobile } from '@scilent-one/ui';
import { Disc3, Music, User } from 'lucide-react';

import type { SearchType } from '../actions';

interface SearchTypeToggleProps {
  searchType: SearchType;
  onSearchTypeChange: (value: SearchType) => void;
}

export function SearchTypeToggle({
  searchType,
  onSearchTypeChange,
}: SearchTypeToggleProps) {
  const isMobile = useIsMobile();

  return (
    <ToggleGroup
      type='single'
      value={searchType}
      onValueChange={(value) => {
        if (value) onSearchTypeChange(value as SearchType);
      }}
      className='border rounded-lg p-2'
    >
      <ToggleGroupItem
        value='release'
        size='sm'
        className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        title='Releases'
      >
        <Disc3 className='size-3.5' />
        {!isMobile && searchType === 'release' && 'Releases'}
      </ToggleGroupItem>
      <ToggleGroupItem
        value='track'
        size='sm'
        className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        title='Tracks'
      >
        <Music className='size-3.5' />
        {!isMobile && searchType === 'track' && 'Tracks'}
      </ToggleGroupItem>
      <ToggleGroupItem
        value='artist'
        size='sm'
        className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        title='Artists'
      >
        <User className='size-3.5' />
        {!isMobile && searchType === 'artist' && 'Artists'}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
