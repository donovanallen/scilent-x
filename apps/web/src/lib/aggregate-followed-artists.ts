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
 * Stable identity string for a followed artist (sorted provider:id pairs).
 * Useful for React keys and shared-ID grouping.
 */
export function artistIdentityKey(artist: HarmonizedArtist): string {
  const fromExternalIds = Object.entries(artist.externalIds)
    .filter(([, id]) => Boolean(id))
    .map(([provider, id]) => `${provider}:${id}`)
    .sort();

  if (fromExternalIds.length > 0) {
    return fromExternalIds.join('|');
  }

  const fromSources = (artist.sources ?? [])
    .filter((s) => Boolean(s.id))
    .map((s) => `${s.provider}:${s.id}`)
    .sort();

  if (fromSources.length > 0) {
    return fromSources.join('|');
  }

  return `name:${normalizeArtistKey(artist)}`;
}

/**
 * Merge a list of HarmonizedArtist records, de-duplicating by normalized name
 * or any shared provider external ID, combining IDs/sources via ArtistMerger.
 */
export function aggregateFollowedArtists(
  artists: HarmonizedArtist[]
): HarmonizedArtist[] {
  if (artists.length === 0) {
    return [];
  }

  // Union-Find so same name OR shared provider:id collapses to one artist.
  const parent = artists.map((_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) {
      root = parent[root]!;
    }
    let curr = i;
    while (parent[curr] !== curr) {
      const next = parent[curr]!;
      parent[curr] = root;
      curr = next;
    }
    return root;
  };

  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[rb] = ra;
    }
  };

  const nameToIndex = new Map<string, number>();
  const externalIdToIndex = new Map<string, number>();

  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i]!;
    const nameKey = normalizeArtistKey(artist);
    const existingByName = nameToIndex.get(nameKey);
    if (existingByName !== undefined) {
      union(existingByName, i);
    } else {
      nameToIndex.set(nameKey, i);
    }

    for (const [provider, id] of Object.entries(artist.externalIds)) {
      if (!id) continue;
      const extKey = `${provider}:${id}`;
      const existingById = externalIdToIndex.get(extKey);
      if (existingById !== undefined) {
        union(existingById, i);
      } else {
        externalIdToIndex.set(extKey, i);
      }
    }
  }

  const groups = new Map<number, HarmonizedArtist[]>();
  for (let i = 0; i < artists.length; i++) {
    const root = find(i);
    const group = groups.get(root);
    if (group) {
      group.push(artists[i]!);
    } else {
      groups.set(root, [artists[i]!]);
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
