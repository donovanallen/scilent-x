import * as React from "react";
import {
  cn,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from "@scilent-one/ui";
import type { HarmonizedRelease } from "../../types";
import { formatPartialDate, formatArtistCredits, getFrontArtworkUrl } from "../../utils";

export interface AlbumCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** The harmonized release data */
  release: HarmonizedRelease;
  /** Optional artwork URL (overrides release artwork) */
  artworkUrl?: string | undefined;
  /** Whether to show release year */
  showYear?: boolean | undefined;
  /** Whether to show release type badge */
  showType?: boolean | undefined;
  /** Callback when the album is clicked */
  onClick?: ((release: HarmonizedRelease) => void) | undefined;
}

const releaseTypeLabels: Record<string, string> = {
  album: "Album",
  single: "Single",
  ep: "EP",
  compilation: "Compilation",
  soundtrack: "Soundtrack",
  live: "Live",
  remix: "Remix",
  other: "Release",
};

export function AlbumCard({
  release,
  artworkUrl,
  showYear = true,
  showType = true,
  onClick,
  className,
  ...props
}: AlbumCardProps) {
  const handleClick = React.useCallback(() => {
    onClick?.(release);
  }, [onClick, release]);

  const imageUrl = artworkUrl ?? getFrontArtworkUrl(release.artwork);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors cursor-pointer hover:bg-accent/50 group",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      {...props}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={release.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
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
        {showType && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 left-2 text-xs"
          >
            {releaseTypeLabels[release.releaseType] || release.releaseType}
          </Badge>
        )}
      </div>

      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-medium truncate">
          {release.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <p className="text-xs text-muted-foreground truncate">
          {formatArtistCredits(release.artists)}
        </p>
        {showYear && release.releaseDate?.year && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatPartialDate(release.releaseDate)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AlbumCardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <Skeleton className="aspect-square w-full" />
      <CardHeader className="p-3 pb-1">
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-1">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-12" />
      </CardContent>
    </Card>
  );
}
