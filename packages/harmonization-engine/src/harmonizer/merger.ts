import type {
  HarmonizedRelease,
  HarmonizedArtist,
  HarmonizedTrack,
  ProviderSource,
  HarmonizedArtistCredit,
} from "../types/index.js";

/**
 * Merges multiple release results from different providers into a single harmonized release.
 * Uses priority-based conflict resolution where higher-priority providers take precedence.
 */
export class ReleaseMerger {
  merge(releases: HarmonizedRelease[]): HarmonizedRelease {
    if (releases.length === 0) {
      throw new Error("Cannot merge empty release array");
    }

    if (releases.length === 1) {
      return releases[0]!;
    }

    // Sort by confidence (descending), then by source priority
    const sorted = [...releases].sort((a, b) => b.confidence - a.confidence);
    const primary = sorted[0]!;

    // Collect all sources and external IDs
    const allSources = this.collectSources(releases);
    const allExternalIds = this.collectExternalIds(releases);

    // Merge artists from all sources
    const mergedArtists = this.mergeArtistCredits(
      releases.map((r) => r.artists)
    );

    // Merge genres (deduplicated)
    const allGenres = this.collectGenres(releases);

    // Calculate combined confidence
    const combinedConfidence = this.calculateConfidence(releases);

    return {
      ...primary,
      artists: mergedArtists,
      genres: allGenres.length > 0 ? allGenres : primary.genres,
      externalIds: allExternalIds,
      sources: allSources,
      confidence: combinedConfidence,
      mergedAt: new Date(),
    };
  }

  private collectSources(releases: HarmonizedRelease[]): ProviderSource[] {
    const seen = new Set<string>();
    const sources: ProviderSource[] = [];

    for (const release of releases) {
      for (const source of release.sources) {
        const key = `${source.provider}:${source.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          sources.push(source);
        }
      }
    }

    return sources;
  }

  private collectExternalIds(
    releases: HarmonizedRelease[]
  ): Record<string, string> {
    const externalIds: Record<string, string> = {};

    for (const release of releases) {
      for (const [provider, id] of Object.entries(release.externalIds)) {
        if (!externalIds[provider]) {
          externalIds[provider] = id;
        }
      }
    }

    return externalIds;
  }

  private mergeArtistCredits(
    artistLists: HarmonizedArtistCredit[][]
  ): HarmonizedArtistCredit[] {
    if (artistLists.length === 0) return [];

    // Use the first list as base, but merge external IDs from others
    const primary = artistLists[0]!;

    return primary.map((artist, index) => {
      const mergedExternalIds: Record<string, string> = {
        ...artist.externalIds,
      };

      // Look for matching artists in other lists
      for (const list of artistLists.slice(1)) {
        const match = list[index];
        if (match?.externalIds) {
          Object.assign(mergedExternalIds, match.externalIds);
        }
      }

      return {
        ...artist,
        externalIds:
          Object.keys(mergedExternalIds).length > 0
            ? mergedExternalIds
            : undefined,
      };
    });
  }

  private collectGenres(releases: HarmonizedRelease[]): string[] {
    const genreSet = new Set<string>();

    for (const release of releases) {
      for (const genre of release.genres ?? []) {
        genreSet.add(genre.toLowerCase());
      }
    }

    return Array.from(genreSet);
  }

  private calculateConfidence(releases: HarmonizedRelease[]): number {
    // Higher confidence when more sources agree
    const avgConfidence =
      releases.reduce((sum, r) => sum + r.confidence, 0) / releases.length;

    // Boost confidence slightly for multiple sources
    const sourceBonus = Math.min(0.1, (releases.length - 1) * 0.05);

    return Math.min(1, avgConfidence + sourceBonus);
  }
}

/**
 * Merges multiple artist results from different providers.
 */
export class ArtistMerger {
  merge(artists: HarmonizedArtist[]): HarmonizedArtist {
    if (artists.length === 0) {
      throw new Error("Cannot merge empty artist array");
    }

    if (artists.length === 1) {
      return artists[0]!;
    }

    const sorted = [...artists].sort((a, b) => b.confidence - a.confidence);
    const primary = sorted[0]!;

    const allSources = this.collectSources(artists);
    const allExternalIds = this.collectExternalIds(artists);
    const allAliases = this.collectAliases(artists);
    const allGenres = this.collectGenres(artists);

    return {
      ...primary,
      aliases: allAliases.length > 0 ? allAliases : primary.aliases,
      genres: allGenres.length > 0 ? allGenres : primary.genres,
      externalIds: allExternalIds,
      sources: allSources,
      confidence: this.calculateConfidence(artists),
      mergedAt: new Date(),
    };
  }

  private collectSources(artists: HarmonizedArtist[]): ProviderSource[] {
    const seen = new Set<string>();
    const sources: ProviderSource[] = [];

    for (const artist of artists) {
      for (const source of artist.sources) {
        const key = `${source.provider}:${source.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          sources.push(source);
        }
      }
    }

    return sources;
  }

  private collectExternalIds(
    artists: HarmonizedArtist[]
  ): Record<string, string> {
    const externalIds: Record<string, string> = {};

    for (const artist of artists) {
      for (const [provider, id] of Object.entries(artist.externalIds)) {
        if (!externalIds[provider]) {
          externalIds[provider] = id;
        }
      }
    }

    return externalIds;
  }

  private collectAliases(artists: HarmonizedArtist[]): string[] {
    const aliasSet = new Set<string>();

    for (const artist of artists) {
      for (const alias of artist.aliases ?? []) {
        aliasSet.add(alias);
      }
    }

    return Array.from(aliasSet);
  }

  private collectGenres(artists: HarmonizedArtist[]): string[] {
    const genreSet = new Set<string>();

    for (const artist of artists) {
      for (const genre of artist.genres ?? []) {
        genreSet.add(genre.toLowerCase());
      }
    }

    return Array.from(genreSet);
  }

  private calculateConfidence(artists: HarmonizedArtist[]): number {
    const avgConfidence =
      artists.reduce((sum, a) => sum + a.confidence, 0) / artists.length;
    const sourceBonus = Math.min(0.1, (artists.length - 1) * 0.05);
    return Math.min(1, avgConfidence + sourceBonus);
  }
}

/**
 * Merges multiple track results from different providers.
 */
export class TrackMerger {
  merge(tracks: HarmonizedTrack[]): HarmonizedTrack {
    if (tracks.length === 0) {
      throw new Error("Cannot merge empty track array");
    }

    if (tracks.length === 1) {
      return tracks[0]!;
    }

    // Use first track as primary
    const primary = tracks[0]!;

    const allSources = this.collectSources(tracks);
    const allExternalIds = this.collectExternalIds(tracks);

    return {
      ...primary,
      externalIds: allExternalIds,
      sources: allSources,
    };
  }

  private collectSources(tracks: HarmonizedTrack[]): ProviderSource[] {
    const seen = new Set<string>();
    const sources: ProviderSource[] = [];

    for (const track of tracks) {
      for (const source of track.sources) {
        const key = `${source.provider}:${source.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          sources.push(source);
        }
      }
    }

    return sources;
  }

  private collectExternalIds(
    tracks: HarmonizedTrack[]
  ): Record<string, string> {
    const externalIds: Record<string, string> = {};

    for (const track of tracks) {
      for (const [provider, id] of Object.entries(track.externalIds)) {
        if (!externalIds[provider]) {
          externalIds[provider] = id;
        }
      }
    }

    return externalIds;
  }
}
