import { db } from '@scilent-one/db';
import type { FollowArtistInput, ArtistFollowData } from '../types';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors';

export async function followArtist(
  userId: string,
  input: FollowArtistInput
): Promise<ArtistFollowData> {
  const { artistId, provider, artistName, artistImage } = input;

  if (!artistId || !provider || !artistName) {
    throw new ValidationError('Artist ID, provider, and name are required');
  }

  const existingFollow = await db.artistFollow.findUnique({
    where: {
      userId_artistId: {
        userId,
        artistId,
      },
    },
  });

  if (existingFollow) {
    throw new ConflictError('You are already following this artist');
  }

  const follow = await db.artistFollow.create({
    data: {
      userId,
      artistId,
      provider,
      artistName,
      artistImage: artistImage ?? null,
    },
  });

  return follow;
}

export async function unfollowArtist(
  userId: string,
  artistId: string
): Promise<void> {
  const existingFollow = await db.artistFollow.findUnique({
    where: {
      userId_artistId: {
        userId,
        artistId,
      },
    },
  });

  if (!existingFollow) {
    throw new NotFoundError('Artist follow relationship');
  }

  await db.artistFollow.delete({
    where: {
      userId_artistId: {
        userId,
        artistId,
      },
    },
  });
}
