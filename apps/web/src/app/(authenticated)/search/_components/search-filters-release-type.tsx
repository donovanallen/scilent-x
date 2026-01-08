'use client';

import type { ReleaseType } from '@scilent-one/harmony-engine';
import { ReleaseTypePill } from '@scilent-one/harmony-ui';
import { cn } from '@scilent-one/ui';

import type { SearchFilters } from '../actions';

const RELEASE_TYPES: ReleaseType[] = [
  'album',
  'single',
  'ep',
  'compilation',
  'soundtrack',
  'live',
  'remix',
];

interface SearchFiltersReleaseTypeProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export function SearchFiltersReleaseType({
  filters,
  onFilterChange,
}: SearchFiltersReleaseTypeProps) {
  const toggleReleaseType = (type: ReleaseType) => {
    const currentTypes = filters.releaseTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    onFilterChange({
      ...filters,
      releaseTypes: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  return (
    <>
      {RELEASE_TYPES.map((type) => {
        const isSelected = filters.releaseTypes?.includes(type);
        return (
          <ReleaseTypePill
            key={type}
            releaseType={type}
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-colors select-none',
              isSelected ? 'hover:bg-primary/80' : 'hover:bg-accent'
            )}
            onClick={() => toggleReleaseType(type)}
          />
        );
      })}
    </>
  );
}
