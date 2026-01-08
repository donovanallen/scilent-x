'use client';

import { Badge, cn } from '@scilent-one/ui';

import type { SearchFilters } from '../actions';

interface SearchFiltersProviderProps {
  providers: { name: string; displayName: string }[];
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export function SearchFiltersProvider({
  providers,
  filters,
  onFilterChange,
}: SearchFiltersProviderProps) {
  const toggleProvider = (provider: string) => {
    const currentProviders = filters.providers || [];
    const newProviders = currentProviders.includes(provider)
      ? currentProviders.filter((p) => p !== provider)
      : [...currentProviders, provider];

    onFilterChange({
      ...filters,
      providers: newProviders.length > 0 ? newProviders : undefined,
    });
  };
  return (
    <>
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
    </>
  );
}
