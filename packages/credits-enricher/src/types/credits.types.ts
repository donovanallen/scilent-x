import { z } from 'zod';

/**
 * Credit category for organizing credits by type
 */
export const CreditCategorySchema = z.enum([
  'artist',
  'songwriter',
  'production',
  'engineering',
  'performance',
  'other',
]);

export type CreditCategory = z.infer<typeof CreditCategorySchema>;

/**
 * A collaborator who contributed to a credit
 */
export const CollaboratorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  externalIds: z.record(z.string()).optional(),
});

export type Collaborator = z.infer<typeof CollaboratorSchema>;

/**
 * Enriched credit with detailed information from Muso.ai or other sources
 */
export const EnrichedCreditSchema = z.object({
  name: z.string(),
  role: z.string(),
  parentRole: z.string().optional(), // Parent category (e.g., "Songwriter" for "Composer")
  category: CreditCategorySchema.optional(),
  instruments: z.array(z.string()).optional(),
  externalIds: z.record(z.string()).optional(), // { muso: "...", musicbrainz: "..." }
  confidence: z.number().min(0).max(1).optional(),
  avatarUrl: z.string().url().optional(),
});

export type EnrichedCredit = z.infer<typeof EnrichedCreditSchema>;

/**
 * Credit group as returned by Muso.ai (hierarchical structure)
 */
export const CreditGroupSchema = z.object({
  parent: z.string(), // e.g., "Songwriter", "Production"
  credits: z.array(
    z.object({
      child: z.string(), // e.g., "Composer", "Lyricist"
      collaborators: z.array(CollaboratorSchema),
    })
  ),
});

export type CreditGroup = z.infer<typeof CreditGroupSchema>;

/**
 * Track with enriched credits
 */
export const EnrichedTrackCreditsSchema = z.object({
  isrc: z.string().optional(),
  title: z.string(),
  artistName: z.string().optional(),
  credits: z.array(EnrichedCreditSchema),
  creditGroups: z.array(CreditGroupSchema).optional(), // Original grouped structure
  metadata: z
    .object({
      label: z.string().optional(),
      publisher: z.string().optional(),
      pLine: z.string().optional(),
      cLine: z.string().optional(),
      bpm: z.number().optional(),
      key: z.string().optional(),
      releaseDate: z.string().optional(),
    })
    .optional(),
  source: z.object({
    provider: z.string(),
    id: z.string().optional(),
    fetchedAt: z.coerce.date(),
  }),
});

export type EnrichedTrackCredits = z.infer<typeof EnrichedTrackCreditsSchema>;

/**
 * Configuration for a credits provider
 */
export interface CreditsProviderConfig {
  apiKey: string;
  baseUrl?: string;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  retry?: {
    retries: number;
    minTimeout: number;
    maxTimeout: number;
    factor: number;
  };
  cache?: {
    ttlSeconds: number;
  };
}

/**
 * Options for enrichment operations
 */
export interface EnrichmentOptions {
  bypassCache?: boolean;
  includeMetadata?: boolean;
  fallbackToTitleMatch?: boolean;
}

/**
 * Result of an enrichment operation
 */
export interface EnrichmentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  provider?: string;
}

/**
 * Role mapping from provider-specific roles to normalized categories
 */
export const ROLE_CATEGORY_MAP: Record<string, CreditCategory> = {
  // Artist roles
  'Primary Artist': 'artist',
  'Featured Artist': 'artist',
  Artist: 'artist',
  // Songwriter roles
  Songwriter: 'songwriter',
  Composer: 'songwriter',
  Lyricist: 'songwriter',
  Topliner: 'songwriter',
  Writer: 'songwriter',
  // Production roles
  Producer: 'production',
  'Executive Producer': 'production',
  'Co-Producer': 'production',
  'Associate Producer': 'production',
  Programmer: 'production',
  // Engineering roles
  'Mixing Engineer': 'engineering',
  'Mastering Engineer': 'engineering',
  'Recording Engineer': 'engineering',
  'Audio Engineer': 'engineering',
  Engineer: 'engineering',
  Mixer: 'engineering',
  // Performance roles
  Vocals: 'performance',
  'Background Vocals': 'performance',
  Guitar: 'performance',
  Bass: 'performance',
  Drums: 'performance',
  Piano: 'performance',
  Keyboards: 'performance',
  Percussion: 'performance',
  Strings: 'performance',
  Horns: 'performance',
  // Default
  Other: 'other',
};

/**
 * Get the category for a given role
 */
export function getCategoryForRole(role: string): CreditCategory {
  return ROLE_CATEGORY_MAP[role] ?? 'other';
}
