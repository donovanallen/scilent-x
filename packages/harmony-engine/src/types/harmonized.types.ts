import { z } from "zod";

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
  externalIds: z.record(z.string()).optional(),
});

export type HarmonizedArtistCredit = z.infer<
  typeof HarmonizedArtistCreditSchema
>;

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
  externalIds: z.record(z.string()),
  sources: z.array(ProviderSourceSchema),
});

export type HarmonizedTrack = z.infer<typeof HarmonizedTrackSchema>;

export const ReleaseTypeSchema = z.enum([
  "album",
  "single",
  "ep",
  "compilation",
  "soundtrack",
  "live",
  "remix",
  "other",
]);

export type ReleaseType = z.infer<typeof ReleaseTypeSchema>;

export const ReleaseStatusSchema = z.enum([
  "official",
  "promotional",
  "bootleg",
  "pseudo-release",
]);

export type ReleaseStatus = z.infer<typeof ReleaseStatusSchema>;

export const ArtworkTypeSchema = z.enum([
  "front",
  "back",
  "medium",
  "booklet",
  "other",
]);

export type ArtworkType = z.infer<typeof ArtworkTypeSchema>;

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

  genres: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  language: z
    .object({
      script: z.string().optional(),
      language: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
    .optional(),

  externalIds: z.record(z.string()),
  sources: z.array(ProviderSourceSchema),

  mergedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1),
});

export type HarmonizedRelease = z.infer<typeof HarmonizedReleaseSchema>;

export const ArtistTypeSchema = z.enum([
  "person",
  "group",
  "orchestra",
  "choir",
  "character",
  "other",
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

  externalIds: z.record(z.string()),
  sources: z.array(ProviderSourceSchema),

  mergedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1),
});

export type HarmonizedArtist = z.infer<typeof HarmonizedArtistSchema>;

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
  providerData: z.record(z.unknown()).optional(),
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
