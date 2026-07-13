import type { PostType, ReviewSubjectType } from '@scilent-one/db';

export interface ReviewSubjectInput {
  type: ReviewSubjectType;
  gtin?: string;
  isrc?: string;
  mbid?: string;
  snapshot: unknown;
  artworkUrl?: string;
  title?: string;
  artistLabel?: string;
  releaseDate?: string;
}

export interface ResolvedReviewSubject {
  type: ReviewSubjectType;
  gtin?: string;
  isrc?: string;
  mbid?: string;
  title: string;
  artistLabel?: string;
  artworkUrl?: string;
  releaseDate?: string;
  snapshot: unknown;
}

export function formatPartialDateString(
  date: { year?: number; month?: number; day?: number } | undefined
): string | undefined {
  if (!date?.year) return undefined;
  const parts: string[] = [date.year.toString()];
  if (date.month) {
    parts.push(date.month.toString().padStart(2, '0'));
  }
  if (date.day) {
    parts.push(date.day.toString().padStart(2, '0'));
  }
  return parts.join('-');
}

export function getPrimaryArtistFromCredits(
  credits: Array<{ name: string; creditedName?: string }>
): string {
  const first = credits[0];
  if (!first) return 'Unknown Artist';
  return first.creditedName || first.name;
}

export function getCanonicalKey(subject: {
  type: ReviewSubjectType;
  gtin?: string | null;
  isrc?: string | null;
  mbid?: string | null;
}): string | null {
  if (subject.type === 'RELEASE') {
    return subject.gtin ?? subject.mbid ?? null;
  }
  return subject.isrc ?? subject.mbid ?? null;
}

export function buildReviewSubjectFromSnapshot(
  type: ReviewSubjectType,
  snapshot: {
    title: string;
    gtin?: string;
    isrc?: string;
    artists: Array<{ name: string; creditedName?: string }>;
    releaseDate?: { year?: number; month?: number; day?: number };
    externalIds?: Record<string, string>;
  },
  artworkUrl?: string
): ReviewSubjectInput {
  if (type === 'RELEASE') {
    const gtin = snapshot.gtin;
    const mbid = snapshot.externalIds?.musicbrainz;

    if (!gtin && !mbid) {
      throw new Error('Release must have a GTIN or MusicBrainz ID');
    }

    const releaseDate = formatPartialDateString(snapshot.releaseDate);

    return {
      type: 'RELEASE' as ReviewSubjectType,
      ...(gtin ? { gtin } : {}),
      ...(mbid ? { mbid } : {}),
      snapshot,
      ...(artworkUrl ? { artworkUrl } : {}),
      title: snapshot.title,
      artistLabel: getPrimaryArtistFromCredits(snapshot.artists),
      ...(releaseDate ? { releaseDate } : {}),
    };
  }

  const isrc = snapshot.isrc;
  const mbid = snapshot.externalIds?.musicbrainz;

  if (!isrc && !mbid) {
    throw new Error('Track must have an ISRC or MusicBrainz ID');
  }

  return {
    type: 'TRACK' as ReviewSubjectType,
    ...(isrc ? { isrc } : {}),
    ...(mbid ? { mbid } : {}),
    snapshot,
    ...(artworkUrl ? { artworkUrl } : {}),
    title: snapshot.title,
    artistLabel: getPrimaryArtistFromCredits(snapshot.artists),
  };
}
