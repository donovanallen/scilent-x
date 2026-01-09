'use client';

import * as React from 'react';
import { Badge, cn, Separator } from '@scilent-one/ui';
import { Calendar, Disc, Music, Tag } from 'lucide-react';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedRelease } from '../../types';
import {
  formatPartialDate,
  formatArtistCredits,
  getFrontArtworkUrl,
} from '../../utils';
import { Artwork, PlatformBadgeList, ReleaseTypePill } from '../../components/common';

export interface AlbumHoverPreviewProps {
  /** The album/release entity */
  entity: HarmonizedEntity;
  /** Preview mode */
  mode?: 'mini' | 'full' | 'links';
  /** Additional class name */
  className?: string;
}

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

  // Links only mode - streamlined platform links
  if (mode === 'links') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-3">
          <Artwork
            src={artworkUrl}
            alt={release.title}
            size="sm"
            rounded="md"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{release.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {formatArtistCredits(release.artists)}
            </p>
          </div>
        </div>
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} colored className="pt-1" />
        )}
      </div>
    );
  }

  // Mini mode - compact preview with artwork and key details
  if (mode === 'mini') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Header with artwork */}
        <div className="flex gap-3">
          <Artwork
            src={artworkUrl}
            alt={release.title}
            size="lg"
            rounded="md"
            className="shadow-md"
          />
          <div className="min-w-0 flex-1 flex flex-col justify-center gap-1.5">
            <p className="font-semibold leading-tight line-clamp-2">{release.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {formatArtistCredits(release.artists)}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <ReleaseTypePill
                releaseType={release.releaseType}
                className="text-[10px] px-1.5 py-0"
              />
              {release.releaseDate?.year && (
                <span className="text-xs text-muted-foreground">
                  {release.releaseDate.year}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-2">
          {totalTracks > 0 && (
            <div className="flex items-center gap-1">
              <Music className="size-3" />
              <span>{totalTracks} track{totalTracks !== 1 ? 's' : ''}</span>
            </div>
          )}
          {release.labels && release.labels[0] && (
            <div className="flex items-center gap-1 truncate">
              <Tag className="size-3 shrink-0" />
              <span className="truncate">{release.labels[0].name}</span>
            </div>
          )}
        </div>

        {/* Platform badges */}
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} abbreviated maxVisible={4} />
        )}
      </div>
    );
  }

  // Full mode - detailed preview with all metadata
  return (
    <div className={cn('space-y-4', className)}>
      {/* Large artwork header */}
      <div className="relative">
        <Artwork
          src={artworkUrl}
          alt={release.title}
          className="w-full aspect-square shadow-lg"
          rounded="lg"
        />
        {/* Overlay with release type badge */}
        <div className="absolute bottom-2 left-2">
          <ReleaseTypePill
            releaseType={release.releaseType}
            className="text-xs backdrop-blur-sm bg-background/80"
          />
        </div>
      </div>

      {/* Title and artist */}
      <div className="space-y-1">
        <h4 className="font-semibold text-base leading-tight line-clamp-2">
          {release.title}
        </h4>
        <p className="text-sm text-muted-foreground">
          {formatArtistCredits(release.artists)}
        </p>
      </div>

      {/* Key metadata badges */}
      <div className="flex flex-wrap gap-1.5">
        {release.releaseDate?.year && (
          <Badge variant="outline" className="text-xs gap-1">
            <Calendar className="size-3" />
            {formatPartialDate(release.releaseDate)}
          </Badge>
        )}
        {totalTracks > 0 && (
          <Badge variant="outline" className="text-xs gap-1">
            <Music className="size-3" />
            {totalTracks} track{totalTracks !== 1 ? 's' : ''}
          </Badge>
        )}
        {release.media && release.media.length > 1 && (
          <Badge variant="outline" className="text-xs gap-1">
            <Disc className="size-3" />
            {release.media.length} disc{release.media.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Separator className="my-1" />

      {/* Detailed metadata grid */}
      <div className="space-y-2 text-sm">
        {release.labels && release.labels.length > 0 && release.labels[0] && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-muted-foreground shrink-0">Label</span>
            <span className="text-right truncate">{release.labels[0].name}</span>
          </div>
        )}
        {release.gtin && (
          <div className="flex justify-between items-center gap-2">
            <span className="text-muted-foreground">UPC</span>
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {release.gtin}
            </span>
          </div>
        )}
        {release.releaseCountry && (
          <div className="flex justify-between items-center gap-2">
            <span className="text-muted-foreground">Country</span>
            <span>{release.releaseCountry}</span>
          </div>
        )}
      </div>

      {/* Genre tags */}
      {release.genres && release.genres.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Genres
          </p>
          <div className="flex flex-wrap gap-1">
            {release.genres.slice(0, 4).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="text-xs font-normal"
              >
                {genre}
              </Badge>
            ))}
            {release.genres.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{release.genres.length - 4}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Platform links */}
      {platforms.length > 0 && (
        <div className="pt-1">
          <PlatformBadgeList platforms={platforms} colored maxVisible={5} />
        </div>
      )}
    </div>
  );
}
