'use client';

import { ToggleGroup, ToggleGroupItem, useIsMobile } from '@scilent-one/ui';
import { Disc3, Music, User } from 'lucide-react';
import { useState } from 'react';

import type { SearchType } from '../actions';

interface SearchTypeToggleProps {
  searchType: SearchType;
  onSearchTypeChange: (value: SearchType) => void;
}

export function SearchTypeToggle({
  searchType,
  onSearchTypeChange,
}: SearchTypeToggleProps) {
  const [currentSearchType, setCurrentSearchType] =
    useState<SearchType>(searchType);
  const isMobile = useIsMobile();

  const handleSearchTypeChange = (value: SearchType) => {
    setCurrentSearchType(value);
    onSearchTypeChange(value);
  };

  return (
    <ToggleGroup
      type='single'
      value={currentSearchType}
      onValueChange={handleSearchTypeChange}
      className='border rounded-lg p-2'
    >
      <ToggleGroupItem
        value='release'
        size='sm'
        className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        title='Releases'
      >
        <Disc3 className='size-3.5' />
        {!isMobile && currentSearchType === 'release' && 'Releases'}
      </ToggleGroupItem>
      <ToggleGroupItem
        value='track'
        size='sm'
        className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        title='Tracks'
      >
        <Music className='size-3.5' />
        {!isMobile && currentSearchType === 'track' && 'Tracks'}
      </ToggleGroupItem>
      <ToggleGroupItem
        value='artist'
        size='sm'
        className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        title='Artists'
      >
        <User className='size-3.5' />
        {!isMobile && currentSearchType === 'artist' && 'Artists'}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
