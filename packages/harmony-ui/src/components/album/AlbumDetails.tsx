import * as React from "react";
import { cn, Badge, Separator, Skeleton } from "@scilent-one/ui";
import type { HarmonizedRelease } from "../../types";
import {
  formatPartialDate,
  formatArtistCredits,
  getFrontArtworkUrl,
} from "../../utils";

export interface AlbumDetailsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The harmonized release data */
  release: HarmonizedRelease;
  /** Optional artwork URL (overrides release artwork) */
  artworkUrl?: string;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether to show genres/tags */
  showGenres?: boolean;
  /** Whether to show sources */
  showSources?: boolean;
  /** Whether to show confidence score */
  showConfidence?: boolean;
}

const releaseTypeLabels: Record<string, string> = {
  album: "Album",
  single: "Single",
  ep: "EP",
  compilation: "Compilation",
  soundtrack: "Soundtrack",
  live: "Live Album",
  remix: "Remix Album",
  other: "Release",
};

const statusLabels: Record<string, string> = {
  official: "Official",
  promotional: "Promotional",
  bootleg: "Bootleg",
  "pseudo-release": "Pseudo-release",
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
    (sum, medium) => sum + medium.tracks.length,
    0
  );

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Album Artwork */}
        <div className="shrink-0">
          <div className="h-64 w-64 rounded-lg overflow-hidden bg-muted shadow-lg">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={release.title}
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
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Album Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              {releaseTypeLabels[release.releaseType] || release.releaseType}
            </p>
            <h1 className="text-4xl font-bold tracking-tight">{release.title}</h1>
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
              {trackCount} {trackCount === 1 ? "track" : "tracks"}
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
              {release.genres.map((genre) => (
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
            <h3 className="text-sm font-medium text-muted-foreground">
              Label{release.labels.length > 1 ? "s" : ""}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              {release.labels.map((label, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-medium">{label.name}</span>
                  {label.catalogNumber && (
                    <span className="text-muted-foreground font-mono text-xs">
                      {label.catalogNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showSources && release.sources.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Sources
            </h3>
            <div className="flex flex-wrap gap-2">
              {release.sources.map((source, idx) => (
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
            <h3 className="text-sm font-medium text-muted-foreground">
              Barcode (GTIN)
            </h3>
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
    <div className={cn("space-y-6", className)} {...props}>
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-64 w-64 rounded-lg shrink-0" />
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
