'use client';

import * as React from 'react';
import { Badge, cn, Separator } from '@scilent-one/ui';
import { Calendar, Disc, Music, Tag } from 'lucide-react';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedRelease } from '../../types';
import { formatPartialDate, getFrontArtworkUrl } from '../../utils';
import {
  Artwork,
  PlatformBadgeList,
  ReleaseTypePill,
} from '../../components/common';
import { ArtistCredit } from '../../components/artist/ArtistCredit';

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
 * Styled to match AlbumCard component patterns.
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
    return (
      release.media?.reduce((acc, m) => acc + (m.tracks?.length ?? 0), 0) ?? 0
    );
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
            <p className="text-sm font-medium truncate">{release.title}</p>
            <ArtistCredit
              artists={release.artists}
              maxDisplay={2}
              className="text-xs text-muted-foreground truncate"
            />
          </div>
        </div>
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} colored className="pt-1" />
        )}
      </div>
    );
  }

  // Mini mode - compact preview with artwork and key details (matches AlbumCard layout)
  if (mode === 'mini') {
    return (
      <div className={cn('group space-y-3', className)}>
        {/* Header with artwork - mirrors AlbumCard structure */}
        <div className="flex gap-3">
          <Artwork
            src={artworkUrl}
            alt={release.title}
            size="lg"
            rounded="md"
            className="shadow-md ring-1 ring-border/50"
          />
          <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
            <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {release.title}
            </p>
            <ArtistCredit
              artists={release.artists}
              maxDisplay={2}
              className="text-sm text-muted-foreground line-clamp-1"
            />
            <div className="flex items-center gap-2">
              {release.releaseDate?.year && (
                <span className="text-xs text-muted-foreground">
                  {formatPartialDate(release.releaseDate)}
                </span>
              )}
              <ReleaseTypePill
                releaseType={release.releaseType}
                uppercase
                className="ml-auto text-[10px]"
              />
            </div>
          </div>
        </div>

        {/* Quick stats row - subtle metadata display */}
        {(totalTracks > 0 || (release.labels && release.labels[0])) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {totalTracks > 0 && (
              <div className="flex items-center gap-1.5">
                <Music className="size-3.5" />
                <span>
                  {totalTracks} track{totalTracks !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {totalTracks > 0 && release.labels && release.labels[0] && (
              <span className="text-muted-foreground/40">·</span>
            )}
            {release.labels && release.labels[0] && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Tag className="size-3.5 shrink-0" />
                <span className="truncate">{release.labels[0].name}</span>
              </div>
            )}
          </div>
        )}

        {/* Platform badges */}
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} maxVisible={4} />
        )}
      </div>
    );
  }

  // Full mode - detailed preview with all metadata
  return (
    <div className={cn('group space-y-4', className)}>
      {/* Large artwork header with overlay badge */}
      <div className="relative overflow-hidden rounded-lg ring-1 ring-border/50">
        <Artwork
          src={artworkUrl}
          alt={release.title}
          className="w-full aspect-square"
          rounded="none"
        />
        {/* Overlay with release type badge */}
        <div className="absolute bottom-2 left-2">
          <ReleaseTypePill
            releaseType={release.releaseType}
            uppercase
            className="text-[10px] backdrop-blur-sm bg-background/80 shadow-sm"
          />
        </div>
      </div>

      {/* Title and artist - matches card typography */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {release.title}
        </h4>
        <ArtistCredit
          artists={release.artists}
          maxDisplay={3}
          className="text-sm text-muted-foreground line-clamp-1"
        />
      </div>

      {/* Key metadata badges */}
      <div className="flex flex-wrap gap-1.5">
        {release.releaseDate?.year && (
          <Badge variant="outline" className="text-xs gap-1 font-normal">
            <Calendar className="size-3" />
            {formatPartialDate(release.releaseDate)}
          </Badge>
        )}
        {totalTracks > 0 && (
          <Badge variant="outline" className="text-xs gap-1 font-normal">
            <Music className="size-3" />
            {totalTracks} track{totalTracks !== 1 ? 's' : ''}
          </Badge>
        )}
        {release.media && release.media.length > 1 && (
          <Badge variant="outline" className="text-xs gap-1 font-normal">
            <Disc className="size-3" />
            {release.media.length} disc{release.media.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Detailed metadata grid */}
      <div className="space-y-2 text-sm">
        {release.labels && release.labels.length > 0 && release.labels[0] && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">Label</span>
            <span className="text-right truncate font-medium">
              {release.labels[0].name}
            </span>
          </div>
        )}
        {release.gtin && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground">UPC</span>
            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {release.gtin}
            </span>
          </div>
        )}
        {release.releaseCountry && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground">Country</span>
            <span className="font-medium">{release.releaseCountry}</span>
          </div>
        )}
      </div>

      {/* Genre tags - matches ArtistCard badge styling */}
      {release.genres && release.genres.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Genres
          </p>
          <div className="flex flex-wrap gap-1">
            {release.genres.slice(0, 4).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
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
