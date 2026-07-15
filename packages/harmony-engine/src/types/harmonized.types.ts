import { z } from 'zod';

export const ProviderSourceSchema = z.object({
  provider: z.string(),
  id: z.string(),
  url: z.string().url().optional(),
  fetchedAt: z.coerce.date(),
  snapshotId: z.string().optional(),
});

export type ProviderSource = z.infer<typeof ProviderSourceSchema>;

export const HarmonizedArtistCreditSchema = z.object({
  name: z.string(),
  creditedName: z.string().optional(),
  joinPhrase: z.string().optional(),
  roles: z.array(z.string()).optional(),
  externalIds: z.record(z.string(), z.string()).optional(),
});

export type HarmonizedArtistCredit = z.infer<
  typeof HarmonizedArtistCreditSchema
>;

export const ArtworkTypeSchema = z.enum([
  'front',
  'back',
  'medium',
  'booklet',
  'other',
]);

export type ArtworkType = z.infer<typeof ArtworkTypeSchema>;

export const ArtworkSchema = z.object({
  url: z.string().url(),
  type: ArtworkTypeSchema,
  width: z.number().optional(),
  height: z.number().optional(),
  provider: z.string(),
});

export type Artwork = z.infer<typeof ArtworkSchema>;

export const HarmonizedTrackSchema = z.object({
  isrc: z.string().optional(),
  title: z.string(),
  titleNormalized: z.string().optional(),
  disambiguation: z.string().optional(),
  position: z.number().int().positive(),
  discNumber: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  artists: z.array(HarmonizedArtistCreditSchema),
  credits: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
      })
    )
    .optional(),
  explicit: z.boolean().optional(),
  // Artwork is typically inherited from the track's parent release.
  artwork: z.array(ArtworkSchema).optional(),
  externalIds: z.record(z.string(), z.string()),
  sources: z.array(ProviderSourceSchema),
});

export type HarmonizedTrack = z.infer<typeof HarmonizedTrackSchema>;

export const ReleaseTypeSchema = z.enum([
  'album',
  'single',
  'ep',
  'compilation',
  'soundtrack',
  'live',
  'remix',
  'other',
]);

export type ReleaseType = z.infer<typeof ReleaseTypeSchema>;

export const ReleaseStatusSchema = z.enum([
  'official',
  'promotional',
  'bootleg',
  'pseudo-release',
]);

export type ReleaseStatus = z.infer<typeof ReleaseStatusSchema>;

export const PartialDateSchema = z.object({
  year: z.number().optional(),
  month: z.number().optional(),
  day: z.number().optional(),
});

export type PartialDate = z.infer<typeof PartialDateSchema>;

export const HarmonizedReleaseSchema = z.object({
  gtin: z.string().optional(),
  title: z.string(),
  titleNormalized: z.string().optional(),
  disambiguation: z.string().optional(),

  artists: z.array(HarmonizedArtistCreditSchema),

  releaseDate: PartialDateSchema.optional(),
  releaseType: ReleaseTypeSchema,
  status: ReleaseStatusSchema.optional(),

  labels: z
    .array(
      z.object({
        name: z.string(),
        catalogNumber: z.string().optional(),
      })
    )
    .optional(),

  releaseCountry: z.string().optional(),
  availableCountries: z.array(z.string()).optional(),

  media: z.array(
    z.object({
      format: z.string().optional(),
      position: z.number().int().positive(),
      tracks: z.array(HarmonizedTrackSchema),
    })
  ),

  artwork: z.array(ArtworkSchema).optional(),

  genres: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  language: z
    .object({
      script: z.string().optional(),
      language: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
    .optional(),

  externalIds: z.record(z.string(), z.string()),
  sources: z.array(ProviderSourceSchema),

  mergedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1),
});

export type HarmonizedRelease = z.infer<typeof HarmonizedReleaseSchema>;

export const ArtistTypeSchema = z.enum([
  'person',
  'group',
  'orchestra',
  'choir',
  'character',
  'other',
]);

export type ArtistType = z.infer<typeof ArtistTypeSchema>;

export const HarmonizedArtistSchema = z.object({
  name: z.string(),
  nameNormalized: z.string().optional(),
  sortName: z.string().optional(),
  disambiguation: z.string().optional(),
  type: ArtistTypeSchema.optional(),

  country: z.string().optional(),
  beginDate: PartialDateSchema.optional(),
  endDate: PartialDateSchema.optional(),

  aliases: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),

  images: z
    .array(
      z.object({
        url: z.string().url(),
        width: z.number().optional(),
        height: z.number().optional(),
        provider: z.string(),
      })
    )
    .optional(),

  externalIds: z.record(z.string(), z.string()),
  sources: z.array(ProviderSourceSchema),

  mergedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1),
});

export type HarmonizedArtist = z.infer<typeof HarmonizedArtistSchema>;
export type HarmonizedArtistImage = NonNullable<
  HarmonizedArtist['images']
>[number];

/**
 * Harmonized user profile from a streaming provider.
 * Contains normalized common fields plus raw provider data for extensibility.
 */
export const HarmonizedUserProfileSchema = z.object({
  // Normalized common fields (type-safe, consistent API)
  id: z.string(),
  username: z.string().optional(),
  email: z.string().optional(),
  emailVerified: z.boolean().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  country: z.string().optional(),
  profileImage: z
    .object({
      url: z.string().url(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  subscription: z
    .object({
      type: z.string(),
      status: z.string().optional(),
    })
    .optional(),
  createdAt: z.coerce.date().optional(),

  // Provider metadata
  provider: z.string(),
  fetchedAt: z.coerce.date(),

  // Raw provider response - preserves all original data for provider-specific features
  // Access via profile.providerData?.subscription?.audioQuality for Tidal-specific fields
  providerData: z.record(z.string(), z.unknown()).optional(),
});

export type HarmonizedUserProfile = z.infer<typeof HarmonizedUserProfileSchema>;

/**
 * Paginated result for user collections (followed artists, saved albums, etc.)
 */
export const PaginatedCollectionSchema = z.object({
  items: z.array(z.unknown()),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  total: z.number().optional(),
});

export type PaginatedCollection<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
};

/**
 * Parameters for fetching paginated collections
 */
export interface CollectionParams {
  limit?: number;
  cursor?: string;
}

/**
 * Harmonized playlist from a streaming provider (e.g. a user's library
 * playlist). Unlike releases/artists/tracks, playlists are user-owned rather
 * than catalog entities merged across providers, but the shared
 * `externalIds`/`sources`/`mergedAt`/`confidence` fields are kept for
 * consistency with the rest of the harmonized model.
 */
export const HarmonizedPlaylistSchema = z.object({
  name: z.string(),
  nameNormalized: z.string().optional(),
  description: z.string().optional(),
  /** Display name of the playlist owner/curator, when exposed by the provider. */
  ownerName: z.string().optional(),
  /** Whether the playlist is publicly shared/visible, when the provider exposes this. */
  isPublic: z.boolean().optional(),
  /** Number of tracks in the playlist, when known without fetching tracks. */
  trackCount: z.number().int().nonnegative().optional(),

  artwork: z
    .array(
      z.object({
        url: z.string().url(),
        type: ArtworkTypeSchema,
        width: z.number().optional(),
        height: z.number().optional(),
        provider: z.string(),
      })
    )
    .optional(),

  externalIds: z.record(z.string(), z.string()),
  sources: z.array(ProviderSourceSchema),

  mergedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1),
});

export type HarmonizedPlaylist = z.infer<typeof HarmonizedPlaylistSchema>;

/**
 * Parameters for fetching a user's playlists. Extends {@link CollectionParams}
 * with a `publicOnly` filter.
 *
 * Note: providers (e.g. Apple Music) may not support filtering publicly
 * shared playlists server-side. In that case the filter is applied
 * client-side, on the page of results returned by the provider - `hasMore`/
 * `nextCursor` still describe the underlying (unfiltered) provider
 * pagination, not the number of public playlists remaining.
 */
export interface PlaylistCollectionParams extends CollectionParams {
  /** When true, only return playlists the user has marked public/shared. */
  publicOnly?: boolean;
}

/**
 * A single entry in a user's recent listen history: a track they listened
 * to, plus (when the provider exposes it) the timestamp it was played at.
 *
 * Apple Music's recently-played endpoint does not expose play timestamps, so
 * `playedAt` is optional; items are still returned in most-recent-first
 * order by the provider.
 */
export const HarmonizedListenHistoryItemSchema = z.object({
  track: HarmonizedTrackSchema,
  playedAt: z.coerce.date().optional(),
  provider: z.string(),
});

export type HarmonizedListenHistoryItem = z.infer<
  typeof HarmonizedListenHistoryItemSchema
>;
