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
  ReleaseType,
  PartialDate,
} from '../types/index';
import { HttpError, ProviderError } from '../errors/index';

const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_API = 'https://accounts.spotify.com/api/token';

/**
 * Configuration for the Spotify provider.
 * Requires client credentials from the Spotify Developer Dashboard.
 * @see https://developer.spotify.com/documentation/web-api
 */
export interface SpotifyConfig extends ProviderConfig {
  /** Spotify application client ID */
  clientId: string;
  /** Spotify application client secret */
  clientSecret: string;
}

// Spotify API response types
interface SpotifyImage {
  url: string;
  width?: number;
  height?: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  external_urls?: { spotify?: string };
  followers?: { total: number };
  popularity?: number;
}

interface SpotifyExternalIds {
  isrc?: string;
  upc?: string;
  ean?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  track_number: number;
  disc_number: number;
  artists: SpotifyArtist[];
  external_ids?: SpotifyExternalIds;
  external_urls?: { spotify?: string };
  preview_url?: string;
}

interface SpotifyAlbumTracks {
  items: SpotifyTrack[];
  total: number;
  next?: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  genres: string[];
  label?: string;
  tracks?: SpotifyAlbumTracks;
  external_ids?: SpotifyExternalIds;
  external_urls?: { spotify?: string };
  total_tracks: number;
  copyrights?: Array<{ text: string; type: string }>;
  available_markets?: string[];
}

interface SpotifySearchResponse {
  albums?: { items: SpotifyAlbum[]; total: number };
  artists?: { items: SpotifyArtist[]; total: number };
  tracks?: { items: SpotifyTrack[]; total: number };
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Spotify metadata provider using the Spotify Web API.
 *
 * Features:
 * - OAuth2 Client Credentials authentication
 * - Album, track, and artist lookups
 * - ISRC-based track search
 * - UPC/EAN lookup for albums
 * - Artwork retrieval
 *
 * @see https://developer.spotify.com/documentation/web-api
 */
export class SpotifyProvider extends BaseProvider {
  readonly name = 'spotify';
  readonly displayName = 'Spotify';
  readonly priority = 80;

  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(config: SpotifyConfig) {
    super(config);
    this.initializeLogger();
  }

  canHandleUrl(url: string): boolean {
    return /open\.spotify\.com/.test(url) || /^spotify:/.test(url);
  }

  parseUrl(url: string): ParsedUrl | null {
    // Handle both URLs and URIs
    // URLs: https://open.spotify.com/album/xyz, https://open.spotify.com/track/xyz
    // URIs: spotify:album:xyz, spotify:track:xyz
    const patterns: Record<ParsedUrl['type'], RegExp> = {
      release: /(?:album[/:]|\/album\/)([a-zA-Z0-9]+)/,
      track: /(?:track[/:]|\/track\/)([a-zA-Z0-9]+)/,
      artist: /(?:artist[/:]|\/artist\/)([a-zA-Z0-9]+)/,
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

    const config = this.config as SpotifyConfig;
    const credentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString('base64');

    const response = await fetch(SPOTIFY_ACCOUNTS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new ProviderError(
        `Failed to obtain Spotify access token: ${response.status}`,
        this.name
      );
    }

    const data = (await response.json()) as SpotifyTokenResponse;
    this.accessToken = data.access_token;
    // Refresh 60 seconds before expiry
    this.tokenExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);

    this.logger.debug('Obtained new Spotify access token', {
      expiresIn: data.expires_in,
    });

    return this.accessToken;
  }

  /**
   * Make an authenticated request to the Spotify API.
   */
  private async fetchApi<T>(endpoint: string): Promise<T | null> {
    const token = await this.getAccessToken();
    const url = `${SPOTIFY_API}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      if (response.status === 401) {
        // Token might be expired, clear it and retry once
        this.accessToken = null;
        this.tokenExpiresAt = null;
        throw new HttpError(
          `Spotify API authentication failed`,
          response.status,
          this.name
        );
      }
      throw new HttpError(
        `Spotify API error: ${response.status}`,
        response.status,
        this.name
      );
    }

    return response.json() as Promise<T>;
  }

  protected async _lookupReleaseByGtin(
    gtin: string
  ): Promise<HarmonizedRelease | null> {
    // Spotify supports UPC lookup via search
    // Try both with and without leading zeros for EAN/UPC compatibility
    const searchQueries = [`upc:${gtin}`, `upc:${gtin.replace(/^0+/, '')}`];

    for (const query of searchQueries) {
      const data = await this.fetchApi<SpotifySearchResponse>(
        `/search?q=${encodeURIComponent(query)}&type=album&limit=1`
      );

      if (data?.albums?.items?.length) {
        const album = data.albums.items[0];
        if (album) {
          // Fetch full album details to get tracks
          return this._lookupReleaseById(album.id);
        }
      }
    }

    return null;
  }

  protected async _lookupReleaseById(
    id: string,
    _options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    const data = await this.fetchApi<SpotifyAlbum>(`/albums/${id}`);
    if (!data) return null;

    return this.transformAlbum(data);
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
    const data = await this.fetchApi<SpotifySearchResponse>(
      `/search?q=isrc:${encodeURIComponent(isrc)}&type=track&limit=1`
    );

    if (!data?.tracks?.items?.length) return null;

    const track = data.tracks.items[0];
    if (!track) return null;

    return this.transformTrack(track, track.track_number, track.disc_number);
  }

  protected async _lookupArtistById(
    id: string
  ): Promise<HarmonizedArtist | null> {
    const data = await this.fetchApi<SpotifyArtist>(`/artists/${id}`);
    if (!data) return null;

    return this.transformArtist(data);
  }

  protected async _searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    const data = await this.fetchApi<SpotifySearchResponse>(
      `/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`
    );

    if (!data?.albums?.items) return [];

    return data.albums.items.map((album) => this.transformAlbum(album));
  }

  protected async _searchArtists(
    query: string,
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    const data = await this.fetchApi<SpotifySearchResponse>(
      `/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`
    );

    if (!data?.artists?.items) return [];

    return data.artists.items.map((artist) => this.transformArtist(artist));
  }

  protected async _searchTracks(
    query: string,
    limit = 25
  ): Promise<HarmonizedTrack[]> {
    const data = await this.fetchApi<SpotifySearchResponse>(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
    );

    if (!data?.tracks?.items) return [];

    return data.tracks.items.map((track) =>
      this.transformTrack(track, track.track_number, track.disc_number)
    );
  }

  // Transformation methods

  private transformAlbum(raw: SpotifyAlbum): HarmonizedRelease {
    const tracks: HarmonizedTrack[] = [];

    // Group tracks by disc
    if (raw.tracks?.items) {
      for (const track of raw.tracks.items) {
        tracks.push(
          this.transformTrack(track, track.track_number, track.disc_number)
        );
      }
    }

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

    // If no tracks are available, create an empty media entry
    if (media.length === 0) {
      media.push({ position: 1, tracks: [] });
    }

    return {
      gtin: raw.external_ids?.upc ?? raw.external_ids?.ean,
      title: raw.name,
      titleNormalized: this.normalizeString(raw.name),

      artists: raw.artists.map((a) => this.transformArtistCredit(a)),

      releaseDate: this.parseSpotifyDate(
        raw.release_date,
        raw.release_date_precision
      ),
      releaseType: this.mapAlbumType(raw.album_type),

      labels: raw.label ? [{ name: raw.label }] : undefined,

      availableCountries: raw.available_markets,

      media,

      artwork: raw.images?.map((img) => ({
        url: img.url,
        type: 'front' as const,
        width: img.width,
        height: img.height,
        provider: 'spotify',
      })),

      genres: raw.genres?.length ? raw.genres : undefined,

      externalIds: { spotify: raw.id },
      sources: [this.createSource(raw.id, raw.external_urls?.spotify)],

      mergedAt: new Date(),
      confidence: 0.9,
    };
  }

  private transformTrack(
    raw: SpotifyTrack,
    position: number,
    discNumber?: number
  ): HarmonizedTrack {
    return {
      isrc: raw.external_ids?.isrc,
      title: raw.name,
      titleNormalized: this.normalizeString(raw.name),
      position,
      discNumber,
      duration: raw.duration_ms,
      explicit: raw.explicit,
      artists: raw.artists.map((a) => this.transformArtistCredit(a)),
      externalIds: { spotify: raw.id },
      sources: [this.createSource(raw.id, raw.external_urls?.spotify)],
    };
  }

  private transformArtist(raw: SpotifyArtist): HarmonizedArtist {
    return {
      name: raw.name,
      nameNormalized: this.normalizeString(raw.name),
      genres: raw.genres?.length ? raw.genres : undefined,
      externalIds: { spotify: raw.id },
      sources: [this.createSource(raw.id, raw.external_urls?.spotify)],
      mergedAt: new Date(),
      confidence: 0.9,
    };
  }

  private transformArtistCredit(raw: SpotifyArtist): HarmonizedArtistCredit {
    return {
      name: raw.name,
      externalIds: { spotify: raw.id },
    };
  }

  private parseSpotifyDate(
    date: string,
    precision: 'year' | 'month' | 'day'
  ): PartialDate | undefined {
    if (!date) return undefined;
    const parts = date.split('-').map(Number);
    return {
      year: parts[0],
      month: precision !== 'year' ? parts[1] : undefined,
      day: precision === 'day' ? parts[2] : undefined,
    };
  }

  private mapAlbumType(type: string): ReleaseType {
    const map: Record<string, ReleaseType> = {
      album: 'album',
      single: 'single',
      compilation: 'compilation',
      ep: 'ep',
    };
    return map[type.toLowerCase()] ?? 'other';
  }
}
