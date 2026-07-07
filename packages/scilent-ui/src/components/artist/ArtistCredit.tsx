'use client';

import { cn } from '@scilent-one/ui';
import type { HarmonizedArtistCredit } from '@scilent-one/harmony-engine';
import * as React from 'react';

export interface ArtistCreditProps extends React.HTMLAttributes<HTMLSpanElement> {
  artists: HarmonizedArtistCredit[];
  linkable?: boolean | undefined;
  maxDisplay?: number | undefined;
}

export function ArtistCredit({
  artists,
  linkable = false,
  maxDisplay,
  className,
  ...props
}: ArtistCreditProps) {
  const displayArtists = maxDisplay ? artists.slice(0, maxDisplay) : artists;
  const remaining = maxDisplay ? artists.length - maxDisplay : 0;

  return (
    <span className={cn('text-muted-foreground', className)} {...props}>
      {displayArtists.map((artist, index) => (
        <React.Fragment key={`${artist.name}-${index}`}>
          <span
            className={cn(
              'text-foreground',
              linkable && 'hover:underline cursor-pointer'
            )}
          >
            {artist.creditedName || artist.name}
          </span>
          {artist.joinPhrase && index < displayArtists.length - 1 && (
            <span className="text-muted-foreground">{artist.joinPhrase}</span>
          )}
          {!artist.joinPhrase && index < displayArtists.length - 1 && (
            <span className="text-muted-foreground">, </span>
          )}
        </React.Fragment>
      ))}
      {remaining > 0 && (
        <span className="text-muted-foreground"> +{remaining} more</span>
      )}
    </span>
  );
}
