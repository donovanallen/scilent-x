import { db } from '@scilent-one/db';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

export async function likePost(userId: string, postId: string): Promise<void> {
  const post = await db.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('Post');
  }

  const existingLike = await db.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    throw new ConflictError('You have already liked this post');
  }

  await db.like.create({
    data: {
      userId,
      postId,
    },
  });

  // Create activity for post author if different from liker
  if (post.authorId !== userId) {
    await db.activity.create({
      data: {
        type: 'POST_LIKED',
        userId: post.authorId,
        actorId: userId,
        postId,
      },
    });
  }
}

export async function unlikePost(userId: string, postId: string): Promise<void> {
  const existingLike = await db.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (!existingLike) {
    throw new NotFoundError('Like');
  }

  await db.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
}

export async function likeComment(userId: string, commentId: string): Promise<void> {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundError('Comment');
  }

  const existingLike = await db.like.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  if (existingLike) {
    throw new ConflictError('You have already liked this comment');
  }

  await db.like.create({
    data: {
      userId,
      commentId,
    },
  });

  // Create activity for comment author if different from liker
  if (comment.authorId !== userId) {
    await db.activity.create({
      data: {
        type: 'COMMENT_LIKED',
        userId: comment.authorId,
        actorId: userId,
        commentId,
      },
    });
  }
}

export async function unlikeComment(userId: string, commentId: string): Promise<void> {
  const existingLike = await db.like.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  if (!existingLike) {
    throw new NotFoundError('Like');
  }

  await db.like.delete({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });
}
