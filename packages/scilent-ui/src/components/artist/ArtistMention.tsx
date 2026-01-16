'use client';

import * as React from 'react';
import { cn } from '@scilent-one/ui';
import { InteractiveWrapper } from '../../interactions';
import type { HarmonizedArtist } from '../../types';

export interface ArtistMentionProps {
  /** Artist ID (provider-specific) */
  id: string;
  /** Artist name to display */
  name: string;
  /** Provider name (e.g., 'tidal', 'musicbrainz') */
  provider: string;
  /** External IDs from various providers */
  externalIds?: Record<string, string>;
  /** Click handler for the mention */
  onClick?: ((artistId: string, provider: string) => void) | undefined;
  /** Additional class name */
  className?: string;
  /** Children to render (defaults to #name) */
  children?: React.ReactNode;
}

/**
 * ArtistMention component that wraps artist mentions with interactive behaviors.
 *
 * When used within a HarmonyInteractionProvider, this component enables:
 * - Context menu with artist actions (view, copy, open external)
 * - Hover preview showing artist info
 *
 * When used outside the provider, renders a simple styled link.
 */
export function ArtistMention({
  id,
  name,
  provider,
  externalIds,
  onClick,
  className,
  children,
}: ArtistMentionProps) {
  // Construct a minimal HarmonizedArtist from the mention data
  const artist = React.useMemo<HarmonizedArtist>(() => {
    const ids = externalIds ?? { [provider]: id };

    return {
      name,
      externalIds: ids,
      sources: [
        {
          provider,
          id,
          fetchedAt: new Date(),
        },
      ],
      mergedAt: new Date(),
      confidence: 1.0,
    };
  }, [id, name, provider, externalIds]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(id, provider);
    },
    [id, provider, onClick]
  );

  const content = (
    <button
      type="button"
      className={cn(
        'rich-text-mention tiptap-mention text-primary hover:underline font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      onClick={handleClick}
      aria-label={`View artist ${name}`}
    >
      {children ?? `#${name}`}
    </button>
  );

  return (
    <InteractiveWrapper
      entityType="artist"
      entity={artist}
      previewSide="top"
      previewAlign="center"
    >
      {content}
    </InteractiveWrapper>
  );
}
