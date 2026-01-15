import { BaseProvider } from './base.provider';
import type {
  ProviderConfig,
  LookupOptions,
  ParsedUrl,
} from '../types/provider.types';
import type {
  HarmonizedRelease,
  HarmonizedTrack,
  HarmonizedArtist,
  HarmonizedArtistCredit,
  HarmonizedUserProfile,
  ReleaseType,
  PartialDate,
  PaginatedCollection,
  CollectionParams,
} from '../types/index';
import { HttpError, ProviderError } from '../errors/index';

const TIDAL_API = 'https://openapi.tidal.com/v2';
const TIDAL_AUTH_API = 'https://auth.tidal.com/v1/oauth2/token';

/**
 * Configuration for the Tidal provider.
 * Requires client credentials from the Tidal Developer Portal.
 * @see https://developer.tidal.com/documentation/api/api-overview
 */
export interface TidalConfig extends ProviderConfig {
  /** Tidal application client ID */
  clientId: string;
  /** Tidal application client secret */
  clientSecret: string;
  /** Country code for content availability (e.g., 'US', 'GB') */
  countryCode?: string;
}

// Tidal API response types based on the JSON:API specification
interface TidalImage {
  url: string;
  width: number;
  height: number;
}

interface TidalResource<T extends string, A = Record<string, unknown>> {
  id: string;
  type: T;
  attributes: A;
  relationships?: Record<
    string,
    { data: { id: string; type: string } | Array<{ id: string; type: string }> }
  >;
  links?: { self: string };
}

interface TidalArtistAttributes {
  name: string;
  popularity?: number;
  picture?: TidalImage[];
}

interface TidalTrackAttributes {
  title: string;
  version?: string;
  isrc?: string;
  duration: number; // in seconds
  explicit: boolean;
  trackNumber: number;
  volumeNumber: number;
  popularity?: number;
  copyright?: string;
  mediaMetadata?: {
    tags?: string[];
  };
}

interface TidalAlbumAttributes {
  title: string;
  barcodeId?: string;
  releaseDate?: string;
  numberOfTracks: number;
  numberOfVolumes: number;
  duration: number;
  explicit: boolean;
  popularity?: number;
  copyright?: string;
  type?: string; // ALBUM, SINGLE, EP, COMPILATION
  imageCover?: TidalImage[];
  videoCover?: TidalImage[];
  mediaMetadata?: {
    tags?: string[];
  };
}

type TidalArtist = TidalResource<'artists', TidalArtistAttributes>;
type TidalTrack = TidalResource<'tracks', TidalTrackAttributes>;
type TidalAlbum = TidalResource<'albums', TidalAlbumAttributes>;

interface TidalListResponse<T> {
  data: T[];
  included?: Array<TidalArtist | TidalTrack | TidalAlbum>;
  links?: { self: string; next?: string };
  meta?: { total: number };
}

interface TidalSingleResponse<T> {
  data: T;
  included?: Array<TidalArtist | TidalTrack | TidalAlbum>;
}

// V2 Search Results response - the search endpoint returns a searchResults resource
// that has relationships to albums, artists, tracks, etc.
interface TidalSearchResultsResponse {
  data: {
    id: string;
    type: 'searchResults';
    relationships?: {
      albums?: { data: Array<{ id: string; type: 'albums' }> };
      artists?: { data: Array<{ id: string; type: 'artists' }> };
      tracks?: { data: Array<{ id: string; type: 'tracks' }> };
    };
  };
  included?: Array<TidalArtist | TidalTrack | TidalAlbum>;
}

interface TidalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * Response from /userCollections/{id}/relationships/artists endpoint.
 * Returns artist relationships with pagination via links.next cursor.
 */
interface TidalUserCollectionArtistsResponse {
  data: Array<{
    id: string;
    type: 'artists';
    meta?: {
      addedAt?: string;
    };
  }>;
  included?: Array<TidalArtist | TidalTrack | TidalAlbum>;
  links?: {
    self: string;
    next?: string;
  };
}

/**
 * Tidal user profile attributes from the /users/me endpoint.
 * @see https://tidal-music.github.io/tidal-api-reference/#/users
 */
interface TidalUserAttributes {
  username?: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  country?: string;
  picture?: TidalImage[];
  subscription?: {
    type?: string;
    status?: string;
  };
  created?: string;
}

type TidalUser = TidalResource<'users', TidalUserAttributes>;

/**
 * Tidal metadata provider using the Tidal Developer API.
 *
 * Features:
 * - OAuth2 Client Credentials authentication
 * - Album, track, and artist lookups
 * - ISRC-based track search
 * - Barcode (UPC/EAN) lookup for albums
 * - High-resolution artwork retrieval
 *
 * @see https://developer.tidal.com/documentation/api/api-overview
 */
export class TidalProvider extends BaseProvider {
  readonly name = 'tidal';
  readonly displayName = 'Tidal';
  readonly priority = 75;

  /**
   * Tidal supports user-authenticated API calls via OAuth2.
   */
  override get supportsUserAuth(): boolean {
    return true;
  }

  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private countryCode: string;

  constructor(config: TidalConfig) {
    super(config);
    this.countryCode = config.countryCode ?? 'US';
    this.initializeLogger();
  }

  canHandleUrl(url: string): boolean {
    return /tidal\.com/.test(url) || /^tidal:/.test(url);
  }

  parseUrl(url: string): ParsedUrl | null {
    // Handle both URLs and URIs
    // URLs: https://tidal.com/browse/album/xyz, https://tidal.com/browse/track/xyz
    // Also: https://listen.tidal.com/album/xyz
    const patterns: Record<ParsedUrl['type'], RegExp> = {
      release: /(?:album[/:]|\/album\/)(\d+)/,
      track: /(?:track[/:]|\/track\/)(\d+)/,
      artist: /(?:artist[/:]|\/artist\/)(\d+)/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return { type: type as ParsedUrl['type'], id: match[1] };
      }
    }
    return null;
  }

  /**
   * Get or refresh OAuth2 access token using client credentials.
   */
  private async getAccessToken(): Promise<string> {
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date()
    ) {
      return this.accessToken;
    }

    const config = this.config as TidalConfig;
    const credentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString('base64');

    const response = await fetch(TIDAL_AUTH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new ProviderError(
        `Failed to obtain Tidal access token: ${response.status}`,
        this.name
      );
    }

    const data = (await response.json()) as TidalTokenResponse;
    this.accessToken = data.access_token;
    // Refresh 60 seconds before expiry
    this.tokenExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);

    this.logger.debug('Obtained new Tidal access token', {
      expiresIn: data.expires_in,
    });

    return this.accessToken;
  }

  /**
   * Make an authenticated request to the Tidal v2 API.
   */
  private async fetchApi<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T | null> {
    const token = await this.getAccessToken();

    const searchParams = new URLSearchParams({
      countryCode: this.countryCode,
      ...params,
    });

    const url = `${TIDAL_API}${endpoint}?${searchParams.toString()}`;

    this.logger.debug('Tidal API request', { url });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      this.logger.warn('Tidal API error response', {
        status: response.status,
        error: errorText,
      });

      if (response.status === 404) return null;
      if (response.status === 401) {
        // Token might be expired, clear it
        this.accessToken = null;
        this.tokenExpiresAt = null;
        throw new HttpError(
          `Tidal API authentication failed`,
          response.status,
          this.name
        );
      }
      throw new HttpError(
        `Tidal API error: ${response.status} - ${errorText}`,
        response.status,
        this.name
      );
    }

    return response.json() as Promise<T>;
  }

  protected async _lookupReleaseByGtin(
    gtin: string
  ): Promise<HarmonizedRelease | null> {
    // V2 API: Try searching for the barcode/UPC
    // First attempt with full GTIN
    const data = await this.fetchApi<TidalListResponse<TidalAlbum>>(
      '/albums/byBarcodeId',
      {
        barcodeId: gtin,
      }
    );

    if (data?.data?.length) {
      return this._lookupReleaseById(data.data[0]!.id);
    }

    // Try without leading zeros for UPC compatibility
    const cleanedGtin = gtin.replace(/^0+/, '');
    if (cleanedGtin !== gtin) {
      const retryData = await this.fetchApi<TidalListResponse<TidalAlbum>>(
        '/albums/byBarcodeId',
        {
          barcodeId: cleanedGtin,
        }
      );
      if (retryData?.data?.length) {
        return this._lookupReleaseById(retryData.data[0]!.id);
      }
    }

    return null;
  }

  protected async _lookupReleaseById(
    id: string,
    _options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    // V2 API: Fetch album with relationships
    const albumData = await this.fetchApi<TidalSingleResponse<TidalAlbum>>(
      `/albums/${id}`,
      {
        include: 'artists',
      }
    );

    if (!albumData?.data) return null;

    // V2 API: Fetch album items (tracks) using the items relationship
    const tracksData = await this.fetchApi<TidalListResponse<TidalTrack>>(
      `/albums/${id}/items`,
      {
        include: 'artists',
        limit: '100',
      }
    );

    return this.transformAlbum(
      albumData.data,
      albumData.included,
      tracksData?.data ?? [],
      tracksData?.included
    );
  }

  protected async _lookupReleaseByUrl(
    url: string
  ): Promise<HarmonizedRelease | null> {
    const parsed = this.parseUrl(url);
    if (!parsed || parsed.type !== 'release') return null;
    return this._lookupReleaseById(parsed.id);
  }

  protected async _lookupTrackByIsrc(
    isrc: string
  ): Promise<HarmonizedTrack | null> {
    // V2 API: Use the tracks/byIsrc endpoint
    const data = await this.fetchApi<TidalListResponse<TidalTrack>>(
      '/tracks/byIsrc',
      {
        isrc,
        include: 'artists',
        limit: '1',
      }
    );

    if (!data?.data?.length) return null;

    const track = data.data[0]!;
    return this.transformTrack(
      track,
      track.attributes.trackNumber,
      track.attributes.volumeNumber,
      data.included
    );
  }

  protected async _lookupArtistById(
    id: string
  ): Promise<HarmonizedArtist | null> {
    const data = await this.fetchApi<TidalSingleResponse<TidalArtist>>(
      `/artists/${id}`
    );

    if (!data?.data) return null;

    return this.transformArtist(data.data);
  }

  protected async _searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    // V2 API uses /searchResults/{query} with query in the path
    const encodedQuery = encodeURIComponent(query);
    const data = await this.fetchApi<TidalSearchResultsResponse>(
      `/searchResults/${encodedQuery}`,
      {
        include: 'albums',
        limit: String(limit),
      }
    );

    if (!data?.included) return [];

    // Extract albums from the included resources
    const albums = data.included.filter(
      (item): item is TidalAlbum => item.type === 'albums'
    );

    return albums.map((album) =>
      this.transformAlbum(album, data.included, [], undefined)
    );
  }

  protected async _searchArtists(
    query: string,
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    // V2 API uses /searchResults/{query} with query in the path
    const encodedQuery = encodeURIComponent(query);
    const data = await this.fetchApi<TidalSearchResultsResponse>(
      `/searchResults/${encodedQuery}`,
      {
        include: 'artists',
        limit: String(limit),
      }
    );

    if (!data?.included) return [];

    // Extract artists from the included resources
    const artists = data.included.filter(
      (item): item is TidalArtist => item.type === 'artists'
    );

    return artists.map((artist) => this.transformArtist(artist));
  }

  /**
   * Search artists using a user's OAuth access token.
   * Falls back to the same transformation pipeline as public search.
   */
  async searchArtistsWithUserToken(
    query: string,
    accessToken: string,
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    const encodedQuery = encodeURIComponent(query);
    const data = await this.fetchUserApi<TidalSearchResultsResponse>(
      `/searchResults/${encodedQuery}`,
      accessToken,
      {
        include: 'artists',
        limit: String(limit),
      }
    );

    if (!data?.included) return [];

    const artists = data.included.filter(
      (item): item is TidalArtist => item.type === 'artists'
    );

    return artists.map((artist) => this.transformArtist(artist));
  }

  protected async _searchTracks(
    query: string,
    limit = 25
  ): Promise<HarmonizedTrack[]> {
    // V2 API uses /searchResults/{query} with query in the path
    const encodedQuery = encodeURIComponent(query);
    const data = await this.fetchApi<TidalSearchResultsResponse>(
      `/searchResults/${encodedQuery}`,
      {
        include: 'tracks',
        limit: String(limit),
      }
    );

    if (!data?.included) return [];

    // Extract tracks from the included resources
    const tracks = data.included.filter(
      (item): item is TidalTrack => item.type === 'tracks'
    );

    return tracks.map((track) =>
      this.transformTrack(
        track,
        track.attributes.trackNumber,
        track.attributes.volumeNumber,
        data.included
      )
    );
  }

  // User-authenticated API methods

  /**
   * Make a user-authenticated request to the Tidal v2 API.
   * Uses the user's OAuth access token instead of client credentials.
   */
  private async fetchUserApi<T>(
    endpoint: string,
    userAccessToken: string,
    params?: Record<string, string>
  ): Promise<T | null> {
    const searchParams = new URLSearchParams({
      countryCode: this.countryCode,
      ...params,
    });

    const url = `${TIDAL_API}${endpoint}?${searchParams.toString()}`;

    this.logger.debug('Tidal User API request', { url });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      this.logger.warn('Tidal User API error response', {
        status: response.status,
        error: errorText,
      });

      if (response.status === 404) return null;
      if (response.status === 401) {
        throw new HttpError(
          `Tidal user authentication failed - token may be expired`,
          response.status,
          this.name
        );
      }
      throw new HttpError(
        `Tidal User API error: ${response.status} - ${errorText}`,
        response.status,
        this.name
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get the current user's profile using their OAuth access token.
   * @param accessToken - The user's OAuth access token from the connected account
   * @returns The harmonized user profile with normalized fields and raw provider data
   */
  protected override async _getCurrentUser(
    accessToken: string
  ): Promise<HarmonizedUserProfile> {
    const data = await this.fetchUserApi<TidalSingleResponse<TidalUser>>(
      '/users/me',
      accessToken
    );

    if (!data?.data) {
      throw new ProviderError(
        'Failed to fetch Tidal user profile',
        this.name
      );
    }

    return this.transformUserProfile(data.data);
  }

  /**
   * Get the user's followed/favorite artists from Tidal.
   * Uses the /userCollections/{id}/relationships/artists endpoint.
   * @see https://developer.tidal.com/apiref#tag/User-Collections
   * @param accessToken - The user's OAuth access token
   * @param params - Pagination parameters (limit, cursor)
   * @returns Paginated list of harmonized artists the user follows
   */
  protected override async _getFollowedArtists(
    accessToken: string,
    params?: CollectionParams
  ): Promise<PaginatedCollection<HarmonizedArtist>> {
    // First, get the user's ID to construct the collection endpoint
    const userProfile = await this._getCurrentUser(accessToken);
    const userId = userProfile.id;

    const queryParams: Record<string, string> = {
      include: 'artists',
      countryCode: this.countryCode,
    };

    // Tidal API v2 uses cursor-based pagination via page[cursor]
    if (params?.cursor) {
      queryParams['page[cursor]'] = params.cursor;
    }

    // Sort by most recently added first
    queryParams['sort'] = '-artists.addedAt';

    const data = await this.fetchUserApi<TidalUserCollectionArtistsResponse>(
      `/userCollections/${userId}/relationships/artists`,
      accessToken,
      queryParams
    );

    if (!data?.included) {
      const emptyResult: PaginatedCollection<HarmonizedArtist> = {
        items: [],
        nextCursor: null,
        hasMore: false,
      };
      return emptyResult;
    }

    // Extract artists from the included resources
    const artists = data.included.filter(
      (item): item is TidalArtist => item.type === 'artists'
    );

    const harmonizedArtists = artists.map((artist) => this.transformArtist(artist));

    // Extract next cursor from links.next URL if present
    let nextCursor: string | null = null;
    if (data.links?.next) {
      const nextUrl = new URL(data.links.next, 'https://openapi.tidal.com');
      nextCursor = nextUrl.searchParams.get('page[cursor]');
    }

    return {
      items: harmonizedArtists,
      nextCursor,
      hasMore: nextCursor !== null,
    };
  }

  // Transformation methods

  private transformAlbum(
    raw: TidalAlbum,
    included?: Array<TidalArtist | TidalTrack | TidalAlbum>,
    tracks: TidalTrack[] = [],
    trackIncluded?: Array<TidalArtist | TidalTrack | TidalAlbum>
  ): HarmonizedRelease {
    // Extract artists from relationships
    const artistIds =
      raw.relationships?.artists?.data instanceof Array
        ? raw.relationships.artists.data.map((r) => r.id)
        : raw.relationships?.artists?.data
          ? [raw.relationships.artists.data.id]
          : [];

    const artists = artistIds
      .map((id) => included?.find((i) => i.type === 'artists' && i.id === id))
      .filter((a): a is TidalArtist => a !== undefined);

    // Transform tracks grouped by volume
    const harmonizedTracks = tracks.map((t) =>
      this.transformTrack(
        t,
        t.attributes.trackNumber,
        t.attributes.volumeNumber,
        trackIncluded
      )
    );

    // Group tracks into media (volumes/discs)
    const volumeMap = new Map<number, HarmonizedTrack[]>();
    for (const track of harmonizedTracks) {
      const volumeNum = track.discNumber ?? 1;
      if (!volumeMap.has(volumeNum)) {
        volumeMap.set(volumeNum, []);
      }
      volumeMap.get(volumeNum)!.push(track);
    }

    const media = Array.from(volumeMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([position, volumeTracks]) => ({
        position,
        tracks: volumeTracks.sort((a, b) => a.position - b.position),
      }));

    // If no tracks are available, create empty media entries
    if (media.length === 0) {
      for (let i = 1; i <= (raw.attributes.numberOfVolumes || 1); i++) {
        media.push({ position: i, tracks: [] });
      }
    }

    // Get the largest cover image
    const artwork = raw.attributes.imageCover?.map((img) => ({
      url: img.url,
      type: 'front' as const,
      width: img.width,
      height: img.height,
      provider: 'tidal',
    }));

    return {
      gtin: raw.attributes.barcodeId,
      title: raw.attributes.title,
      titleNormalized: this.normalizeString(raw.attributes.title),

      artists: artists.map((a) => this.transformArtistCredit(a)),

      releaseDate: this.parseTidalDate(raw.attributes.releaseDate),
      releaseType: this.mapAlbumType(raw.attributes.type),

      media,

      artwork,

      externalIds: { tidal: raw.id },
      sources: [
        this.createSource(raw.id, `https://tidal.com/browse/album/${raw.id}`),
      ],

      mergedAt: new Date(),
      confidence: 0.85,
    };
  }

  private transformTrack(
    raw: TidalTrack,
    position: number,
    discNumber?: number,
    included?: Array<TidalArtist | TidalTrack | TidalAlbum>
  ): HarmonizedTrack {
    // Extract artists from relationships
    const artistIds =
      raw.relationships?.artists?.data instanceof Array
        ? raw.relationships.artists.data.map((r) => r.id)
        : raw.relationships?.artists?.data
          ? [raw.relationships.artists.data.id]
          : [];

    const artists = artistIds
      .map((id) => included?.find((i) => i.type === 'artists' && i.id === id))
      .filter((a): a is TidalArtist => a !== undefined);

    return {
      isrc: raw.attributes.isrc,
      title: raw.attributes.title,
      titleNormalized: this.normalizeString(raw.attributes.title),
      position,
      discNumber,
      // Tidal duration is in seconds, convert to milliseconds for consistency
      duration: raw.attributes.duration * 1000,
      explicit: raw.attributes.explicit,
      artists: artists.map((a) => this.transformArtistCredit(a)),
      externalIds: { tidal: raw.id },
      sources: [
        this.createSource(raw.id, `https://tidal.com/browse/track/${raw.id}`),
      ],
    };
  }

  private transformArtist(raw: TidalArtist): HarmonizedArtist {
    return {
      name: raw.attributes.name,
      nameNormalized: this.normalizeString(raw.attributes.name),
      externalIds: { tidal: raw.id },
      sources: [
        this.createSource(raw.id, `https://tidal.com/browse/artist/${raw.id}`),
      ],
      mergedAt: new Date(),
      confidence: 0.85,
    };
  }

  private transformArtistCredit(raw: TidalArtist): HarmonizedArtistCredit {
    return {
      name: raw.attributes.name,
      externalIds: { tidal: raw.id },
    };
  }

  private parseTidalDate(dateStr?: string): PartialDate | undefined {
    if (!dateStr) return undefined;
    const parts = dateStr.split('-').map(Number);
    return {
      year: parts[0],
      month: parts[1],
      day: parts[2],
    };
  }

  private mapAlbumType(type?: string): ReleaseType {
    if (!type) return 'album';

    const map: Record<string, ReleaseType> = {
      ALBUM: 'album',
      SINGLE: 'single',
      EP: 'ep',
      COMPILATION: 'compilation',
    };
    return map[type.toUpperCase()] ?? 'other';
  }

  private transformUserProfile(raw: TidalUser): HarmonizedUserProfile {
    const attrs = raw.attributes;

    // Build display name from available name fields
    const displayName =
      [attrs.firstName, attrs.lastName].filter(Boolean).join(' ') ||
      attrs.username;

    // Get largest profile image if available
    const profileImage = attrs.picture?.[0]
      ? {
          url: attrs.picture[0].url,
          width: attrs.picture[0].width,
          height: attrs.picture[0].height,
        }
      : undefined;

    return {
      id: raw.id,
      username: attrs.username,
      email: attrs.email,
      emailVerified: attrs.emailVerified,
      firstName: attrs.firstName,
      lastName: attrs.lastName,
      displayName,
      country: attrs.country,
      profileImage,
      subscription:
        attrs.subscription && attrs.subscription.type != null
          ? {
              type: attrs.subscription.type,
              status: attrs.subscription.status,
            }
          : undefined,
      createdAt: attrs.created ? new Date(attrs.created) : undefined,
      provider: this.name,
      fetchedAt: new Date(),
      // Preserve raw response for provider-specific features
      providerData: raw.attributes as Record<string, unknown>,
    };
  }
}
