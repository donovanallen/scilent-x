import type { PartialDate, HarmonizedArtistCredit } from "../types";

/**
 * Format duration from milliseconds to a human-readable string (MM:SS or HH:MM:SS)
 */
export function formatDuration(ms: number | undefined): string {
  if (!ms) return "--:--";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format a partial date to a human-readable string
 */
export function formatPartialDate(date: PartialDate | undefined): string {
  if (!date) return "";

  const parts: string[] = [];

  if (date.year) {
    parts.push(date.year.toString());
  }

  if (date.month) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    parts.unshift(monthNames[date.month - 1] || "");
  }

  if (date.day) {
    parts.splice(1, 0, date.day.toString());
  }

  return parts.filter(Boolean).join(" ");
}

/**
 * Format artist credits to a displayable string
 */
export function formatArtistCredits(
  credits: HarmonizedArtistCredit[]
): string {
  return credits
    .map((credit, index) => {
      const name = credit.creditedName || credit.name;
      const joinPhrase = credit.joinPhrase ?? (index < credits.length - 1 ? ", " : "");
      return name + joinPhrase;
    })
    .join("");
}

/**
 * Get the primary artist name from credits
 */
export function getPrimaryArtistName(
  credits: HarmonizedArtistCredit[]
): string {
  const first = credits[0];
  if (!first) return "Unknown Artist";
  return first.creditedName || first.name;
}

/**
 * Format artist credits to a simple comma-separated list of names
 * (simpler version of formatArtistCredits without join phrases)
 */
export function formatArtistNames(
  credits: HarmonizedArtistCredit[]
): string {
  return credits
    .map((credit) => credit.creditedName || credit.name)
    .join(", ");
}

/**
 * Format track position with optional disc number
 */
export function formatTrackPosition(
  position: number | undefined,
  discNumber?: number
): string {
  if (position === undefined || position === null) {
    return '-';
  }
  if (discNumber && discNumber > 1) {
    return `${discNumber}.${position}`;
  }
  return position.toString();
}

/**
 * Get the front artwork URL from a release
 */
export function getFrontArtworkUrl(
  artwork: Array<{ url: string; type: string }> | undefined
): string | undefined {
  if (!artwork || artwork.length === 0) return undefined;

  const front = artwork.find((a) => a.type === "front");
  const firstArtwork = artwork[0];
  return front?.url ?? firstArtwork?.url;
}

/**
 * Platform display names mapping
 */
const platformDisplayNames: Record<string, string> = {
  spotify: 'Spotify',
  musicbrainz: 'MusicBrainz',
  tidal: 'Tidal',
  apple: 'Apple Music',
  apple_music: 'Apple Music',
  deezer: 'Deezer',
  youtube: 'YouTube Music',
  youtube_music: 'YouTube Music',
  amazon_music: 'Amazon Music',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  discogs: 'Discogs',
};

/**
 * Format a platform/provider name for display
 */
export function formatPlatformName(platform: string): string {
  return platformDisplayNames[platform.toLowerCase()] ?? platform;
}
