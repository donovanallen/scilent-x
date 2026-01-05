import * as React from 'react';
import {
  cn,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from '@scilent-one/ui';
import type { HarmonizedArtist } from '../../types';

export interface ArtistCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onClick'
> {
  /** The harmonized artist data */
  artist: HarmonizedArtist;
  /** Optional image URL for the artist */
  imageUrl?: string | undefined;
  /** Whether to show genres */
  showGenres?: boolean | undefined;
  /** Callback when the artist is clicked */
  onClick?: ((artist: HarmonizedArtist) => void) | undefined;
}

export function ArtistCard({
  artist,
  imageUrl,
  showGenres = true,
  onClick,
  className,
  ...props
}: ArtistCardProps) {
  const handleClick = React.useCallback(() => {
    onClick?.(artist);
  }, [onClick, artist]);

  return (
    <Card
      className={cn(
        'overflow-hidden transition-colors cursor-pointer hover:bg-accent/50',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View ${artist.name}`}
      {...props}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={artist.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <svg
              className="h-1/3 w-1/3 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg truncate">{artist.name}</CardTitle>
        {artist.disambiguation && (
          <p className="text-sm text-muted-foreground truncate">
            {artist.disambiguation}
          </p>
        )}
      </CardHeader>

      {showGenres && artist.genres && artist.genres.length > 0 && (
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-1">
            {artist.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
            {artist.genres.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{artist.genres.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ArtistCardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      <Skeleton className="aspect-square w-full" />
      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}
