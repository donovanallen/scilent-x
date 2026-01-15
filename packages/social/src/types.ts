import type {
  Post,
  Comment,
  Like,
  Follow,
  Mention,
  Activity,
  User,
} from '@scilent-one/db';

// Pagination
export type PaginationParams = {
  cursor?: string;
  limit?: number;
};

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  createdAt: Date;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  name?: string;
}

// Post types
export interface PostWithAuthor extends Post {
  author: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export interface CreatePostInput {
  content: string;
  contentHtml?: string;
}

export interface UpdatePostInput {
  content: string;
  contentHtml?: string;
}

// Comment types
export interface CommentWithAuthor extends Comment {
  author: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
  _count: {
    likes: number;
    replies: number;
  };
  isLiked?: boolean;
  replies?: CommentWithAuthor[];
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}

// Follow types
export interface FollowWithUser extends Follow {
  follower: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
  following: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
}

// Artist Follow types
export interface ArtistFollowData {
  id: string;
  userId: string;
  artistId: string;
  provider: string;
  artistName: string;
  artistImage: string | null;
  createdAt: Date;
}

export interface FollowArtistInput {
  artistId: string;
  provider: string;
  artistName: string;
  artistImage?: string | null;
}

// Activity types
export interface ActivityWithDetails extends Activity {
  actor?: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
}

// Mention types
export type MentionType = 'USER' | 'ARTIST' | 'ALBUM' | 'TRACK';

export interface ArtistMentionEntity {
  id: string;
  name: string;
  imageUrl?: string | null;
  provider: string;
  externalIds: Record<string, string>;
}

export interface ParsedMention {
  type: MentionType;
  entityId: string;
  label: string;
  startIndex?: number;
  endIndex?: number;
}

/**
 * Legacy mention type for backwards compatibility
 * @deprecated Use ParsedMention with type field instead
 */
export interface LegacyParsedMention {
  username: string;
  startIndex: number;
  endIndex: number;
}

// Re-export Prisma types
export type { Post, Comment, Like, Follow, Mention, Activity, User };
