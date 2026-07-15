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
import { InteractiveWrapper } from '../../interactions/InteractiveWrapper';
import { User } from 'lucide-react';
import Image from 'next/image';

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
  /** Whether to enable interactive features (context menu, hover preview) */
  interactive?: boolean | undefined;
  /** Side to position the hover preview @default 'right' */
  previewSide: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment for the hover preview @default 'start' */
  previewAlign: 'start' | 'center' | 'end';
}

export function ArtistCard({
  artist,
  imageUrl,
  showGenres = true,
  onClick,
  interactive = false,
  previewSide,
  previewAlign,
  className,
  ...props
}: ArtistCardProps) {
  const handleClick = React.useCallback(() => {
    onClick?.(artist);
  }, [onClick, artist]);

  const genres = showGenres ? (artist.genres?.slice(0, 3) ?? []) : [];
  const hasExtraGenres =
    showGenres && !!artist.genres && artist.genres.length > 3;

  const card = (
    <Card
      className={cn(
        'h-full flex flex-col overflow-hidden cursor-pointer transition-[background-color,transform,box-shadow] duration-base ease-out hover:bg-accent/50 hover:-translate-y-0.5 hover:shadow-md',
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
      <div className="aspect-square relative overflow-hidden bg-muted shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artist.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <User className="size-16 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardHeader className="p-4 flex-1">
        <CardTitle className="truncate">{artist.name}</CardTitle>
        {artist.disambiguation && (
          <p className="text-muted-foreground truncate">
            {artist.disambiguation}
          </p>
        )}
      </CardHeader>

      {/* Always reserve the genre row so grid cards share a consistent height */}
      {showGenres && (
        <CardContent className="p-4 pt-0 mt-auto min-h-9">
          {(genres.length > 0 || hasExtraGenres) && (
            <div className="flex flex-wrap gap-1">
              {genres.map((genre: string) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {hasExtraGenres && (
                <Badge variant="outline" className="text-xs">
                  +{artist.genres!.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  if (interactive) {
    return (
      <InteractiveWrapper
        entityType="artist"
        entity={artist}
        previewSide={previewSide}
        previewAlign={previewAlign}
        className="block h-full"
      >
        {card}
      </InteractiveWrapper>
    );
  }

  return card;
}

export function ArtistCardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn('h-full flex flex-col overflow-hidden', className)}
      {...props}
    >
      <Skeleton className="aspect-square w-full shrink-0" />
      <CardHeader className="p-4 pb-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="p-4 pt-0 mt-auto min-h-9">
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}
