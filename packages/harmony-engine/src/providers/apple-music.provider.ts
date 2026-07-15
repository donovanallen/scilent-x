import { createPrivateKey, sign, type KeyObject } from 'node:crypto';
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
  HarmonizedPlaylist,
  HarmonizedListenHistoryItem,
  ReleaseType,
  PartialDate,
  PaginatedCollection,
  CollectionParams,
  PlaylistCollectionParams,
  Artwork,
} from '../types/index';
import { HttpError, ProviderError } from '../errors/index';

const APPLE_MUSIC_API = 'https://api.music.apple.com';

/**
 * Developer tokens can be minted for up to six months, but since generation is
 * a cheap local signing operation we mint short-lived tokens and refresh them
 * well before expiry.
 */
const DEVELOPER_TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours

/**
 * Configuration for the Apple Music provider.
 *
 * Unlike Spotify/Tidal (OAuth2 client credentials), Apple Music authenticates
 * catalog requests with a developer token: an ES256-signed JWT built from an
 * Apple Developer Team ID, a MusicKit Key ID, and the matching `.p8` private
 * key. User-scoped features (library) additionally require a Music User Token,
 * which is handled outside the catalog provider.
 *
 * @see https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens
 */
export interface AppleMusicConfig extends ProviderConfig {
  /** Apple Developer Team ID (the JWT `iss` claim) */
  teamId: string;
  /** MusicKit private key identifier (the JWT header `kid`) */
  keyId: string;
  /** PEM-encoded MusicKit private key contents (from the downloaded `.p8` file) */
  privateKey: string;
  /** Default storefront used for catalog lookups (e.g. 'us', 'gb'). Defaults to 'us'. */
  storefront?: string;
}

// Apple Music API response types
// @see https://developer.apple.com/documentation/applemusicapi

interface AppleMusicArtwork {
  url: string;
  width?: number;
  height?: number;
  bgColor?: string;
}

interface AppleMusicSongAttributes {
  name: string;
  artistName: string;
  albumName?: string;
  isrc?: string;
  durationInMillis?: number;
  trackNumber?: number;
  discNumber?: number;
  contentRating?: string; // 'explicit' | 'clean'
  genreNames?: string[];
  releaseDate?: string;
  url?: string;
  artwork?: AppleMusicArtwork;
}

interface AppleMusicArtistAttributes {
  name: string;
  genreNames?: string[];
  url?: string;
  artwork?: AppleMusicArtwork;
}

interface AppleMusicAlbumAttributes {
  name: string;
  artistName: string;
  upc?: string;
  releaseDate?: string;
  trackCount?: number;
  genreNames?: string[];
  recordLabel?: string;
  copyright?: string;
  isSingle?: boolean;
  isCompilation?: boolean;
  contentRating?: string;
  url?: string;
  artwork?: AppleMusicArtwork;
}

interface AppleMusicRelationship<T> {
  data?: T[];
  href?: string;
  next?: string;
}

interface AppleMusicResource<T extends string, A> {
  id: string;
  type: T;
  href?: string;
  attributes?: A;
  relationships?: {
    artists?: AppleMusicRelationship<AppleMusicArtist>;
    tracks?: AppleMusicRelationship<AppleMusicSong>;
  };
}

type AppleMusicSong = AppleMusicResource<'songs', AppleMusicSongAttributes>;
type AppleMusicArtist = AppleMusicResource<
  'artists',
  AppleMusicArtistAttributes
>;
type AppleMusicAlbum = AppleMusicResource<'albums', AppleMusicAlbumAttributes>;

interface AppleMusicDataResponse<T> {
  data: T[];
  next?: string;
}

interface AppleMusicSearchResponse {
  results: {
    songs?: { data: AppleMusicSong[] };
    albums?: { data: AppleMusicAlbum[] };
    artists?: { data: AppleMusicArtist[] };
  };
}

interface AppleMusicStorefrontAttributes {
  name?: string;
  defaultLanguageTag?: string;
  supportedLanguageTags?: string[];
}

type AppleMusicStorefront = AppleMusicResource<
  'storefronts',
  AppleMusicStorefrontAttributes
>;

interface AppleMusicLibraryArtist {
  id: string;
  type: 'library-artists';
  attributes?: { name?: string };
  relationships?: {
    catalog?: { data?: AppleMusicArtist[] };
  };
}

interface AppleMusicLibraryArtistsResponse {
  data: AppleMusicLibraryArtist[];
  meta?: { total?: number };
  next?: string;
}

interface AppleMusicPlaylistAttributes {
  name: string;
  description?: { standard?: string; short?: string };
  /** Whether the user has marked this library playlist public/shared. */
  isPublic?: boolean;
  canEdit?: boolean;
  hasCatalog?: boolean;
  artwork?: AppleMusicArtwork;
  playParams?: {
    id: string;
    kind: string;
    isLibrary?: boolean;
    globalId?: string;
  };
}

type AppleMusicLibraryPlaylist = AppleMusicResource<
  'library-playlists',
  AppleMusicPlaylistAttributes
>;

interface AppleMusicLibraryPlaylistsResponse {
  data: AppleMusicLibraryPlaylist[];
  meta?: { total?: number };
  next?: string;
}

/**
 * A single item from the "recently played tracks" endpoint. Apple documents
 * this as returning `songs` resources, shaped like catalog songs.
 * @see https://developer.apple.com/documentation/applemusicapi/get-v1-me-recent-played-tracks
 */
interface AppleMusicRecentlyPlayedTracksResponse {
  data: AppleMusicSong[];
  next?: string;
}

/**
 * Apple Music catalog provider using the Apple Music API.
 *
 * Features:
 * - Developer-token (ES256 JWT) authentication
 * - Album, track, and artist lookups
 * - ISRC-based track lookup (`filter[isrc]`)
 * - UPC lookup for albums (`filter[upc]`)
 * - `music.apple.com` URL parsing
 * - Artwork retrieval (resolves Apple's `{w}`/`{h}` templated URLs)
 *
 * @see https://developer.apple.com/documentation/applemusicapi
 */
export class AppleMusicProvider extends BaseProvider {
  readonly name = 'apple_music';
  readonly displayName = 'Apple Music';
  protected readonly defaultPriority = 70;

  /**
   * Apple Music supports user-scoped API calls via a Music User Token, which is
   * obtained client-side through MusicKit and passed here as the `accessToken`.
   * The developer token required alongside it is minted internally from config.
   */
  override get supportsUserAuth(): boolean {
    return true;
  }

  private developerToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private privateKeyObject: KeyObject | null = null;
  private storefront: string;

  constructor(config: AppleMusicConfig) {
    super(config);
    this.storefront = (config.storefront || 'us').toLowerCase();
    this.initializeLogger();
  }

  canHandleUrl(url: string): boolean {
    return /music\.apple\.com/.test(url) || /itunes\.apple\.com/.test(url);
  }

  parseUrl(url: string): ParsedUrl | null {
    if (!this.canHandleUrl(url)) return null;

    // A song is expressed as an album URL with an `?i=<songId>` query param:
    // https://music.apple.com/us/album/album-name/1234567890?i=9876543210
    const songParam = url.match(/[?&]i=(\d+)/);
    if (songParam?.[1]) {
      return { type: 'track', id: songParam[1] };
    }

    // Artist: /artist/<slug>/<id> or legacy /artist/id<id>
    const artistMatch = url.match(/\/artist\/(?:[^/?#]+\/)?(?:id)?(\d+)/);
    if (artistMatch?.[1]) {
      return { type: 'artist', id: artistMatch[1] };
    }

    // Album/release: /album/<slug>/<id>
    const albumMatch = url.match(/\/album\/(?:[^/?#]+\/)?(\d+)/);
    if (albumMatch?.[1]) {
      return { type: 'release', id: albumMatch[1] };
    }

    // Standalone song URL: /song/<slug>/<id>
    const songMatch = url.match(/\/song\/(?:[^/?#]+\/)?(\d+)/);
    if (songMatch?.[1]) {
      return { type: 'track', id: songMatch[1] };
    }

    return null;
  }

  /**
   * Get or mint a developer token (ES256 JWT) used to authenticate catalog
   * requests. Tokens are cached in memory and refreshed shortly before expiry.
   */
  private getDeveloperToken(): string {
    if (
      this.developerToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date()
    ) {
      return this.developerToken;
    }

    const config = this.config as AppleMusicConfig;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expSeconds = nowSeconds + DEVELOPER_TOKEN_TTL_SECONDS;

    const header = { alg: 'ES256', kid: config.keyId };
    const payload = { iss: config.teamId, iat: nowSeconds, exp: expSeconds };

    const signingInput = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;

    let signature: Buffer;
    try {
      signature = sign('sha256', Buffer.from(signingInput), {
        key: this.getPrivateKeyObject(),
        dsaEncoding: 'ieee-p1363',
      });
    } catch (error) {
      throw new ProviderError(
        `Failed to sign Apple Music developer token: ${
          error instanceof Error ? error.message : String(error)
        }`,
        this.name
      );
    }

    this.developerToken = `${signingInput}.${signature.toString('base64url')}`;
    // Refresh 60 seconds before expiry
    this.tokenExpiresAt = new Date((expSeconds - 60) * 1000);

    this.logger.debug('Minted new Apple Music developer token', {
      expiresIn: DEVELOPER_TOKEN_TTL_SECONDS,
    });

    return this.developerToken;
  }

  /**
   * Lazily parse and cache the PEM private key. Supports keys stored in env
   * vars with escaped newlines (`\n`).
   */
  private getPrivateKeyObject(): KeyObject {
    if (this.privateKeyObject) return this.privateKeyObject;

    const config = this.config as AppleMusicConfig;
    const pem = config.privateKey.includes('\\n')
      ? config.privateKey.replace(/\\n/g, '\n')
      : config.privateKey;

    try {
      this.privateKeyObject = createPrivateKey(pem);
    } catch (error) {
      throw new ProviderError(
        `Invalid Apple Music private key: ${
          error instanceof Error ? error.message : String(error)
        }`,
        this.name
      );
    }

    return this.privateKeyObject;
  }

  /**
   * Make an authenticated request to the Apple Music catalog API.
   * Endpoints are relative to `/v1/catalog/{storefront}`.
   */
  private async fetchApi<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T | null> {
    const token = this.getDeveloperToken();
    const searchParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const url = `${APPLE_MUSIC_API}/v1/catalog/${this.storefront}${endpoint}${searchParams}`;

    this.logger.debug('Apple Music API request', { url });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      this.logger.warn('Apple Music API error response', {
        status: response.status,
        error: errorText,
      });

      if (response.status === 404) return null;
      if (response.status === 401 || response.status === 403) {
        // Token may be invalid/expired; clear it so the next call re-mints.
        this.developerToken = null;
        this.tokenExpiresAt = null;
        throw new HttpError(
          `Apple Music API authentication failed`,
          response.status,
          this.name
        );
      }
      throw new HttpError(
        `Apple Music API error: ${response.status} - ${errorText}`,
        response.status,
        this.name
      );
    }

    return response.json() as Promise<T>;
  }

  protected async _lookupReleaseByGtin(
    gtin: string
  ): Promise<HarmonizedRelease | null> {
    // Try the full GTIN, then without leading zeros for UPC/EAN compatibility.
    const candidates = [gtin];
    const cleaned = gtin.replace(/^0+/, '');
    if (cleaned !== gtin) candidates.push(cleaned);

    for (const upc of candidates) {
      const data = await this.fetchApi<AppleMusicDataResponse<AppleMusicAlbum>>(
        '/albums',
        { 'filter[upc]': upc }
      );

      const album = data?.data?.[0];
      if (album) {
        // Re-fetch by id to pick up the tracks/artists relationships.
        return this._lookupReleaseById(album.id);
      }
    }

    return null;
  }

  protected async _lookupReleaseById(
    id: string,
    _options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    const data = await this.fetchApi<AppleMusicDataResponse<AppleMusicAlbum>>(
      `/albums/${id}`,
      { include: 'tracks,artists' }
    );

    const album = data?.data?.[0];
    if (!album) return null;

    return this.transformAlbum(album);
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
    const data = await this.fetchApi<AppleMusicDataResponse<AppleMusicSong>>(
      '/songs',
      { 'filter[isrc]': isrc }
    );

    const song = data?.data?.[0];
    if (!song?.attributes) return null;

    return this.transformTrack(
      song,
      song.attributes.trackNumber ?? 1,
      song.attributes.discNumber
    );
  }

  protected async _lookupArtistById(
    id: string
  ): Promise<HarmonizedArtist | null> {
    const data = await this.fetchApi<AppleMusicDataResponse<AppleMusicArtist>>(
      `/artists/${id}`
    );

    const artist = data?.data?.[0];
    if (!artist?.attributes) return null;

    return this.transformArtist(artist);
  }

  protected override async _lookupTrackById(
    id: string
  ): Promise<HarmonizedTrack | null> {
    const data = await this.fetchApi<AppleMusicDataResponse<AppleMusicSong>>(
      `/songs/${id}`
    );

    const song = data?.data?.[0];
    if (!song?.attributes) return null;

    return this.transformTrack(
      song,
      song.attributes.trackNumber ?? 1,
      song.attributes.discNumber
    );
  }

  protected async _searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    const data = await this.search(query, 'albums', limit);
    const albums = data?.results?.albums?.data ?? [];
    return albums.map((album) => this.transformAlbum(album));
  }

  protected async _searchArtists(
    query: string,
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    const data = await this.search(query, 'artists', limit);
    const artists = data?.results?.artists?.data ?? [];
    return artists.map((artist) => this.transformArtist(artist));
  }

  protected async _searchTracks(
    query: string,
    limit = 25
  ): Promise<HarmonizedTrack[]> {
    const data = await this.search(query, 'songs', limit);
    const songs = data?.results?.songs?.data ?? [];
    return songs.map((song) =>
      this.transformTrack(
        song,
        song.attributes?.trackNumber ?? 1,
        song.attributes?.discNumber
      )
    );
  }

  private async search(
    query: string,
    type: 'albums' | 'artists' | 'songs',
    limit: number
  ): Promise<AppleMusicSearchResponse | null> {
    // Apple caps `limit` at 25 for search.
    return this.fetchApi<AppleMusicSearchResponse>('/search', {
      term: query,
      types: type,
      limit: String(Math.min(limit, 25)),
    });
  }

  // User-authenticated API methods

  /**
   * Make a user-scoped request to the Apple Music API (`/v1/me/...`).
   *
   * Apple requires two tokens: the developer token (minted internally and sent
   * as `Authorization: Bearer`) and the Music User Token (obtained client-side
   * via MusicKit and sent as `Music-User-Token`).
   */
  private async fetchUserApi<T>(
    endpoint: string,
    musicUserToken: string,
    params?: Record<string, string>
  ): Promise<T | null> {
    const developerToken = this.getDeveloperToken();
    const searchParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const url = `${APPLE_MUSIC_API}/v1/me${endpoint}${searchParams}`;

    this.logger.debug('Apple Music User API request', { url });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${developerToken}`,
        'Music-User-Token': musicUserToken,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      this.logger.warn('Apple Music User API error response', {
        status: response.status,
        error: errorText,
      });

      if (response.status === 404) return null;
      if (response.status === 401 || response.status === 403) {
        throw new HttpError(
          `Apple Music user authentication failed - Music User Token may be expired`,
          response.status,
          this.name
        );
      }
      throw new HttpError(
        `Apple Music User API error: ${response.status} - ${errorText}`,
        response.status,
        this.name
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get the current user's storefront as their provider "profile".
   *
   * Apple Music does not expose a public user profile (no display name, avatar,
   * or email), so the user's storefront is the closest available identity.
   * @param accessToken - The user's Music User Token
   */
  protected override async _getCurrentUser(
    accessToken: string
  ): Promise<HarmonizedUserProfile> {
    const data = await this.fetchUserApi<
      AppleMusicDataResponse<AppleMusicStorefront>
    >('/storefront', accessToken);

    const storefront = data?.data?.[0];
    if (!storefront) {
      throw new ProviderError(
        'Failed to fetch Apple Music storefront',
        this.name
      );
    }

    return {
      id: storefront.id,
      username: storefront.id,
      displayName: storefront.attributes?.name,
      country: storefront.id.toUpperCase(),
      provider: this.name,
      fetchedAt: new Date(),
      providerData: storefront.attributes as Record<string, unknown>,
    };
  }

  /**
   * Get the artists in the user's Apple Music library.
   *
   * Apple Music has no "followed artists" concept; library artists are the
   * closest analogue. Uses offset-based pagination.
   * @param accessToken - The user's Music User Token
   * @param params - Pagination parameters (limit, cursor=offset)
   */
  protected override async _getFollowedArtists(
    accessToken: string,
    params?: CollectionParams
  ): Promise<PaginatedCollection<HarmonizedArtist>> {
    const limit = params?.limit ?? 25;
    const queryParams: Record<string, string> = {
      limit: String(Math.min(limit, 100)),
      include: 'catalog',
    };
    if (params?.cursor) {
      queryParams['offset'] = params.cursor;
    }

    const data = await this.fetchUserApi<AppleMusicLibraryArtistsResponse>(
      '/library/artists',
      accessToken,
      queryParams
    );

    if (!data?.data?.length) {
      return { items: [], total: 0, nextCursor: null, hasMore: false };
    }

    const items = data.data.map((artist) =>
      this.transformLibraryArtist(artist)
    );

    const nextCursor = extractNextOffset(data.next);
    const result: PaginatedCollection<HarmonizedArtist> = {
      items,
      nextCursor,
      hasMore: nextCursor !== null,
    };
    if (data.meta?.total !== undefined) {
      result.total = data.meta.total;
    }
    return result;
  }

  /**
   * Get the user's library playlists.
   *
   * Apple Music has no separate "public playlists" endpoint; a library
   * playlist's `isPublic` attribute indicates whether the user has shared it.
   * When `params.publicOnly` is set, playlists are filtered to `isPublic`
   * ones client-side after fetching a page (see {@link PlaylistCollectionParams}
   * for the pagination caveat this implies).
   * @param accessToken - The user's Music User Token
   * @param params - Pagination parameters (limit, cursor=offset), plus `publicOnly`
   */
  protected override async _getPlaylists(
    accessToken: string,
    params?: PlaylistCollectionParams
  ): Promise<PaginatedCollection<HarmonizedPlaylist>> {
    const limit = params?.limit ?? 25;
    const queryParams: Record<string, string> = {
      limit: String(Math.min(limit, 100)),
    };
    if (params?.cursor) {
      queryParams['offset'] = params.cursor;
    }

    const data = await this.fetchUserApi<AppleMusicLibraryPlaylistsResponse>(
      '/library/playlists',
      accessToken,
      queryParams
    );

    if (!data?.data?.length) {
      return { items: [], total: 0, nextCursor: null, hasMore: false };
    }

    let items = data.data.map((playlist) =>
      this.transformLibraryPlaylist(playlist)
    );
    if (params?.publicOnly) {
      items = items.filter((playlist) => playlist.isPublic);
    }

    const nextCursor = extractNextOffset(data.next);
    const result: PaginatedCollection<HarmonizedPlaylist> = {
      items,
      nextCursor,
      hasMore: nextCursor !== null,
    };
    if (data.meta?.total !== undefined) {
      result.total = data.meta.total;
    }
    return result;
  }

  /**
   * Get the user's recently played tracks.
   *
   * Uses `/v1/me/recent/played/tracks`, which Apple caps at 10 items per
   * request (unlike most other endpoints, which allow up to 100); use
   * `params.cursor` (offset) to page through up to the last ~50 tracks Apple
   * retains. No play timestamp is exposed, only recency order.
   * @param accessToken - The user's Music User Token
   * @param params - Pagination parameters (limit capped at 10, cursor=offset)
   * @see https://developer.apple.com/documentation/applemusicapi/get-v1-me-recent-played-tracks
   */
  protected override async _getRecentlyPlayed(
    accessToken: string,
    params?: CollectionParams
  ): Promise<PaginatedCollection<HarmonizedListenHistoryItem>> {
    const limit = params?.limit ?? 10;
    const queryParams: Record<string, string> = {
      limit: String(Math.min(limit, 10)),
    };
    if (params?.cursor) {
      queryParams['offset'] = params.cursor;
    }

    const data =
      await this.fetchUserApi<AppleMusicRecentlyPlayedTracksResponse>(
        '/recent/played/tracks',
        accessToken,
        queryParams
      );

    if (!data?.data?.length) {
      return { items: [], nextCursor: null, hasMore: false };
    }

    const items: HarmonizedListenHistoryItem[] = data.data
      .filter((song): song is AppleMusicSong => song.attributes !== undefined)
      .map((song) => ({
        track: this.transformTrack(
          song,
          song.attributes?.trackNumber ?? 1,
          song.attributes?.discNumber
        ),
        provider: this.name,
      }));

    const nextCursor = extractNextOffset(data.next);
    return { items, nextCursor, hasMore: nextCursor !== null };
  }

  // Transformation methods

  private transformAlbum(raw: AppleMusicAlbum): HarmonizedRelease {
    const attrs = raw.attributes;
    const songs = raw.relationships?.tracks?.data ?? [];
    const albumArtwork = this.mapArtwork(attrs?.artwork);

    const tracks = songs
      .filter((song): song is AppleMusicSong => song.attributes !== undefined)
      .map((song) =>
        this.transformTrack(
          song,
          song.attributes?.trackNumber ?? 1,
          song.attributes?.discNumber,
          albumArtwork
        )
      );

    // Group tracks into media (discs)
    const discMap = new Map<number, HarmonizedTrack[]>();
    for (const track of tracks) {
      const discNum = track.discNumber ?? 1;
      if (!discMap.has(discNum)) {
        discMap.set(discNum, []);
      }
      discMap.get(discNum)!.push(track);
    }

    const media = Array.from(discMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([position, discTracks]) => ({
        position,
        tracks: discTracks.sort((a, b) => a.position - b.position),
      }));

    if (media.length === 0) {
      media.push({ position: 1, tracks: [] });
    }

    return {
      gtin: attrs?.upc,
      title: attrs?.name ?? '',
      titleNormalized: this.normalizeString(attrs?.name ?? ''),

      artists: this.buildArtistCredits(attrs?.artistName, raw.relationships),

      releaseDate: parseAppleDate(attrs?.releaseDate),
      releaseType: mapAlbumType(attrs),

      labels: attrs?.recordLabel ? [{ name: attrs.recordLabel }] : undefined,

      media,

      artwork: albumArtwork,

      genres: attrs?.genreNames?.length ? attrs.genreNames : undefined,

      externalIds: { [this.name]: raw.id },
      sources: [this.createSource(raw.id, attrs?.url)],

      mergedAt: new Date(),
      confidence: 0.9,
    };
  }

  private mapArtwork(artwork?: AppleMusicArtwork): Artwork[] | undefined {
    if (!artwork) return undefined;
    return [
      {
        url: resolveArtworkUrl(artwork),
        type: 'front' as const,
        width: artwork.width,
        height: artwork.height,
        provider: this.name,
      },
    ];
  }

  private transformTrack(
    raw: AppleMusicSong,
    position: number,
    discNumber?: number,
    parentArtwork?: Artwork[]
  ): HarmonizedTrack {
    const attrs = raw.attributes;

    // Apple songs usually carry their own artwork; fall back to the parent
    // release's artwork when they don't (e.g. nested album track relationships).
    const artwork = this.mapArtwork(attrs?.artwork) ?? parentArtwork;

    return {
      isrc: attrs?.isrc,
      title: attrs?.name ?? '',
      titleNormalized: this.normalizeString(attrs?.name ?? ''),
      position,
      discNumber,
      duration: attrs?.durationInMillis,
      explicit: attrs?.contentRating
        ? attrs.contentRating === 'explicit'
        : undefined,
      artists: this.buildArtistCredits(attrs?.artistName, raw.relationships),
      ...(artwork ? { artwork } : {}),
      externalIds: { [this.name]: raw.id },
      sources: [this.createSource(raw.id, attrs?.url)],
    };
  }

  private transformArtist(raw: AppleMusicArtist): HarmonizedArtist {
    const attrs = raw.attributes;

    return {
      name: attrs?.name ?? '',
      nameNormalized: this.normalizeString(attrs?.name ?? ''),
      genres: attrs?.genreNames?.length ? attrs.genreNames : undefined,
      images: attrs?.artwork
        ? [
            {
              url: resolveArtworkUrl(attrs.artwork),
              width: attrs.artwork.width,
              height: attrs.artwork.height,
              provider: this.name,
            },
          ]
        : undefined,
      externalIds: { [this.name]: raw.id },
      sources: [this.createSource(raw.id, attrs?.url)],
      mergedAt: new Date(),
      confidence: 0.9,
    };
  }

  /**
   * Transform a library artist, preferring the linked catalog artist (which
   * carries a stable catalog ID, genres, and a public URL) when available.
   */
  private transformLibraryArtist(
    raw: AppleMusicLibraryArtist
  ): HarmonizedArtist {
    const catalogArtist = raw.relationships?.catalog?.data?.[0];
    if (catalogArtist?.attributes?.name) {
      return this.transformArtist(catalogArtist);
    }

    const name = raw.attributes?.name ?? '';
    return {
      name,
      nameNormalized: this.normalizeString(name),
      externalIds: { [this.name]: raw.id },
      sources: [this.createSource(raw.id)],
      mergedAt: new Date(),
      confidence: 0.8,
    };
  }

  private transformLibraryPlaylist(
    raw: AppleMusicLibraryPlaylist
  ): HarmonizedPlaylist {
    const attrs = raw.attributes;
    const name = attrs?.name ?? '';

    const artwork = attrs?.artwork
      ? [
          {
            url: resolveArtworkUrl(attrs.artwork),
            type: 'front' as const,
            width: attrs.artwork.width,
            height: attrs.artwork.height,
            provider: this.name,
          },
        ]
      : undefined;

    const externalIds: Record<string, string> = { [this.name]: raw.id };
    const globalId = attrs?.playParams?.globalId;
    if (globalId) {
      // The catalog-equivalent id, useful for looking up the public playlist
      // via `/v1/catalog/{storefront}/playlists/{id}` when `hasCatalog` is true.
      externalIds[`${this.name}_catalog`] = globalId;
    }

    return {
      name,
      nameNormalized: this.normalizeString(name),
      description: attrs?.description?.standard,
      isPublic: attrs?.isPublic ?? false,
      artwork,
      externalIds,
      sources: [this.createSource(raw.id)],
      mergedAt: new Date(),
      confidence: 0.8,
    };
  }

  /**
   * Build artist credits, preferring the detailed `artists` relationship (which
   * carries stable IDs) and falling back to the `artistName` string that every
   * song/album attribute set includes.
   */
  private buildArtistCredits(
    artistName: string | undefined,
    relationships: AppleMusicAlbum['relationships']
  ): HarmonizedArtistCredit[] {
    const related = relationships?.artists?.data;
    if (related?.length) {
      const credits = related
        .filter((artist) => artist.attributes?.name)
        .map((artist) => ({
          name: artist.attributes!.name,
          externalIds: { [this.name]: artist.id },
        }));
      if (credits.length) return credits;
    }

    if (artistName) {
      return [{ name: artistName }];
    }

    return [];
  }
}

/** Base64url-encode a JSON object (JWT header/payload). */
function base64UrlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/**
 * Extract the next page's `offset` from Apple's `next` path (e.g.
 * `/v1/me/library/artists?offset=25`), as returned on paginated list
 * endpoints. Returns `null` when there is no further page.
 */
function extractNextOffset(next: string | undefined): string | null {
  if (!next) return null;
  const nextUrl = new URL(next, APPLE_MUSIC_API);
  return nextUrl.searchParams.get('offset');
}

/**
 * Apple returns artwork URLs with `{w}` and `{h}` placeholders that must be
 * replaced with concrete dimensions before the URL is usable.
 */
function resolveArtworkUrl(artwork: AppleMusicArtwork): string {
  const width = artwork.width ?? 1000;
  const height = artwork.height ?? 1000;
  return artwork.url
    .replace('{w}', String(width))
    .replace('{h}', String(height));
}

/** Parse Apple's release dates, which may be `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. */
function parseAppleDate(date?: string): PartialDate | undefined {
  if (!date) return undefined;
  const parts = date.split('-').map(Number);
  return {
    year: parts[0],
    month: parts[1],
    day: parts[2],
  };
}

/**
 * Apple Music has no explicit EP flag, but titles EPs with a " - EP" (or
 * "(EP)") suffix and singles with a " - Single" suffix. Combined with the
 * `isSingle`/`isCompilation` booleans, these let us classify releases more
 * precisely than defaulting everything to "album".
 */
const EP_TITLE_PATTERN = /\s[-–]\s*EP$|\(EP\)$/i;
const SINGLE_TITLE_PATTERN = /\s[-–]\s*Single$|\(Single\)$/i;

function mapAlbumType(attrs?: AppleMusicAlbumAttributes): ReleaseType {
  if (!attrs) return 'album';
  if (attrs.isCompilation) return 'compilation';

  const name = attrs.name ?? '';
  if (EP_TITLE_PATTERN.test(name)) return 'ep';
  if (attrs.isSingle || SINGLE_TITLE_PATTERN.test(name)) return 'single';

  return 'album';
}
