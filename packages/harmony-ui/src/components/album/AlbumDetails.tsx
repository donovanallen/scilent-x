import * as React from 'react';
import { cn, Badge, Separator, Skeleton } from '@scilent-one/ui';
import type { HarmonizedRelease, HarmonizedTrack } from '../../types';
import {
  formatPartialDate,
  formatArtistCredits,
  getFrontArtworkUrl,
} from '../../utils';
import { AlbumArtwork, AlbumArtworkSkeleton } from './AlbumArtwork';
import { getReleaseTypeLabel } from '../common';
import type { ProviderSource } from '@scilent-one/harmony-engine';

export interface AlbumDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The harmonized release data */
  release: HarmonizedRelease;
  /** Optional artwork URL (overrides release artwork) */
  artworkUrl?: string | undefined;
  /** Whether to show labels */
  showLabels?: boolean | undefined;
  /** Whether to show genres/tags */
  showGenres?: boolean | undefined;
  /** Whether to show sources */
  showSources?: boolean | undefined;
  /** Whether to show confidence score */
  showConfidence?: boolean | undefined;
}

const statusLabels: Record<string, string> = {
  official: 'Official',
  promotional: 'Promotional',
  bootleg: 'Bootleg',
  'pseudo-release': 'Pseudo-release',
};

export function AlbumDetails({
  release,
  artworkUrl,
  showLabels = true,
  showGenres = true,
  showSources = false,
  showConfidence = false,
  className,
  ...props
}: AlbumDetailsProps) {
  const imageUrl = artworkUrl ?? getFrontArtworkUrl(release.artwork);

  const trackCount = release.media.reduce(
    (sum: number, medium: { tracks: HarmonizedTrack[] }) =>
      sum + medium.tracks.length,
    0
  );

  return (
    <div className={cn('space-y-6', className)} {...props}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Album Artwork */}
        <AlbumArtwork
          src={imageUrl}
          alt={release.title}
          size="2xl"
          rounded="lg"
          shadow
        />

        {/* Album Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              {getReleaseTypeLabel(release.releaseType)}
            </p>
            <h1 className="text-4xl font-bold tracking-tight">
              {release.title}
            </h1>
            {release.disambiguation && (
              <p className="text-lg text-muted-foreground">
                {release.disambiguation}
              </p>
            )}
            <p className="text-lg">{formatArtistCredits(release.artists)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {release.releaseDate && (
              <span>{formatPartialDate(release.releaseDate)}</span>
            )}
            <span>
              {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
            </span>
            {release.status && (
              <Badge variant="outline">
                {statusLabels[release.status] || release.status}
              </Badge>
            )}
            {showConfidence && (
              <Badge variant="secondary">
                {Math.round(release.confidence * 100)}% confidence
              </Badge>
            )}
          </div>

          {showGenres && release.genres && release.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {release.genres.map((genre: string) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {showLabels && release.labels && release.labels.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Label{release.labels.length > 1 ? 's' : ''}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              {release.labels.map(
                (label: (typeof release.labels)[number], idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-medium">{label.name}</span>
                    {label.catalogNumber && (
                      <span className="text-muted-foreground font-mono text-xs">
                        {label.catalogNumber}
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {showSources && release.sources.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Sources
            </h2>
            <div className="flex flex-wrap gap-2">
              {release.sources.map((source: ProviderSource, idx: number) => (
                <Badge key={idx} variant="outline">
                  {source.provider}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {release.gtin && (
        <>
          <Separator />
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              Barcode (GTIN)
            </h2>
            <p className="font-mono text-sm">{release.gtin}</p>
          </div>
        </>
      )}
    </div>
  );
}

export function AlbumDetailsSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      <div className="flex flex-col md:flex-row gap-6">
        <AlbumArtworkSkeleton size="2xl" rounded="lg" />
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
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
