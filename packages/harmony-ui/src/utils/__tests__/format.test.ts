import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatPartialDate,
  formatArtistCredits,
  formatArtistNames,
  getPrimaryArtistName,
  formatTrackPosition,
  getFrontArtworkUrl,
  formatPlatformName,
} from '../format';

describe('formatDuration', () => {
  it('formats milliseconds to MM:SS', () => {
    expect(formatDuration(180000)).toBe('3:00');
    expect(formatDuration(225000)).toBe('3:45');
  });

  it('pads seconds with leading zero', () => {
    expect(formatDuration(65000)).toBe('1:05');
    expect(formatDuration(9000)).toBe('0:09');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(3600000)).toBe('1:00:00');
    expect(formatDuration(3661000)).toBe('1:01:01');
    expect(formatDuration(7325000)).toBe('2:02:05');
  });

  it('returns "--:--" for undefined', () => {
    expect(formatDuration(undefined)).toBe('--:--');
  });

  it('returns "--:--" for zero', () => {
    expect(formatDuration(0)).toBe('--:--');
  });

  it('returns "--:--" for NaN', () => {
    expect(formatDuration(NaN)).toBe('--:--');
  });

  it('returns "--:--" for Infinity', () => {
    expect(formatDuration(Infinity)).toBe('--:--');
  });

  it('handles edge cases at minute boundaries', () => {
    expect(formatDuration(60000)).toBe('1:00');
    expect(formatDuration(59999)).toBe('0:59');
  });
});

describe('formatPartialDate', () => {
  it('formats year only', () => {
    expect(formatPartialDate({ year: 2024 })).toBe('2024');
  });

  it('formats year and month', () => {
    expect(formatPartialDate({ year: 2024, month: 3 })).toBe('Mar 2024');
  });

  it('formats full date', () => {
    expect(formatPartialDate({ year: 2024, month: 3, day: 15 })).toBe('Mar 15 2024');
  });

  it('formats month and day without year', () => {
    expect(formatPartialDate({ month: 12, day: 25 })).toBe('Dec 25');
  });

  it('returns empty string for undefined', () => {
    expect(formatPartialDate(undefined)).toBe('');
  });

  it('returns empty string for empty object', () => {
    expect(formatPartialDate({})).toBe('');
  });

  it('handles all months correctly', () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((name, index) => {
      expect(formatPartialDate({ year: 2024, month: index + 1 })).toBe(`${name} 2024`);
    });
  });

  it('handles invalid month gracefully', () => {
    expect(formatPartialDate({ year: 2024, month: 13 })).toBe('2024');
    expect(formatPartialDate({ year: 2024, month: 0 })).toBe('2024');
  });
});

describe('formatArtistCredits', () => {
  it('formats single artist', () => {
    const credits = [{ name: 'Artist One' }];
    expect(formatArtistCredits(credits)).toBe('Artist One');
  });

  it('formats multiple artists with default comma separator', () => {
    const credits = [
      { name: 'Artist One' },
      { name: 'Artist Two' },
    ];
    expect(formatArtistCredits(credits)).toBe('Artist One, Artist Two');
  });

  it('uses custom join phrases', () => {
    const credits = [
      { name: 'Artist One', joinPhrase: ' & ' },
      { name: 'Artist Two' },
    ];
    expect(formatArtistCredits(credits)).toBe('Artist One & Artist Two');
  });

  it('prefers creditedName over name', () => {
    const credits = [
      { name: 'Real Name', creditedName: 'Stage Name' },
    ];
    expect(formatArtistCredits(credits)).toBe('Stage Name');
  });

  it('handles complex collaborations', () => {
    const credits = [
      { name: 'Artist One', joinPhrase: ' feat. ' },
      { name: 'Artist Two', joinPhrase: ' & ' },
      { name: 'Artist Three' },
    ];
    expect(formatArtistCredits(credits)).toBe('Artist One feat. Artist Two & Artist Three');
  });

  it('returns empty string for empty array', () => {
    expect(formatArtistCredits([])).toBe('');
  });
});

describe('formatArtistNames', () => {
  it('formats single artist', () => {
    const credits = [{ name: 'Artist One' }];
    expect(formatArtistNames(credits)).toBe('Artist One');
  });

  it('formats multiple artists with comma separator', () => {
    const credits = [
      { name: 'Artist One' },
      { name: 'Artist Two' },
      { name: 'Artist Three' },
    ];
    expect(formatArtistNames(credits)).toBe('Artist One, Artist Two, Artist Three');
  });

  it('ignores join phrases', () => {
    const credits = [
      { name: 'Artist One', joinPhrase: ' & ' },
      { name: 'Artist Two' },
    ];
    expect(formatArtistNames(credits)).toBe('Artist One, Artist Two');
  });

  it('prefers creditedName over name', () => {
    const credits = [
      { name: 'Real Name', creditedName: 'Stage Name' },
    ];
    expect(formatArtistNames(credits)).toBe('Stage Name');
  });

  it('returns empty string for empty array', () => {
    expect(formatArtistNames([])).toBe('');
  });
});

describe('getPrimaryArtistName', () => {
  it('returns first artist name', () => {
    const credits = [
      { name: 'Primary Artist' },
      { name: 'Featured Artist' },
    ];
    expect(getPrimaryArtistName(credits)).toBe('Primary Artist');
  });

  it('prefers creditedName over name', () => {
    const credits = [
      { name: 'Real Name', creditedName: 'Stage Name' },
    ];
    expect(getPrimaryArtistName(credits)).toBe('Stage Name');
  });

  it('returns "Unknown Artist" for empty array', () => {
    expect(getPrimaryArtistName([])).toBe('Unknown Artist');
  });
});

describe('formatTrackPosition', () => {
  it('formats simple position', () => {
    expect(formatTrackPosition(1)).toBe('1');
    expect(formatTrackPosition(10)).toBe('10');
  });

  it('includes disc number when > 1', () => {
    expect(formatTrackPosition(5, 2)).toBe('2.5');
    expect(formatTrackPosition(1, 3)).toBe('3.1');
  });

  it('ignores disc number 1', () => {
    expect(formatTrackPosition(5, 1)).toBe('5');
  });

  it('returns "-" for undefined position', () => {
    expect(formatTrackPosition(undefined)).toBe('-');
  });

  it('handles position 0', () => {
    expect(formatTrackPosition(0)).toBe('0');
  });
});

describe('getFrontArtworkUrl', () => {
  it('returns front artwork URL', () => {
    const artwork = [
      { url: 'https://example.com/back.jpg', type: 'back' },
      { url: 'https://example.com/front.jpg', type: 'front' },
    ];
    expect(getFrontArtworkUrl(artwork)).toBe('https://example.com/front.jpg');
  });

  it('falls back to first artwork if no front', () => {
    const artwork = [
      { url: 'https://example.com/back.jpg', type: 'back' },
      { url: 'https://example.com/other.jpg', type: 'other' },
    ];
    expect(getFrontArtworkUrl(artwork)).toBe('https://example.com/back.jpg');
  });

  it('returns undefined for empty array', () => {
    expect(getFrontArtworkUrl([])).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    expect(getFrontArtworkUrl(undefined)).toBeUndefined();
  });
});

describe('formatPlatformName', () => {
  it('formats known platforms', () => {
    expect(formatPlatformName('spotify')).toBe('Spotify');
    expect(formatPlatformName('musicbrainz')).toBe('MusicBrainz');
    expect(formatPlatformName('tidal')).toBe('Tidal');
    expect(formatPlatformName('apple')).toBe('Apple Music');
    expect(formatPlatformName('apple_music')).toBe('Apple Music');
    expect(formatPlatformName('deezer')).toBe('Deezer');
    expect(formatPlatformName('youtube')).toBe('YouTube Music');
    expect(formatPlatformName('youtube_music')).toBe('YouTube Music');
    expect(formatPlatformName('amazon_music')).toBe('Amazon Music');
    expect(formatPlatformName('soundcloud')).toBe('SoundCloud');
    expect(formatPlatformName('bandcamp')).toBe('Bandcamp');
    expect(formatPlatformName('discogs')).toBe('Discogs');
  });

  it('is case insensitive', () => {
    expect(formatPlatformName('SPOTIFY')).toBe('Spotify');
    expect(formatPlatformName('Spotify')).toBe('Spotify');
    expect(formatPlatformName('SpOtIfY')).toBe('Spotify');
  });

  it('returns original for unknown platforms', () => {
    expect(formatPlatformName('unknown_platform')).toBe('unknown_platform');
    expect(formatPlatformName('NewService')).toBe('NewService');
  });
});
