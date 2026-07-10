import { ArtistMerger } from '@scilent-one/harmony-engine';
import type { HarmonizedArtist } from '@scilent-one/harmony-engine';

const artistMerger = new ArtistMerger();

/**
 * Normalize an artist name for cross-provider de-duplication.
 * Falls back to lowercased trimmed name when nameNormalized is absent.
 */
export function normalizeArtistKey(artist: HarmonizedArtist): string {
  const normalized =
    artist.nameNormalized?.trim() ||
    artist.name.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized;
}

/**
 * Merge a list of HarmonizedArtist records, de-duplicating by normalized name
 * and combining provider-specific IDs/sources via ArtistMerger.
 */
export function aggregateFollowedArtists(
  artists: HarmonizedArtist[]
): HarmonizedArtist[] {
  if (artists.length === 0) {
    return [];
  }

  const groups = new Map<string, HarmonizedArtist[]>();

  for (const artist of artists) {
    const key = normalizeArtistKey(artist);
    const existing = groups.get(key);
    if (existing) {
      existing.push(artist);
    } else {
      groups.set(key, [artist]);
    }
  }

  const merged: HarmonizedArtist[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]!);
    } else {
      merged.push(artistMerger.merge(group));
    }
  }

  return merged.sort((a, b) =>
    (a.nameNormalized ?? a.name).localeCompare(
      b.nameNormalized ?? b.name,
      undefined,
      { sensitivity: 'base' }
    )
  );
}

/**
 * Incrementally merge newly fetched artists into an existing deduplicated list.
 * Used when paginating aggregate mode across multiple providers.
 */
export function mergeFollowedArtistPages(
  existing: HarmonizedArtist[],
  incoming: HarmonizedArtist[]
): HarmonizedArtist[] {
  if (incoming.length === 0) {
    return existing;
  }
  return aggregateFollowedArtists([...existing, ...incoming]);
}
