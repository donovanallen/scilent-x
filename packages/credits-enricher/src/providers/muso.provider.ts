import { z } from 'zod';
import { HttpError } from '@scilent-one/harmony-engine';
import { BaseCreditsProvider } from './base.credits-provider';
import type {
  EnrichedTrackCredits,
  EnrichedCredit,
  CreditGroup,
  CreditsProviderConfig,
  EnrichmentOptions,
} from '../types/index';
import { getCategoryForRole } from '../types/credits.types';
import { prepareIsrc } from '../utils/matching';

/**
 * Muso.ai API v4 response schemas
 */
const MusoCollaboratorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  avatarUrl: z.string().optional(),
});

const MusoCreditChildSchema = z.object({
  child: z.string(),
  collaborators: z.array(MusoCollaboratorSchema),
});

const MusoCreditGroupSchema = z.object({
  parent: z.string(),
  credits: z.array(MusoCreditChildSchema),
});

const MusoArtistSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  avatarUrl: z.string().optional(),
});

const MusoAlbumSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  albumArt: z.string().optional(),
});

const _MusoTrackResponseSchema = z.object({
  result: z.string(),
  code: z.number(),
  data: z
    .object({
      id: z.string(),
      title: z.string(),
      isrcs: z.array(z.string()).optional(),
      label: z.string().optional(),
      publisher: z.string().optional(),
      p_line: z.string().optional(),
      c_line: z.string().optional(),
      spotifyIds: z.array(z.string()).optional(),
      duration: z.number().optional(),
      releaseDate: z.string().optional(),
      bpm: z.number().optional(),
      key: z.string().optional(),
      album: MusoAlbumSchema.optional(),
      artists: z.array(MusoArtistSchema).optional(),
      credits: z.array(MusoCreditGroupSchema).optional(),
    })
    .optional(),
});

const _MusoRolesResponseSchema = z.object({
  result: z.string(),
  code: z.number(),
  data: z.array(
    z.object({
      parent: z.string(),
      children: z.array(z.string()),
    })
  ),
});

type MusoTrackResponse = z.infer<typeof _MusoTrackResponseSchema>;

/**
 * Configuration specific to Muso.ai provider
 */
export interface MusoProviderConfig extends CreditsProviderConfig {
  /** Base URL for the Muso.ai API (defaults to v4 production) */
  baseUrl?: string;
}

/**
 * Default configuration for Muso.ai
 * Note: Muso.ai has a 1,000 requests/day limit
 */
export const DEFAULT_MUSO_CONFIG: Partial<MusoProviderConfig> = {
  baseUrl: 'https://api.muso.ai/v4',
  rateLimit: {
    requests: 10, // Conservative per-second limit
    windowMs: 1000,
  },
  cache: {
    ttlSeconds: 604800, // 7 days - credits rarely change
  },
};

/**
 * Muso.ai credits provider implementation.
 * Fetches detailed credits from the Muso.ai API v4.
 *
 * API Key Location:
 * ==================
 * You need to set your Muso.ai API key in the config when initializing:
 *
 * ```typescript
 * const enricher = new CreditsEnricher({
 *   providers: {
 *     muso: {
 *       apiKey: process.env.MUSO_API_KEY!, // <-- Your API key here
 *       rateLimit: { requests: 10, windowMs: 1000 },
 *     },
 *   },
 * });
 * ```
 *
 * Or set the environment variable: MUSO_API_KEY
 */
export class MusoProvider extends BaseCreditsProvider {
  readonly name = 'muso';
  readonly displayName = 'Muso.ai';

  private baseUrl: string;
  private cachedRoles: string[] | null = null;

  constructor(config: MusoProviderConfig) {
    super({
      ...DEFAULT_MUSO_CONFIG,
      ...config,
      rateLimit: config.rateLimit ?? DEFAULT_MUSO_CONFIG.rateLimit!,
    });
    this.baseUrl = config.baseUrl ?? DEFAULT_MUSO_CONFIG.baseUrl!;
    this.initializeLogger();
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Look up credits by ISRC
   */
  async lookupByIsrc(
    isrc: string,
    options?: EnrichmentOptions
  ): Promise<EnrichedTrackCredits | null> {
    const normalizedIsrc = prepareIsrc(isrc);
    if (!normalizedIsrc) {
      this.logger.warn('Invalid ISRC format', { isrc });
      return null;
    }

    return this.withRateLimitAndRetry(async () => {
      const response = await this.fetchApi<MusoTrackResponse>(
        `/track/isrc/${normalizedIsrc}`
      );

      if (!response.data) {
        this.logger.debug('No track found for ISRC', { isrc: normalizedIsrc });
        return null;
      }

      return this.transformTrackResponse(response, options);
    });
  }

  /**
   * Look up credits by title and artist (fallback method)
   * Note: Muso.ai API may not have a direct search endpoint,
   * so this is a placeholder for future implementation
   */
  async lookupByTitleArtist(
    title: string,
    artistName: string,
    _options?: EnrichmentOptions
  ): Promise<EnrichedTrackCredits | null> {
    this.logger.warn(
      'Title/artist lookup not yet implemented for Muso.ai',
      { title, artistName }
    );
    // Muso.ai v4 API may require specific endpoints for search
    // For now, return null - ISRC lookup is the primary method
    return null;
  }

  /**
   * Get available credit roles from the API
   */
  async getRoles(): Promise<string[]> {
    if (this.cachedRoles) {
      return this.cachedRoles;
    }

    return this.withRateLimitAndRetry(async () => {
      const response = await this.fetchApi<z.infer<typeof _MusoRolesResponseSchema>>(
        '/role'
      );

      const roles: string[] = [];
      for (const group of response.data) {
        roles.push(group.parent);
        roles.push(...group.children);
      }

      this.cachedRoles = roles;
      return roles;
    });
  }

  /**
   * Make an authenticated request to the Muso.ai API
   */
  private async fetchApi<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    this.logger.debug('Fetching from Muso.ai', { endpoint });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      this.logger.error('Muso.ai API error', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new HttpError(
        `Muso.ai API error: ${response.statusText}`,
        response.status,
        this.name
      );
    }

    const data = await response.json();
    return data as T;
  }

  /**
   * Transform Muso.ai API response to our enriched credits format
   */
  private transformTrackResponse(
    response: MusoTrackResponse,
    options?: EnrichmentOptions
  ): EnrichedTrackCredits | null {
    const data = response.data;
    if (!data) return null;

    // Transform credits groups to flat credits array
    const credits: EnrichedCredit[] = [];
    const creditGroups: CreditGroup[] = [];

    if (data.credits) {
      for (const group of data.credits) {
        // Store the original grouped structure
        creditGroups.push({
          parent: group.parent,
          credits: group.credits.map((c) => ({
            child: c.child,
            collaborators: c.collaborators.map((collab) => ({
              id: collab.id,
              name: collab.name,
              avatarUrl: collab.avatarUrl,
            })),
          })),
        });

        // Flatten to individual credits
        for (const credit of group.credits) {
          for (const collaborator of credit.collaborators) {
            credits.push({
              name: collaborator.name,
              role: credit.child,
              parentRole: group.parent,
              category: getCategoryForRole(credit.child) ?? getCategoryForRole(group.parent),
              externalIds: collaborator.id ? { muso: collaborator.id } : undefined,
              avatarUrl: collaborator.avatarUrl,
              confidence: 1, // Direct from Muso.ai
            });
          }
        }
      }
    }

    // Build the enriched track credits
    const result: EnrichedTrackCredits = {
      isrc: data.isrcs?.[0],
      title: data.title,
      artistName: data.artists?.[0]?.name,
      credits,
      creditGroups,
      source: this.createSource(data.id),
    };

    // Include metadata if requested
    if (options?.includeMetadata !== false) {
      result.metadata = {
        label: data.label,
        publisher: data.publisher,
        pLine: data.p_line,
        cLine: data.c_line,
        bpm: data.bpm,
        key: data.key,
        releaseDate: data.releaseDate,
      };
    }

    return result;
  }
}
