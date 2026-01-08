'use client';

import { Badge, cn } from '@scilent-one/ui';
import type { HarmonizedRelease } from '@scilent-one/harmony-engine';
import { Calendar, Disc, Music } from 'lucide-react';
import * as React from 'react';

import { Artwork } from './artwork';
import { ArtistCredit } from './artist-credit';
import { ReleaseTypePill } from './common';

export interface ReleaseListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  release: HarmonizedRelease;
  showProviders?: boolean;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function ReleaseListItem({
  release,
  showProviders = false,
  className,
  ...props
}: ReleaseListItemProps) {
  const artworkUrl = release.artwork?.find((a) => a.type === 'front')?.url;
  const year = release.releaseDate?.year;
  const trackCount = release.media.reduce((acc, m) => acc + m.tracks.length, 0);
  const totalDuration = release.media.reduce(
    (acc, m) =>
      acc + m.tracks.reduce((t, track) => t + (track.duration || 0), 0),
    0
  );
  const providers = release.sources.map((s) => s.provider);

  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-accent/50 cursor-pointer',
        className
      )}
      {...props}
    >
      <Artwork src={artworkUrl} alt={release.title} size="lg" rounded="md" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start gap-2">
          <h3 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
            {release.title}
          </h3>
          <ReleaseTypePill
            releaseType={release.releaseType}
            variant="outline"
            uppercase
            className="text-[10px] shrink-0"
          />
        </div>
        <ArtistCredit
          artists={release.artists}
          maxDisplay={3}
          className="text-sm truncate block"
        />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {year && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {year}
            </span>
          )}
          {trackCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Music className="size-3" />
              {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
            </span>
          )}
          {totalDuration > 0 && (
            <span className="inline-flex items-center gap-1">
              <Disc className="size-3" />
              {formatDuration(totalDuration)}
            </span>
          )}
        </div>
      </div>
      {showProviders && providers.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {providers.map((provider) => (
            <Badge key={provider} variant="secondary" className="text-[10px]">
              {provider}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
