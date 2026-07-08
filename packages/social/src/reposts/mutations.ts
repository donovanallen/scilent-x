import { db } from '@scilent-one/db';
import { NotFoundError, ConflictError } from '../utils/errors';

export async function repostPost(
  userId: string,
  postId: string
): Promise<void> {
  const post = await db.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('Post');
  }

  const existingRepost = await db.repost.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingRepost) {
    throw new ConflictError('You have already reposted this post');
  }

  await db.repost.create({
    data: {
      userId,
      postId,
    },
  });

  // Create activity for post author if different from reposter
  if (post.authorId !== userId) {
    await db.activity.create({
      data: {
        type: 'POST_REPOSTED',
        userId: post.authorId,
        actorId: userId,
        postId,
      },
    });
  }
}

export async function unrepostPost(
  userId: string,
  postId: string
): Promise<void> {
  const existingRepost = await db.repost.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (!existingRepost) {
    throw new NotFoundError('Repost');
  }

  await db.repost.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
}
