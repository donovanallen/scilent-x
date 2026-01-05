'use client';

import { Badge, Card, cn } from '@scilent-one/ui';
import type { HarmonizedRelease } from '@scilent-one/harmonization-engine';
import * as React from 'react';

import { Artwork } from './artwork';
import { ArtistCredit } from './artist-credit';

export interface ReleaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  release: HarmonizedRelease;
  showType?: boolean;
  showYear?: boolean;
}

export function ReleaseCard({
  release,
  showType = true,
  showYear = true,
  className,
  ...props
}: ReleaseCardProps) {
  const artworkUrl = release.artwork?.find((a) => a.type === 'front')?.url;
  const year = release.releaseDate?.year;
  const trackCount = release.media.reduce((acc, m) => acc + m.tracks.length, 0);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:bg-accent/50 cursor-pointer',
        className
      )}
      {...props}
    >
      <div className="p-3">
        <div className="relative mb-3">
          <Artwork
            src={artworkUrl}
            alt={release.title}
            size="xl"
            rounded="md"
            className="w-full aspect-square"
          />
          {showType && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wider opacity-90"
            >
              {release.releaseType}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {release.title}
          </h3>
          <ArtistCredit
            artists={release.artists}
            maxDisplay={2}
            className="text-xs line-clamp-1"
          />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {showYear && year && <span>{year}</span>}
            {showYear && year && trackCount > 0 && <span>·</span>}
            {trackCount > 0 && (
              <span>
                {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
