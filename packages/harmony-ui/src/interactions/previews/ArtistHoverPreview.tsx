'use client';

import * as React from 'react';
import { Badge, cn } from '@scilent-one/ui';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedArtist } from '../../types';
import { formatPartialDate } from '../../utils';
import { PlatformBadgeList } from '../../components/common';

export interface ArtistHoverPreviewProps {
  /** The artist entity */
  entity: HarmonizedEntity;
  /** Preview mode */
  mode?: 'mini' | 'full' | 'links';
  /** Additional class name */
  className?: string;
}

const artistTypeLabels: Record<string, string> = {
  person: 'Solo Artist',
  group: 'Group',
  orchestra: 'Orchestra',
  choir: 'Choir',
  character: 'Character',
  other: 'Artist',
};

/**
 * Hover preview content for artist entities.
 * Shows artist info with configurable detail level.
 */
export function ArtistHoverPreview({
  entity,
  mode = 'mini',
  className,
}: ArtistHoverPreviewProps) {
  const artist = entity as HarmonizedArtist;

  // Build platform list for badge display
  const platforms = React.useMemo(() => {
    return artist.sources?.map((s) => s.provider) ?? [];
  }, [artist.sources]);

  // Links only mode
  if (mode === 'links') {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="font-medium truncate">{artist.name}</p>
        {artist.disambiguation && (
          <p className="text-sm text-muted-foreground truncate">
            {artist.disambiguation}
          </p>
        )}
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} abbreviated />
        )}
      </div>
    );
  }

  // Mini mode - compact preview
  if (mode === 'mini') {
    return (
      <div className={cn('space-y-3', className)}>
        <div>
          <p className="font-medium leading-tight">{artist.name}</p>
          {artist.disambiguation && (
            <p className="text-sm text-muted-foreground">
              {artist.disambiguation}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {artist.type && (
            <Badge variant="secondary" className="text-xs">
              {artistTypeLabels[artist.type] ?? artist.type}
            </Badge>
          )}
          {artist.country && (
            <Badge variant="outline" className="text-xs">
              {artist.country}
            </Badge>
          )}
        </div>

        {artist.genres && artist.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artist.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
            {artist.genres.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{artist.genres.length - 3} more
              </span>
            )}
          </div>
        )}

        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} abbreviated />
        )}
      </div>
    );
  }

  // Full mode - detailed preview
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <p className="font-semibold text-base leading-tight">{artist.name}</p>
        {artist.disambiguation && (
          <p className="text-sm text-muted-foreground mt-1">
            {artist.disambiguation}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {artist.type && (
          <Badge variant="secondary" className="text-xs">
            {artistTypeLabels[artist.type] ?? artist.type}
          </Badge>
        )}
        {artist.country && (
          <Badge variant="outline" className="text-xs">
            {artist.country}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {artist.beginDate && (
          <div>
            <span className="text-muted-foreground">
              {artist.type === 'person' ? 'Born:' : 'Formed:'}
            </span>
            <span className="ml-1">{formatPartialDate(artist.beginDate)}</span>
          </div>
        )}
        {artist.endDate && (
          <div>
            <span className="text-muted-foreground">
              {artist.type === 'person' ? 'Died:' : 'Disbanded:'}
            </span>
            <span className="ml-1">{formatPartialDate(artist.endDate)}</span>
          </div>
        )}
      </div>

      {artist.genres && artist.genres.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Genres</p>
          <div className="flex flex-wrap gap-1">
            {artist.genres.slice(0, 5).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
            {artist.genres.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{artist.genres.length - 5}
              </Badge>
            )}
          </div>
        </div>
      )}

      {artist.aliases && artist.aliases.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Also known as</p>
          <p className="text-xs text-muted-foreground">
            {artist.aliases.slice(0, 3).join(', ')}
            {artist.aliases.length > 3 && `, +${artist.aliases.length - 3} more`}
          </p>
        </div>
      )}

      {platforms.length > 0 && (
        <PlatformBadgeList platforms={platforms} abbreviated />
      )}
    </div>
  );
}
