import type { ReviewSubject, ReviewSubjectType } from '@scilent-one/db';

export const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  image: true,
} as const;

export const reviewSubjectSelect = {
  id: true,
  postId: true,
  type: true,
  gtin: true,
  isrc: true,
  mbid: true,
  title: true,
  artistLabel: true,
  artworkUrl: true,
  releaseDate: true,
  snapshot: true,
  createdAt: true,
} as const;

export type ReviewSubjectData = ReviewSubject;

/**
 * Prisma `where` fragment enforcing post visibility for a given viewer.
 *
 * A post is visible when it is PUBLIC, or when the viewer is its author.
 * AND this with any other filters on a `post.findMany` where clause so that
 * private reviews are only ever returned to their author.
 */
export function visibilityWhere(viewerId?: string) {
  return {
    OR: [
      { visibility: 'PUBLIC' as const },
      ...(viewerId ? [{ authorId: viewerId }] : []),
    ],
  };
}

export function getPostInclude(userId?: string) {
  return {
    author: { select: authorSelect },
    reviewSubject: { select: reviewSubjectSelect },
    _count: {
      select: {
        likes: true,
        comments: true,
        reposts: true,
      },
    },
    likes: userId
      ? {
          where: { userId },
          take: 1,
        }
      : false,
    reposts: userId
      ? {
          where: { userId },
          take: 1,
        }
      : false,
  } as const;
}

export function mapPostWithAuthor<
  T extends {
    likes?: { length: number } | false;
    reposts?: { length: number } | false;
  },
>(
  post: T,
  userId?: string
): Omit<T, 'likes' | 'reposts'> & {
  isLiked: boolean;
  isReposted: boolean;
} {
  const likes = post.likes && Array.isArray(post.likes) ? post.likes : [];
  const reposts =
    post.reposts && Array.isArray(post.reposts) ? post.reposts : [];

  return {
    ...post,
    isLiked: userId ? likes.length > 0 : false,
    isReposted: userId ? reposts.length > 0 : false,
    likes: undefined as unknown as never,
    reposts: undefined as unknown as never,
  };
}
