import * as React from "react";
import {
  cn,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Skeleton,
} from "@scilent-one/ui";
import type { HarmonizedTrack } from "../../types";
import {
  formatDuration,
  formatArtistCredits,
  formatTrackPosition,
} from "../../utils";
import { TrackArtwork } from "./TrackArtwork";

export interface TrackDetailsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The harmonized track data */
  track: HarmonizedTrack;
  /** Optional artwork URL */
  artworkUrl?: string | undefined;
  /** Whether to show source information */
  showSources?: boolean | undefined;
  /** Whether to show credits */
  showCredits?: boolean | undefined;
}

export function TrackDetails({
  track,
  artworkUrl,
  showSources = false,
  showCredits = true,
  className,
  ...props
}: TrackDetailsProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <TrackArtwork src={artworkUrl} alt={track.title} size="lg" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="truncate">{track.title}</CardTitle>
            {track.explicit && <Badge variant="outline">Explicit</Badge>}
          </div>
          <p className="text-muted-foreground">
            {formatArtistCredits(track.artists)}
          </p>
          {track.disambiguation && (
            <p className="text-sm text-muted-foreground italic">
              {track.disambiguation}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Track</span>
            <p className="font-medium">
              {formatTrackPosition(track.position, track.discNumber)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Duration</span>
            <p className="font-medium">{formatDuration(track.duration)}</p>
          </div>
          {track.isrc && (
            <div>
              <span className="text-muted-foreground">ISRC</span>
              <p className="font-mono text-xs">{track.isrc}</p>
            </div>
          )}
        </div>

        {showCredits && track.credits && track.credits.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Credits</h4>
              <div className="grid gap-1.5 text-sm">
                {track.credits.map((credit, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground">{credit.role}</span>
                    <span>{credit.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {showSources && track.sources.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sources</h4>
              <div className="flex flex-wrap gap-1">
                {track.sources.map((source, idx) => (
                  <Badge key={idx} variant="secondary">
                    {source.provider}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function TrackDetailsSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Skeleton className="h-16 w-16 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
