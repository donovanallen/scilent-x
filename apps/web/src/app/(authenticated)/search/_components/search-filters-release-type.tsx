'use client';

import type { ReleaseType } from '@scilent-one/harmony-engine';
import { Badge, cn } from '@scilent-one/ui';

import type { SearchFilters } from '../actions';

const RELEASE_TYPES: { value: ReleaseType; label: string }[] = [
  { value: 'album', label: 'Album' },
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'soundtrack', label: 'Soundtrack' },
  { value: 'live', label: 'Live' },
  { value: 'remix', label: 'Remix' },
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
      {RELEASE_TYPES.map((type) => (
        <Badge
          key={type.value}
          variant={
            filters.releaseTypes?.includes(type.value) ? 'default' : 'outline'
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
    </>
  );
}
