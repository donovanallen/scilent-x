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
import { HttpError } from '../errors/index';

const MB_API = 'https://musicbrainz.org/ws/2';

export interface MusicBrainzConfig extends ProviderConfig {
  appName: string;
  appVersion: string;
  contact: string;
}

interface MusicBrainzArtistCredit {
  artist?: { id?: string; name?: string };
  name?: string;
  joinphrase?: string;
}

interface MusicBrainzRecording {
  id: string;
  title: string;
  length?: number;
  isrcs?: string[];
  'artist-credit'?: MusicBrainzArtistCredit[];
}

interface MusicBrainzTrack {
  recording?: MusicBrainzRecording;
  title?: string;
  id?: string;
  length?: number;
}

interface MusicBrainzMedia {
  format?: string;
  tracks?: MusicBrainzTrack[];
}

interface MusicBrainzLabelInfo {
  label?: { name?: string };
  'catalog-number'?: string;
}

interface MusicBrainzReleaseGroup {
  'primary-type'?: string;
}

interface MusicBrainzGenre {
  name: string;
}

interface MusicBrainzRelease {
  id: string;
  title: string;
  barcode?: string;
  disambiguation?: string;
  'artist-credit'?: MusicBrainzArtistCredit[];
  date?: string;
  'release-group'?: MusicBrainzReleaseGroup;
  status?: string;
  'label-info'?: MusicBrainzLabelInfo[];
  country?: string;
  media?: MusicBrainzMedia[];
  genres?: MusicBrainzGenre[];
}

interface MusicBrainzAlias {
  name: string;
}

interface MusicBrainzArtist {
  id: string;
  name: string;
  'sort-name'?: string;
  disambiguation?: string;
  type?: string;
  country?: string;
  'life-span'?: { begin?: string; end?: string };
  aliases?: MusicBrainzAlias[];
  genres?: MusicBrainzGenre[];
}

export class MusicBrainzProvider extends BaseProvider {
  readonly name = 'musicbrainz';
  readonly displayName = 'MusicBrainz';
  readonly priority = 100;

  private userAgent: string;

  constructor(config: MusicBrainzConfig) {
    super(config);
    this.userAgent = `${config.appName}/${config.appVersion} (${config.contact})`;
    this.initializeLogger();
  }

  canHandleUrl(url: string): boolean {
    return /musicbrainz\.org/.test(url);
  }

  parseUrl(url: string): ParsedUrl | null {
    const patterns: Record<string, RegExp> = {
      release: /musicbrainz\.org\/release\/([a-f0-9-]{36})/,
      artist: /musicbrainz\.org\/artist\/([a-f0-9-]{36})/,
      track: /musicbrainz\.org\/recording\/([a-f0-9-]{36})/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return { type: type as ParsedUrl['type'], id: match[1] };
      }
    }
    return null;
  }

  protected async _lookupReleaseByGtin(
    gtin: string
  ): Promise<HarmonizedRelease | null> {
    const url = `${MB_API}/release?query=barcode:${gtin}&fmt=json`;
    const data = (await this.fetch(url)) as { releases?: MusicBrainzRelease[] };

    if (!data?.releases?.length) return null;
    const firstRelease = data.releases[0];
    if (!firstRelease) return null;
    return this._lookupReleaseById(firstRelease.id);
  }

  protected async _lookupReleaseById(
    id: string,
    _options?: LookupOptions
  ): Promise<HarmonizedRelease | null> {
    const inc = 'artist-credits+labels+recordings+release-groups+genres';
    const url = `${MB_API}/release/${id}?inc=${inc}&fmt=json`;

    const data = (await this.fetch(url)) as MusicBrainzRelease | null;
    if (!data) return null;

    return this.transformRelease(data);
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
    const url = `${MB_API}/isrc/${isrc}?inc=artist-credits&fmt=json`;
    const data = (await this.fetch(url)) as {
      recordings?: MusicBrainzRecording[];
    } | null;

    if (!data?.recordings?.length) return null;
    const firstRecording = data.recordings[0];
    if (!firstRecording) return null;
    return this.transformTrack(firstRecording, 1);
  }

  protected async _lookupArtistById(
    id: string
  ): Promise<HarmonizedArtist | null> {
    const url = `${MB_API}/artist/${id}?inc=aliases+genres&fmt=json`;
    const data = (await this.fetch(url)) as MusicBrainzArtist | null;

    if (!data) return null;
    return this.transformArtist(data);
  }

  protected async _searchReleases(
    query: string,
    limit = 25
  ): Promise<HarmonizedRelease[]> {
    const url = `${MB_API}/release?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`;
    const data = (await this.fetch(url)) as {
      releases?: MusicBrainzRelease[];
    } | null;

    return (data?.releases ?? []).map((r) => this.transformRelease(r));
  }

  protected async _searchArtists(
    query: string,
    limit = 25
  ): Promise<HarmonizedArtist[]> {
    const url = `${MB_API}/artist?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`;
    const data = (await this.fetch(url)) as {
      artists?: MusicBrainzArtist[];
    } | null;

    return (data?.artists ?? []).map((a) => this.transformArtist(a));
  }

  protected async _searchTracks(
    query: string,
    limit = 25
  ): Promise<HarmonizedTrack[]> {
    const url = `${MB_API}/recording?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`;
    const data = (await this.fetch(url)) as {
      recordings?: MusicBrainzRecording[];
    } | null;

    return (data?.recordings ?? []).map((r, i) =>
      this.transformTrack(r, i + 1)
    );
  }

  private async fetch(url: string): Promise<unknown> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new HttpError(
        `MusicBrainz API error: ${response.status}`,
        response.status,
        this.name
      );
    }

    return response.json() as Promise<unknown>;
  }

  private transformRelease(raw: MusicBrainzRelease): HarmonizedRelease {
    return {
      gtin: raw.barcode ?? undefined,
      title: raw.title,
      titleNormalized: this.normalizeString(raw.title),
      disambiguation: raw.disambiguation,

      artists: (raw['artist-credit'] ?? []).map((ac) =>
        this.transformArtistCredit(ac)
      ),

      releaseDate: this.parseDate(raw.date),
      releaseType: this.mapReleaseType(raw['release-group']?.['primary-type']),
      status: this.mapStatus(raw.status),

      labels: (raw['label-info'] ?? [])
        .filter((li) => li.label?.name)
        .map((li) => ({
          name: li.label!.name!,
          catalogNumber: li['catalog-number'],
        })),

      releaseCountry: raw.country,

      media: (raw.media ?? []).map((m, i) => ({
        format: m.format,
        position: i + 1,
        tracks: (m.tracks ?? []).map((t, ti) =>
          this.transformTrack(t.recording ?? t, ti + 1, i + 1)
        ),
      })),

      genres: (raw.genres ?? []).map((g) => g.name),

      externalIds: { musicbrainz: raw.id },
      sources: [
        this.createSource(raw.id, `https://musicbrainz.org/release/${raw.id}`),
      ],

      mergedAt: new Date(),
      confidence: 1.0,
    };
  }

  private transformTrack(
    raw: MusicBrainzRecording | MusicBrainzTrack,
    position: number,
    discNumber?: number
  ): HarmonizedTrack {
    // Handle both Recording and Track types
    const recording = 'recording' in raw && raw.recording ? raw.recording : raw;
    const id = 'id' in recording ? recording.id : '';
    const title = 'title' in recording ? recording.title : '';
    const length =
      'length' in recording
        ? recording.length
        : 'length' in raw
          ? raw.length
          : undefined;
    const isrcs = 'isrcs' in recording ? recording.isrcs : undefined;
    const artistCredit =
      'artist-credit' in recording ? recording['artist-credit'] : undefined;

    return {
      isrc: isrcs?.[0],
      title: title ?? '',
      titleNormalized: this.normalizeString(title ?? ''),
      position,
      discNumber,
      duration: length,
      artists: (artistCredit ?? []).map((ac) => this.transformArtistCredit(ac)),
      externalIds: { musicbrainz: id ?? '' },
      sources: [
        this.createSource(
          id ?? '',
          `https://musicbrainz.org/recording/${id ?? ''}`
        ),
      ],
    };
  }

  private transformArtist(raw: MusicBrainzArtist): HarmonizedArtist {
    return {
      name: raw.name,
      nameNormalized: this.normalizeString(raw.name),
      sortName: raw['sort-name'],
      disambiguation: raw.disambiguation,
      type: this.mapArtistType(raw.type),
      country: raw.country,
      beginDate: this.parseDate(raw['life-span']?.begin),
      endDate: this.parseDate(raw['life-span']?.end),
      aliases: (raw.aliases ?? []).map((a) => a.name),
      genres: (raw.genres ?? []).map((g) => g.name),
      externalIds: { musicbrainz: raw.id },
      sources: [
        this.createSource(raw.id, `https://musicbrainz.org/artist/${raw.id}`),
      ],
      mergedAt: new Date(),
      confidence: 1.0,
    };
  }

  private transformArtistCredit(
    ac: MusicBrainzArtistCredit
  ): HarmonizedArtistCredit {
    return {
      name: ac.artist?.name ?? ac.name ?? '',
      creditedName:
        ac.name !== ac.artist?.name ? (ac.name ?? undefined) : undefined,
      joinPhrase: ac.joinphrase,
      externalIds: ac.artist?.id ? { musicbrainz: ac.artist.id } : {},
    };
  }

  private parseDate(dateStr?: string): PartialDate | undefined {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    return {
      year: year ?? undefined,
      month: month ?? undefined,
      day: day ?? undefined,
    };
  }

  private mapReleaseType(type?: string): ReleaseType {
    const map: Record<string, ReleaseType> = {
      Album: 'album',
      Single: 'single',
      EP: 'ep',
      Compilation: 'compilation',
      Soundtrack: 'soundtrack',
      Live: 'live',
      Remix: 'remix',
    };
    return map[type ?? ''] ?? 'other';
  }

  private mapStatus(status?: string): HarmonizedRelease['status'] | undefined {
    if (!status) return undefined;
    const normalized = status.toLowerCase();
    if (
      normalized === 'official' ||
      normalized === 'promotional' ||
      normalized === 'bootleg' ||
      normalized === 'pseudo-release'
    ) {
      return normalized as HarmonizedRelease['status'];
    }
    return undefined;
  }

  private mapArtistType(type?: string): HarmonizedArtist['type'] | undefined {
    if (!type) return undefined;
    const normalized = type.toLowerCase();
    if (
      normalized === 'person' ||
      normalized === 'group' ||
      normalized === 'orchestra' ||
      normalized === 'choir' ||
      normalized === 'character' ||
      normalized === 'other'
    ) {
      return normalized as HarmonizedArtist['type'];
    }
    return undefined;
  }
}
