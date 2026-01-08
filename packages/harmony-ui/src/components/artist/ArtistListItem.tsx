'use client';

import type { HarmonizedArtist } from '@scilent-one/harmony-engine';
import { Badge, cn } from '@scilent-one/ui';
import { ExternalLink, User } from 'lucide-react';

export interface ArtistListItemProps {
  artist: HarmonizedArtist;
  showProviders?: boolean;
  className?: string;
}

export function ArtistListItem({
  artist,
  showProviders,
  className,
}: ArtistListItemProps) {
  const primarySource = artist.sources[0];

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group',
        className
      )}
    >
      {/* Artist avatar placeholder */}
      <div className="size-14 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
        <User className="size-6 text-muted-foreground/50" />
      </div>

      {/* Artist info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{artist.name}</h4>
          {artist.type && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 capitalize"
            >
              {artist.type}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {artist.country && <span>{artist.country}</span>}
          {artist.disambiguation && (
            <>
              {artist.country && (
                <span className="text-muted-foreground/50">·</span>
              )}
              <span className="truncate">{artist.disambiguation}</span>
            </>
          )}
        </div>
        {artist.genres && artist.genres.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {artist.genres.slice(0, 3).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {genre}
              </Badge>
            ))}
            {artist.genres.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{artist.genres.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Providers */}
      {showProviders && (
        <div className="flex items-center gap-1">
          {artist.sources.map((source) => (
            <Badge
              key={source.provider}
              variant="secondary"
              className="text-xs capitalize"
            >
              {source.provider}
            </Badge>
          ))}
        </div>
      )}

      {/* External link */}
      {primarySource?.url && (
        <a
          href={primarySource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-4 text-muted-foreground" />
        </a>
      )}
    </div>
  );
}
