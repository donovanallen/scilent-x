import * as React from "react";
import { cn, Badge } from "@scilent-one/ui";

export type PlatformName =
  | "spotify"
  | "apple_music"
  | "musicbrainz"
  | "discogs"
  | "deezer"
  | "tidal"
  | "amazon_music"
  | "youtube_music"
  | "soundcloud"
  | "bandcamp"
  | string;

export interface PlatformBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "children"> {
  /** The platform/provider name */
  platform: PlatformName;
  /** Whether to show the full platform name or abbreviation */
  abbreviated?: boolean | undefined;
  /** Whether to show a colored background based on platform */
  colored?: boolean | undefined;
}

const platformLabels: Record<string, { full: string; short: string }> = {
  spotify: { full: "Spotify", short: "SP" },
  apple_music: { full: "Apple Music", short: "AM" },
  musicbrainz: { full: "MusicBrainz", short: "MB" },
  discogs: { full: "Discogs", short: "DC" },
  deezer: { full: "Deezer", short: "DZ" },
  tidal: { full: "Tidal", short: "TD" },
  amazon_music: { full: "Amazon Music", short: "AZ" },
  youtube_music: { full: "YouTube Music", short: "YT" },
  soundcloud: { full: "SoundCloud", short: "SC" },
  bandcamp: { full: "Bandcamp", short: "BC" },
};

const platformColors: Record<string, string> = {
  spotify: "bg-[#1DB954] text-white hover:bg-[#1DB954]/90",
  apple_music: "bg-[#FA243C] text-white hover:bg-[#FA243C]/90",
  musicbrainz: "bg-[#BA478F] text-white hover:bg-[#BA478F]/90",
  discogs: "bg-[#333333] text-white hover:bg-[#333333]/90",
  deezer: "bg-[#FEAA2D] text-black hover:bg-[#FEAA2D]/90",
  tidal: "bg-[#000000] text-white hover:bg-[#000000]/90",
  amazon_music: "bg-[#00A8E1] text-white hover:bg-[#00A8E1]/90",
  youtube_music: "bg-[#FF0000] text-white hover:bg-[#FF0000]/90",
  soundcloud: "bg-[#FF5500] text-white hover:bg-[#FF5500]/90",
  bandcamp: "bg-[#629AA9] text-white hover:bg-[#629AA9]/90",
};

export function PlatformBadge({
  platform,
  abbreviated = false,
  colored = false,
  variant = "secondary",
  className,
  ...props
}: PlatformBadgeProps) {
  const normalizedPlatform = platform.toLowerCase().replace(/[\s-]/g, "_");
  const labels = platformLabels[normalizedPlatform] || {
    full: platform,
    short: platform.slice(0, 2).toUpperCase(),
  };

  const label = abbreviated ? labels.short : labels.full;
  const colorClass = colored ? platformColors[normalizedPlatform] : undefined;

  return (
    <Badge
      variant={colored ? "default" : variant}
      className={cn(colorClass, className)}
      {...props}
    >
      {label}
    </Badge>
  );
}

export interface PlatformBadgeListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of platform names to display */
  platforms: PlatformName[];
  /** Whether to show abbreviated names */
  abbreviated?: boolean | undefined;
  /** Whether to show colored backgrounds */
  colored?: boolean | undefined;
  /** Maximum number of badges to show before "+N more" */
  maxVisible?: number | undefined;
}

export function PlatformBadgeList({
  platforms,
  abbreviated = false,
  colored = false,
  maxVisible,
  className,
  ...props
}: PlatformBadgeListProps) {
  const visiblePlatforms =
    maxVisible && platforms.length > maxVisible
      ? platforms.slice(0, maxVisible)
      : platforms;
  const hiddenCount =
    maxVisible && platforms.length > maxVisible
      ? platforms.length - maxVisible
      : 0;

  return (
    <div className={cn("flex flex-wrap gap-1", className)} {...props}>
      {visiblePlatforms.map((platform) => (
        <PlatformBadge
          key={platform}
          platform={platform}
          abbreviated={abbreviated}
          colored={colored}
        />
      ))}
      {hiddenCount > 0 && (
        <Badge variant="outline">+{hiddenCount}</Badge>
      )}
    </div>
  );
}
