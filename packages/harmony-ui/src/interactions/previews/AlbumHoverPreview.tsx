'use client';

import * as React from 'react';
import { Badge, cn } from '@scilent-one/ui';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedRelease } from '../../types';
import {
  formatPartialDate,
  formatArtistCredits,
  getFrontArtworkUrl,
} from '../../utils';
import { PlatformBadgeList } from '../../components/common';

export interface AlbumHoverPreviewProps {
  /** The album/release entity */
  entity: HarmonizedEntity;
  /** Preview mode */
  mode?: 'mini' | 'full' | 'links';
  /** Additional class name */
  className?: string;
}

const releaseTypeLabels: Record<string, string> = {
  album: 'Album',
  single: 'Single',
  ep: 'EP',
  compilation: 'Compilation',
  soundtrack: 'Soundtrack',
  live: 'Live',
  remix: 'Remix',
  other: 'Release',
};

/**
 * Hover preview content for album/release entities.
 * Shows release info with configurable detail level.
 */
export function AlbumHoverPreview({
  entity,
  mode = 'mini',
  className,
}: AlbumHoverPreviewProps) {
  const release = entity as HarmonizedRelease;
  const artworkUrl = getFrontArtworkUrl(release.artwork);

  // Build platform list for badge display
  const platforms = React.useMemo(() => {
    return release.sources?.map((s) => s.provider) ?? [];
  }, [release.sources]);

  // Calculate total tracks
  const totalTracks = React.useMemo(() => {
    return release.media?.reduce((acc, m) => acc + (m.tracks?.length ?? 0), 0) ?? 0;
  }, [release.media]);

  // Links only mode
  if (mode === 'links') {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="font-medium truncate">{release.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {formatArtistCredits(release.artists)}
        </p>
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} abbreviated />
        )}
      </div>
    );
  }

  // Mini mode - compact preview with small artwork
  if (mode === 'mini') {
    return (
      <div className={cn('flex gap-3', className)}>
        {artworkUrl && (
          <img
            src={artworkUrl}
            alt={release.title}
            className="h-16 w-16 rounded-md object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium leading-tight truncate">{release.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {formatArtistCredits(release.artists)}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {releaseTypeLabels[release.releaseType] ?? release.releaseType}
            </Badge>
            {release.releaseDate?.year && (
              <span>{formatPartialDate(release.releaseDate)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full mode - detailed preview
  return (
    <div className={cn('space-y-4', className)}>
      {artworkUrl && (
        <img
          src={artworkUrl}
          alt={release.title}
          className="w-full aspect-square rounded-md object-cover"
        />
      )}

      <div>
        <p className="font-semibold text-base leading-tight">{release.title}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {formatArtistCredits(release.artists)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          {releaseTypeLabels[release.releaseType] ?? release.releaseType}
        </Badge>
        {release.releaseDate?.year && (
          <Badge variant="outline" className="text-xs">
            {formatPartialDate(release.releaseDate)}
          </Badge>
        )}
        {totalTracks > 0 && (
          <Badge variant="outline" className="text-xs">
            {totalTracks} track{totalTracks !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {release.labels && release.labels.length > 0 && release.labels[0] && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Label:</span>
            <span className="ml-1">{release.labels[0].name}</span>
          </div>
        )}
        {release.gtin && (
          <div className="col-span-2">
            <span className="text-muted-foreground">UPC:</span>
            <span className="ml-1 font-mono text-xs">{release.gtin}</span>
          </div>
        )}
        {release.releaseCountry && (
          <div>
            <span className="text-muted-foreground">Country:</span>
            <span className="ml-1">{release.releaseCountry}</span>
          </div>
        )}
      </div>

      {release.genres && release.genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {release.genres.slice(0, 4).map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
          {release.genres.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{release.genres.length - 4}
            </Badge>
          )}
        </div>
      )}

      {platforms.length > 0 && (
        <PlatformBadgeList platforms={platforms} abbreviated />
      )}
    </div>
  );
}
