import { db } from '@scilent-one/db';
import type {
  CreateReviewInput,
  UpdateReviewInput,
  PostWithAuthor,
} from '../types';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from '../utils/errors';
import { sanitizeHtml } from '../utils/sanitize';
import {
  parseMentions,
  parseHtmlMentions,
  createMentions,
  createMentionsFromUsernames,
} from '../mentions/parser';
import { authorSelect, reviewSubjectSelect } from '../posts/includes';
import {
  buildReviewSubjectFromSnapshot,
  getCanonicalKey,
  getPrimaryArtistFromCredits,
  type ReviewSubjectInput,
} from './types';

async function createPostMentions(
  content: string,
  contentHtml: string | null | undefined,
  context: { postId: string }
): Promise<void> {
  if (contentHtml) {
    const mentions = parseHtmlMentions(contentHtml);
    if (mentions.length > 0) {
      await createMentions(mentions, context);
    }
    return;
  }

  const mentions = parseMentions(content);
  if (mentions.length > 0) {
    await createMentionsFromUsernames(mentions, context);
  }
}

async function findExistingReviewForUser(
  userId: string,
  subject: ReviewSubjectInput
): Promise<{ id: string } | null> {
  const canonicalKey = getCanonicalKey(subject);
  if (!canonicalKey) return null;

  if (subject.type === 'RELEASE') {
    return db.post.findFirst({
      where: {
        authorId: userId,
        type: 'REVIEW',
        reviewSubject: {
          OR: [
            ...(subject.gtin ? [{ gtin: subject.gtin }] : []),
            ...(subject.mbid ? [{ mbid: subject.mbid }] : []),
          ],
        },
      },
      select: { id: true },
    });
  }

  return db.post.findFirst({
    where: {
      authorId: userId,
      type: 'REVIEW',
      reviewSubject: {
        OR: [
          ...(subject.isrc ? [{ isrc: subject.isrc }] : []),
          ...(subject.mbid ? [{ mbid: subject.mbid }] : []),
        ],
      },
    },
    select: { id: true },
  });
}

function toReviewSubjectCreateData(subject: ReviewSubjectInput) {
  const built = buildReviewSubjectFromSnapshot(
    subject.type,
    subject.snapshot as Parameters<typeof buildReviewSubjectFromSnapshot>[1],
    subject.artworkUrl
  );

  return {
    type: built.type,
    gtin: built.gtin ?? null,
    isrc: built.isrc ?? null,
    mbid: built.mbid ?? null,
    title: built.title ?? 'Unknown',
    artistLabel: built.artistLabel ?? null,
    artworkUrl: built.artworkUrl ?? null,
    releaseDate: built.releaseDate ?? null,
    snapshot: built.snapshot as object,
  };
}

export async function createReview(
  userId: string,
  input: CreateReviewInput
): Promise<PostWithAuthor> {
  if (!input.content.trim()) {
    throw new ValidationError('Review content cannot be empty');
  }

  if (input.content.length > 5000) {
    throw new ValidationError('Review content cannot exceed 5000 characters');
  }

  if (!input.subject) {
    throw new ValidationError('Review must have a music subject attached');
  }

  const subjectData = toReviewSubjectCreateData(
    input.subject as ReviewSubjectInput
  );

  const existing = await findExistingReviewForUser(
    userId,
    input.subject as ReviewSubjectInput
  );
  if (existing) {
    throw new ConflictError(
      'You already have a review for this release or track. Edit your existing review instead.'
    );
  }

  const sanitizedHtml = sanitizeHtml(input.contentHtml);

  const post = await db.post.create({
    data: {
      content: input.content,
      contentHtml: sanitizedHtml,
      type: 'REVIEW',
      authorId: userId,
      reviewSubject: {
        create: subjectData,
      },
    },
    include: {
      author: { select: authorSelect },
      reviewSubject: { select: reviewSubjectSelect },
      _count: {
        select: {
          likes: true,
          comments: true,
          reposts: true,
        },
      },
    },
  });

  await createPostMentions(input.content, sanitizedHtml, { postId: post.id });

  const followers = await db.follow.findMany({
    where: { followingId: userId },
    select: { followerId: true },
  });

  if (followers.length > 0) {
    await db.activity.createMany({
      data: followers.map((follower) => ({
        type: 'REVIEW_CREATED' as const,
        userId: follower.followerId,
        actorId: userId,
        postId: post.id,
      })),
    });
  }

  return {
    ...post,
    isLiked: false,
    isReposted: false,
  };
}

export async function updateReview(
  userId: string,
  postId: string,
  input: UpdateReviewInput
): Promise<PostWithAuthor> {
  const existingPost = await db.post.findUnique({
    where: { id: postId },
    include: { reviewSubject: true },
  });

  if (!existingPost) {
    throw new NotFoundError('Review');
  }

  if (existingPost.type !== 'REVIEW') {
    throw new ValidationError('Post is not a review');
  }

  if (existingPost.authorId !== userId) {
    throw new ForbiddenError('You can only edit your own reviews');
  }

  if (!input.content.trim()) {
    throw new ValidationError('Review content cannot be empty');
  }

  if (input.content.length > 5000) {
    throw new ValidationError('Review content cannot exceed 5000 characters');
  }

  await db.mention.deleteMany({
    where: { postId },
  });

  const sanitizedHtml = sanitizeHtml(input.contentHtml);

  const subjectUpdate =
    input.subject != null
      ? {
          upsert: {
            create: toReviewSubjectCreateData(input.subject),
            update: toReviewSubjectCreateData(input.subject),
          },
        }
      : undefined;

  const post = await db.post.update({
    where: { id: postId },
    data: {
      content: input.content,
      contentHtml: sanitizedHtml,
      ...(subjectUpdate ? { reviewSubject: subjectUpdate } : {}),
    },
    include: {
      author: { select: authorSelect },
      reviewSubject: { select: reviewSubjectSelect },
      _count: {
        select: {
          likes: true,
          comments: true,
          reposts: true,
        },
      },
      likes: {
        where: { userId },
        take: 1,
      },
      reposts: {
        where: { userId },
        take: 1,
      },
    },
  });

  await createPostMentions(input.content, sanitizedHtml, { postId: post.id });

  return {
    ...post,
    isLiked: post.likes.length > 0,
    isReposted: post.reposts.length > 0,
    likes: undefined as unknown as never,
    reposts: undefined as unknown as never,
  } as PostWithAuthor;
}
