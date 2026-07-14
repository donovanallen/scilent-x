import type { HarmonizedRelease } from '../types/harmonized.types';

const CAA_BASE = 'https://coverartarchive.org';

/**
 * Build a Cover Art Archive front-cover URL from a MusicBrainz release MBID.
 */
export function getCoverArtArchiveUrl(releaseMbid: string): string {
  return `${CAA_BASE}/release/${releaseMbid}/front-500`;
}

/**
 * Fetch Cover Art Archive front artwork URL for a release MBID.
 * Returns null when no front cover exists.
 */
export async function fetchCoverArtArchiveUrl(
  releaseMbid: string
): Promise<string | null> {
  try {
    const response = await fetch(`${CAA_BASE}/release/${releaseMbid}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      images?: Array<{
        front?: boolean;
        thumbnails?: { small?: string; large?: string };
      }>;
    };

    const front = data.images?.find((img) => img.front);
    if (!front?.thumbnails) return null;

    return front.thumbnails.large ?? front.thumbnails.small ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the best front artwork URL from harmonized artwork array.
 */
export function getHarmonizedArtworkUrl(
  artwork: Array<{ url: string; type: string }> | undefined
): string | undefined {
  if (!artwork?.length) return undefined;
  const front = artwork.find((a) => a.type === 'front');
  return front?.url ?? artwork[0]?.url;
}

/**
 * Get the best (largest available) image URL from a harmonized artist's
 * images array. Prefers the image with the greatest pixel area, falling back
 * to the first entry when dimensions are unknown.
 */
export function getArtistImageUrl(
  images:
    | Array<{
        url: string;
        width?: number | undefined;
        height?: number | undefined;
      }>
    | undefined
): string | undefined {
  if (!images?.length) return undefined;

  let best = images[0];
  let bestArea = (best?.width ?? 0) * (best?.height ?? 0);

  for (let i = 1; i < images.length; i++) {
    const image = images[i]!;
    const area = (image.width ?? 0) * (image.height ?? 0);
    if (area > bestArea) {
      best = image;
      bestArea = area;
    }
  }

  return best?.url;
}

export interface ArtworkResolveInput {
  artwork?: Array<{ url: string; type: string }>;
  musicbrainzReleaseMbid?: string;
}

/**
 * Resolve artwork with fallback chain:
 * harmonized front → Cover Art Archive → undefined
 */
export async function resolveArtworkUrl(
  input: ArtworkResolveInput
): Promise<string | undefined> {
  const fromHarmonized = getHarmonizedArtworkUrl(input.artwork);
  if (fromHarmonized) return fromHarmonized;

  if (input.musicbrainzReleaseMbid) {
    const caa = await fetchCoverArtArchiveUrl(input.musicbrainzReleaseMbid);
    if (caa) return caa;
  }

  return undefined;
}

/**
 * Extract MusicBrainz release MBID from a harmonized release.
 */
export function getMusicBrainzReleaseMbid(
  release: Pick<HarmonizedRelease, 'externalIds'>
): string | undefined {
  return release.externalIds?.musicbrainz;
}
