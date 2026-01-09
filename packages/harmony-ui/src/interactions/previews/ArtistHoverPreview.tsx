'use client';

import * as React from 'react';
import { Badge, cn, Separator } from '@scilent-one/ui';
import { Calendar, Globe, User, Users, Music2 } from 'lucide-react';
import type { HarmonizedEntity } from '../types';
import type { HarmonizedArtist, ArtistType } from '../../types';
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

const artistTypeLabels: Record<ArtistType, string> = {
  person: 'Solo Artist',
  group: 'Group',
  orchestra: 'Orchestra',
  choir: 'Choir',
  character: 'Character',
  other: 'Artist',
};

const artistTypeIcons: Record<ArtistType, React.ElementType> = {
  person: User,
  group: Users,
  orchestra: Music2,
  choir: Music2,
  character: User,
  other: User,
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

  // Get artist type icon
  const ArtistIcon = artist.type
    ? (artistTypeIcons[artist.type] ?? User)
    : User;

  // Links only mode - streamlined platform links
  if (mode === 'links') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
            <ArtistIcon className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{artist.name}</p>
            {artist.disambiguation && (
              <p className="text-xs text-muted-foreground truncate">
                {artist.disambiguation}
              </p>
            )}
          </div>
        </div>
        {platforms.length > 0 && (
          <PlatformBadgeList platforms={platforms} colored className="pt-1" />
        )}
      </div>
    );
  }

  // Mini mode - compact preview with key details
  if (mode === 'mini') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Header with icon avatar */}
        <div className="flex gap-3">
          <div className="size-16 rounded-full bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center shrink-0 shadow-inner">
            <ArtistIcon className="size-7 text-primary" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2 justify-between">
              <p className="font-semibold leading-tight line-clamp-2">
                {artist.name}
              </p>
              {artist.type && (
                <Badge variant="secondary" className="">
                  {artistTypeLabels[artist.type] ?? artist.type}
                </Badge>
              )}
            </div>
            {artist.disambiguation && (
              <p className="text-sm text-muted-foreground truncate">
                {artist.disambiguation}
              </p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              {artist.country && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="size-4" />
                  {artist.country}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Genre tags */}
        {artist.genres && artist.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artist.genres.slice(0, 3).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-xs font-normal"
              >
                {genre}
              </Badge>
            ))}
            {artist.genres.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{artist.genres.length - 3} more
              </span>
            )}
          </div>
        )}

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
      {/* Header with large icon */}
      <div className="flex items-start gap-4">
        <div className="size-20 rounded-full bg-linear-to-br from-primary/25 via-primary/10 to-background flex items-center justify-center shrink-0 shadow-lg">
          <ArtistIcon className="size-9 text-primary" />
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h4 className="font-semibold text-lg leading-tight line-clamp-2">
            {artist.name}
          </h4>
          {artist.disambiguation && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {artist.disambiguation}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {artist.type && (
              <Badge variant="secondary" className="text-xs">
                {artistTypeLabels[artist.type] ?? artist.type}
              </Badge>
            )}
            {artist.country && (
              <Badge variant="outline" className="text-xs gap-1">
                <Globe className="size-3" />
                {artist.country}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Date information */}
      {(artist.beginDate || artist.endDate) && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {artist.beginDate && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {artist.type === 'person' ? 'Born' : 'Formed'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatPartialDate(artist.beginDate)}
              </span>
            </div>
          )}
          {artist.endDate && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {artist.type === 'person' ? 'Died' : 'Disbanded'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatPartialDate(artist.endDate)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Genre tags */}
      {artist.genres && artist.genres.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Genres
          </p>
          <div className="flex flex-wrap gap-1">
            {artist.genres.slice(0, 5).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="text-xs font-normal"
              >
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

      {/* Aliases */}
      {artist.aliases && artist.aliases.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Also known as
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {artist.aliases.slice(0, 4).join(', ')}
            {artist.aliases.length > 4 && (
              <span className="text-muted-foreground/70">
                {' '}
                +{artist.aliases.length - 4} more
              </span>
            )}
          </p>
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
