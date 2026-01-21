import { describe, it, expect } from 'vitest';
import {
  PLACEHOLDER_ALBUM_ART,
  PLACEHOLDER_ALBUM_ART_SM,
  PLACEHOLDER_ARTIST_IMAGE,
  mockArtist,
  mockArtistCredit,
  mockArtistCredit2,
  mockDoubleAlbum,
  mockEP,
  mockRelease,
  mockReleases,
  mockSingle,
  mockSoloArtist,
  mockTrack,
  mockTrackExplicit,
  mockTracks,
} from '../mock-data';

describe('placeholder artwork URLs', () => {
  it('provides album and artist placeholders', () => {
    expect(PLACEHOLDER_ALBUM_ART).toContain('placehold.co');
    expect(PLACEHOLDER_ALBUM_ART).toContain('Album');
    expect(PLACEHOLDER_ALBUM_ART_SM).toContain('Album');
    expect(PLACEHOLDER_ARTIST_IMAGE).toContain('Artist');
  });
});

describe('mockArtistCredit data', () => {
  it('defines base artist credits', () => {
    expect(mockArtistCredit.name).toBe('Radiohead');
    expect(mockArtistCredit.externalIds.spotify).toBe('4Z8W4fKeB5YxbusRsdQVPb');
    expect(mockArtistCredit2.name).toBe('Thom Yorke');
  });
});

describe('mockTrack data', () => {
  it('defines a base harmonized track', () => {
    expect(mockTrack.title).toBe('Everything In Its Right Place');
    expect(mockTrack.artists[0]).toBe(mockArtistCredit);
    expect(mockTrack.externalIds.spotify).toBe('3bLZ40X6XlhgD4wF2FoC3V');
    expect(mockTrack.sources).toHaveLength(2);
    expect(mockTrack.sources[0].fetchedAt).toBeInstanceOf(Date);
    expect(mockTrack.sources[1].fetchedAt).toBeInstanceOf(Date);
  });

  it('defines an explicit track variant', () => {
    expect(mockTrackExplicit.explicit).toBe(true);
    expect(mockTrackExplicit.title).toBe('The National Anthem');
    expect(mockTrackExplicit.credits).toHaveLength(5);
    expect(mockTrackExplicit.externalIds.spotify).toBe('2UmyXUGhqiGPq3GHZxhFg2');
  });

  it('collects track samples for list displays', () => {
    expect(mockTracks[0]).toBe(mockTrack);
    expect(mockTracks[1]).toBe(mockTrackExplicit);
    expect(mockTracks).toHaveLength(5);
    expect(mockTracks[2].sources[0].provider).toBe('spotify');
  });
});

describe('mock artist data', () => {
  it('defines a group artist', () => {
    expect(mockArtist.type).toBe('group');
    expect(mockArtist.nameNormalized).toBe('radiohead');
    expect(mockArtist.sources).toHaveLength(2);
    expect(mockArtist.sources[0].fetchedAt).toBeInstanceOf(Date);
  });

  it('defines a solo artist', () => {
    expect(mockSoloArtist.type).toBe('person');
    expect(mockSoloArtist.externalIds.spotify).toBe('4CvTDPKA6W06DRfBnZKrau');
    expect(mockSoloArtist.sources[0].fetchedAt).toBeInstanceOf(Date);
  });
});

describe('mock release data', () => {
  it('defines a primary release with artwork and media', () => {
    expect(mockRelease.releaseType).toBe('album');
    expect(mockRelease.media[0].tracks).toBe(mockTracks);
    expect(mockRelease.artwork[0].url).toBe(PLACEHOLDER_ALBUM_ART);
    expect(mockRelease.genres).toContain('Alternative Rock');
  });

  it('defines a single and EP release', () => {
    expect(mockSingle.releaseType).toBe('single');
    expect(mockSingle.media[0].tracks[0].title).toBe('Creep');
    expect(mockEP.releaseType).toBe('ep');
    expect(mockEP.media[0].tracks).toHaveLength(2);
  });

  it('collects releases for listings', () => {
    expect(mockReleases[0]).toBe(mockRelease);
    expect(mockReleases).toHaveLength(6);
    expect(mockReleases.slice(-2)).toEqual([mockSingle, mockEP]);
  });
});

describe('mockDoubleAlbum data', () => {
  it('defines a multi-disc release', () => {
    expect(mockDoubleAlbum.media).toHaveLength(2);
    expect(mockDoubleAlbum.media[0].tracks[0].discNumber).toBe(1);
    expect(mockDoubleAlbum.media[1].tracks[0].discNumber).toBe(2);
    expect(mockDoubleAlbum.media[1].tracks[0].isrc).toBe('DISC2-0');
    expect(mockDoubleAlbum.media[1].tracks[0].externalIds.spotify).toBe('disc2-0');
  });
});
