'use client';

import { cn } from '@scilent-one/ui';
import type { HarmonizedArtistCredit } from '@scilent-one/harmony-engine';
import * as React from 'react';
import { InteractiveWrapper } from '../../interactions';
import type { HarmonizedArtist } from '../../types';

export interface ArtistCreditProps extends React.HTMLAttributes<HTMLSpanElement> {
  artists: HarmonizedArtistCredit[];
  linkable?: boolean | undefined;
  maxDisplay?: number | undefined;
  /**
   * Enable Harmony interactions (context menu + hover preview) on each credited
   * artist. Requires a surrounding `HarmonyInteractionProvider` to have any effect.
   * @default false
   */
  interactive?: boolean | undefined;
}

/**
 * Build a minimal HarmonizedArtist from a credit so it can drive the interaction
 * menus/previews. Mirrors the pattern used by ArtistMention and AlbumContextMenu's
 * "View Artist" action.
 */
function creditToArtist(credit: HarmonizedArtistCredit): HarmonizedArtist {
  return {
    name: credit.creditedName || credit.name,
    externalIds: credit.externalIds ?? {},
    sources: [],
    mergedAt: new Date(),
    confidence: 1,
  };
}

export function ArtistCredit({
  artists,
  linkable = false,
  maxDisplay,
  interactive = false,
  className,
  ...props
}: ArtistCreditProps) {
  const displayArtists = maxDisplay ? artists.slice(0, maxDisplay) : artists;
  const remaining = maxDisplay ? artists.length - maxDisplay : 0;

  // Precompute the interactive entity for each displayed artist so we don't
  // rebuild objects on every render.
  const artistEntities = React.useMemo(
    () => (interactive ? displayArtists.map(creditToArtist) : []),
    [interactive, displayArtists]
  );

  return (
    <span className={cn('text-muted-foreground', className)} {...props}>
      {displayArtists.map((artist, index) => {
        const name = (
          <span
            className={cn(
              'text-foreground',
              (linkable || interactive) && 'hover:underline cursor-pointer'
            )}
          >
            {artist.creditedName || artist.name}
          </span>
        );

        return (
          <React.Fragment key={`${artist.name}-${index}`}>
            {interactive ? (
              <InteractiveWrapper
                entityType="artist"
                entity={artistEntities[index]!}
                previewSide="top"
                previewAlign="center"
              >
                {name}
              </InteractiveWrapper>
            ) : (
              name
            )}
            {artist.joinPhrase && index < displayArtists.length - 1 && (
              <span className="text-muted-foreground">{artist.joinPhrase}</span>
            )}
            {!artist.joinPhrase && index < displayArtists.length - 1 && (
              <span className="text-muted-foreground">, </span>
            )}
          </React.Fragment>
        );
      })}
      {remaining > 0 && (
        <span className="text-muted-foreground"> +{remaining} more</span>
      )}
    </span>
  );
}
