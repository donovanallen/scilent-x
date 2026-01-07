'use client';

import type { HarmonizedTrack } from '@scilent-one/harmony-engine';
import { Badge, Card, CardContent, cn } from '@scilent-one/ui';
import { Clock, ExternalLink, Music } from 'lucide-react';

import { ArtistCredit } from './artist-credit';

interface TrackCardProps {
  track: HarmonizedTrack;
  className?: string;
}

function formatDuration(ms?: number): string {
  if (!ms) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TrackCard({ track, className }: TrackCardProps) {
  const primarySource = track.sources[0];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20',
        className
      )}
    >
      {/* Track icon placeholder */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <Music className="size-12 text-muted-foreground/30" />
        {track.explicit && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-[10px] px-1 py-0"
          >
            E
          </Badge>
        )}
      </div>

      <CardContent className="p-3 space-y-1">
        <h4 className="font-medium text-sm line-clamp-1" title={track.title}>
          {track.title}
        </h4>

        <div className="text-xs text-muted-foreground line-clamp-1">
          <ArtistCredit artists={track.artists} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span className="font-mono">{formatDuration(track.duration)}</span>
          </div>

          <div className="flex items-center gap-1">
            {track.sources.slice(0, 2).map((source) => (
              <Badge
                key={source.provider}
                variant="outline"
                className="text-[10px] px-1 py-0 h-4 capitalize"
              >
                {source.provider.charAt(0).toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {track.isrc && (
          <div className="text-[10px] font-mono text-muted-foreground/70 pt-1">
            {track.isrc}
          </div>
        )}
      </CardContent>

      {/* Hover overlay with external link */}
      {primarySource?.url && (
        <a
          href={primarySource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <ExternalLink className="size-4" />
            View on {primarySource.provider}
          </div>
        </a>
      )}
    </Card>
  );
}
