import * as React from 'react';
import { cn, Badge, Skeleton, Separator } from '@scilent-one/ui';
import type { HarmonizedArtist } from '../../types';
import { formatPartialDate } from '../../utils';

export interface ArtistHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The harmonized artist data */
  artist: HarmonizedArtist;
  /** Optional image URL for the artist */
  imageUrl?: string;
  /** Whether to show metadata (type, country, dates) */
  showMetadata?: boolean;
  /** Whether to show genres */
  showGenres?: boolean;
  /** Whether to show confidence score */
  showConfidence?: boolean;
}

export function ArtistHeader({
  artist,
  imageUrl,
  showMetadata = true,
  showGenres = true,
  showConfidence = false,
  className,
  ...props
}: ArtistHeaderProps) {
  const typeLabels: Record<string, string> = {
    person: 'Solo Artist',
    group: 'Band/Group',
    orchestra: 'Orchestra',
    choir: 'Choir',
    character: 'Character',
    other: 'Artist',
  };

  return (
    <div className={cn('space-y-6', className)} {...props}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Artist Image */}
        <div className="shrink-0">
          <div className="h-48 w-48 rounded-full overflow-hidden bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={artist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <svg
                  className="h-1/3 w-1/3 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
        </div>

        {/* Artist Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            {artist.type && (
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {typeLabels[artist.type] || artist.type}
              </p>
            )}
            <h1 className="text-4xl font-bold tracking-tight">{artist.name}</h1>
            {artist.disambiguation && (
              <p className="text-lg text-muted-foreground">
                {artist.disambiguation}
              </p>
            )}
          </div>

          {showMetadata && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {artist.country && (
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {artist.country}
                </span>
              )}
              {artist.beginDate && (
                <span>Active since {formatPartialDate(artist.beginDate)}</span>
              )}
              {artist.endDate && (
                <span>Ended {formatPartialDate(artist.endDate)}</span>
              )}
              {showConfidence && (
                <Badge variant="outline">
                  {Math.round(artist.confidence * 100)}% confidence
                </Badge>
              )}
            </div>
          )}

          {showGenres && artist.genres && artist.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artist.genres.map((genre: string) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {artist.aliases && artist.aliases.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Also known as
            </h2>
            <div className="flex flex-wrap gap-2">
              {artist.aliases.map((alias: string) => (
                <Badge key={alias} variant="outline">
                  {alias}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ArtistHeaderSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-48 w-48 rounded-full shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
