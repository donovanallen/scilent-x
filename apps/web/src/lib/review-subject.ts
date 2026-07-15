import {
  type HarmonizedRelease,
  type HarmonizedTrack,
  HarmonizedReleaseSchema,
  HarmonizedTrackSchema,
  resolveArtworkUrl,
  getMusicBrainzReleaseMbid,
} from '@scilent-one/harmony-engine';
import type { ReviewSubjectInput } from '@scilent-one/social';
import {
  buildReviewSubjectFromSnapshot,
  getPrimaryArtistFromCredits,
} from '@scilent-one/social';

import { getHarmonizationEngine } from './harmonization';

export interface ResolveReviewSubjectParams {
  url?: string;
  gtin?: string;
  isrc?: string;
  type?: 'RELEASE' | 'TRACK';
}

export interface ResolvedReviewSubjectResult extends ReviewSubjectInput {
  title: string;
  artistLabel: string;
}

async function resolveReleaseArtwork(
  release: HarmonizedRelease
): Promise<string | undefined> {
  const mbid = getMusicBrainzReleaseMbid(release);
  return resolveArtworkUrl({
    ...(release.artwork ? { artwork: release.artwork } : {}),
    ...(mbid ? { musicbrainzReleaseMbid: mbid } : {}),
  });
}

function toResult(
  built: ReviewSubjectInput,
  title: string,
  artistLabel: string,
  artworkUrl?: string
): ResolvedReviewSubjectResult {
  return {
    ...built,
    title,
    artistLabel,
    ...(artworkUrl ? { artworkUrl } : {}),
  };
}

export async function resolveReviewSubject(
  params: ResolveReviewSubjectParams
): Promise<ResolvedReviewSubjectResult> {
  const engine = await getHarmonizationEngine();

  if (params.url) {
    const trackResult = await engine.lookupTrackByUrl(params.url);
    if (trackResult.data) {
      const track = HarmonizedTrackSchema.parse(trackResult.data);
      const artworkUrl = await resolveTrackArtwork(track);
      const built = buildReviewSubjectFromSnapshot(
        'TRACK',
        track as Parameters<typeof buildReviewSubjectFromSnapshot>[1],
        artworkUrl
      );
      return toResult(
        built,
        track.title,
        getPrimaryArtistFromCredits(
          track.artists as Parameters<typeof getPrimaryArtistFromCredits>[0]
        ),
        artworkUrl
      );
    }

    const releaseResult = await engine.lookupByUrl(params.url);
    if (releaseResult.data) {
      const release = HarmonizedReleaseSchema.parse(releaseResult.data);
      const artworkUrl = await resolveReleaseArtwork(release);
      const built = buildReviewSubjectFromSnapshot(
        'RELEASE',
        release as Parameters<typeof buildReviewSubjectFromSnapshot>[1],
        artworkUrl
      );
      return toResult(
        built,
        release.title,
        getPrimaryArtistFromCredits(
          release.artists as Parameters<typeof getPrimaryArtistFromCredits>[0]
        ),
        artworkUrl
      );
    }

    throw new Error('Could not resolve music from URL');
  }

  if (params.isrc || params.type === 'TRACK') {
    if (!params.isrc) {
      throw new Error('ISRC is required for track reviews');
    }

    const trackResult = await engine.lookupByIsrc(params.isrc);
    if (!trackResult.data) {
      throw new Error('Track not found');
    }

    const track = HarmonizedTrackSchema.parse(trackResult.data);
    const artworkUrl = await resolveTrackArtwork(track);
    const built = buildReviewSubjectFromSnapshot(
      'TRACK',
      track as Parameters<typeof buildReviewSubjectFromSnapshot>[1],
      artworkUrl
    );
    return toResult(
      built,
      track.title,
      getPrimaryArtistFromCredits(
        track.artists as Parameters<typeof getPrimaryArtistFromCredits>[0]
      ),
      artworkUrl
    );
  }

  if (params.gtin || params.type === 'RELEASE') {
    if (!params.gtin) {
      throw new Error('GTIN is required for release reviews');
    }

    const releaseResult = await engine.lookupByGtin(params.gtin);
    if (!releaseResult.data) {
      throw new Error('Release not found');
    }

    const release = HarmonizedReleaseSchema.parse(releaseResult.data);
    const artworkUrl = await resolveReleaseArtwork(release);
    const built = buildReviewSubjectFromSnapshot(
      'RELEASE',
      release as Parameters<typeof buildReviewSubjectFromSnapshot>[1],
      artworkUrl
    );
    return toResult(
      built,
      release.title,
      getPrimaryArtistFromCredits(
        release.artists as Parameters<typeof getPrimaryArtistFromCredits>[0]
      ),
      artworkUrl
    );
  }

  throw new Error('Provide url, gtin, or isrc to resolve a review subject');
}

async function resolveTrackArtwork(
  track: HarmonizedTrack
): Promise<string | undefined> {
  // Track artwork is inherited from the parent release at harmonization time.
  return resolveArtworkUrl({
    ...(track.artwork ? { artwork: track.artwork } : {}),
  });
}
