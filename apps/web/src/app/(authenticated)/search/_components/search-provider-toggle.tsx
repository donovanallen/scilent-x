'use client';

import {
  ProviderIcon,
  isProviderSupported,
  type IconProvider,
} from '@scilent-one/scilent-ui';
import { ToggleGroup, ToggleGroupItem, useIsMobile } from '@scilent-one/ui';
import { Globe, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';

/**
 * Value used by the provider toggle when no specific provider is selected.
 * Maps to `SearchFilters.providers === undefined` (search every enabled provider).
 */
export const ALL_PROVIDERS_VALUE = 'all';

/**
 * Connectable catalog providers offered as explicit filter options, in display
 * order. MusicBrainz is intentionally omitted: it needs no per-user auth, so a
 * MusicBrainz-only search is equivalent to the default "All" behavior.
 *
 * `requiresAuth` marks providers the user must connect (OAuth / MusicKit).
 */
const CATALOG_PROVIDERS: {
  name: string;
  label: string;
  requiresAuth: boolean;
}[] = [
  { name: 'spotify', label: 'Spotify', requiresAuth: true },
  { name: 'tidal', label: 'Tidal', requiresAuth: true },
  { name: 'apple_music', label: 'Apple Music', requiresAuth: true },
];

interface SearchProviderToggleProps {
  /** Currently selected provider name, or {@link ALL_PROVIDERS_VALUE}. */
  selectedProvider: string;
  onProviderChange: (value: string) => void;
  /** Provider names enabled app-wide (configured + turned on server-side). */
  enabledProviders: string[];
}

function ProviderGlyph({ name }: { name: string }) {
  if (isProviderSupported(name)) {
    return (
      <ProviderIcon
        provider={name as IconProvider}
        size='sm'
        color='current'
        // `text-inherit` makes monochrome marks (e.g. Tidal, which otherwise
        // pins `text-foreground`) track the toggle item's own color so they
        // stay legible on both the transparent and selected (bg-primary) states.
        className='size-3.5 text-inherit'
        aria-hidden
      />
    );
  }
  // MusicBrainz (and any future non-branded provider) has no brand icon.
  return <Database className='size-3.5' />;
}

export function SearchProviderToggle({
  selectedProvider,
  onProviderChange,
  enabledProviders,
}: SearchProviderToggleProps) {
  const isMobile = useIsMobile();
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    let cancelled = false;

    authClient
      .listAccounts()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setConnectedProviders(
          new Set(data.map((account) => account.providerId))
        );
      })
      .catch((error) => {
        console.error('Failed to load connected providers:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const enabledSet = new Set(enabledProviders);

  // Only surface providers that are both enabled app-wide and auth'd by the
  // user; unavailable providers are hidden rather than shown disabled.
  const availableProviders = CATALOG_PROVIDERS.filter((provider) => {
    if (!enabledSet.has(provider.name)) return false;
    return provider.requiresAuth ? connectedProviders.has(provider.name) : true;
  });

  return (
    <ToggleGroup
      type='single'
      value={selectedProvider}
      onValueChange={(value) => {
        if (value) onProviderChange(value);
      }}
      className='border rounded-lg p-2'
    >
      <ToggleGroupItem
        value={ALL_PROVIDERS_VALUE}
        size='sm'
        className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        title='All providers'
      >
        <Globe className='size-3.5' />
        {!isMobile && selectedProvider === ALL_PROVIDERS_VALUE && 'All'}
      </ToggleGroupItem>

      {availableProviders.map((provider) => {
        const isSelected = selectedProvider === provider.name;

        return (
          <ToggleGroupItem
            key={provider.name}
            value={provider.name}
            size='sm'
            className='gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
            title={provider.label}
          >
            <ProviderGlyph name={provider.name} />
            {!isMobile && isSelected && provider.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
