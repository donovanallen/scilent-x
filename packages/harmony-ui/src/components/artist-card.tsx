'use client';

import type { HarmonizedArtist } from '@scilent-one/harmony-engine';
import { Badge, Card, CardContent, cn } from '@scilent-one/ui';
import { ExternalLink, User } from 'lucide-react';

interface ArtistCardProps {
  artist: HarmonizedArtist;
  className?: string;
}

export function ArtistCard({ artist, className }: ArtistCardProps) {
  const primarySource = artist.sources[0];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20',
        className
      )}
    >
      {/* Artist avatar placeholder */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <User className="size-16 text-muted-foreground/30" />
        {artist.type && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-[10px] px-1.5 py-0 capitalize"
          >
            {artist.type}
          </Badge>
        )}
      </div>

      <CardContent className="p-3 space-y-1">
        <h4 className="font-medium text-sm line-clamp-1" title={artist.name}>
          {artist.name}
        </h4>

        {artist.country && (
          <div className="text-xs text-muted-foreground">{artist.country}</div>
        )}

        {artist.genres && artist.genres.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap pt-1">
            {artist.genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-[10px] px-1 py-0 h-4"
              >
                {genre}
              </Badge>
            ))}
            {artist.genres.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{artist.genres.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            {artist.sources.slice(0, 2).map((source) => (
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
