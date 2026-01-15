import { db } from '@scilent-one/db';
import type { PaginationParams, PaginatedResult, ArtistFollowData } from '../types';
import {
  getPaginationParams,
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
} from '../utils/pagination';

export async function getFollowedArtists(
  userId: string,
  params: PaginationParams = {}
): Promise<PaginatedResult<ArtistFollowData>> {
  const { cursor, take } = getPaginationParams(params);
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  const follows = await db.artistFollow.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  return createPaginatedResult(follows, limit);
}

export async function isFollowingArtist(
  userId: string,
  artistId: string
): Promise<boolean> {
  const follow = await db.artistFollow.findUnique({
    where: {
      userId_artistId: {
        userId,
        artistId,
      },
    },
  });

  return !!follow;
}

export async function getArtistFollowersCount(artistId: string): Promise<number> {
  return db.artistFollow.count({
    where: { artistId },
  });
}
