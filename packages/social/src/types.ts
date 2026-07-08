import type {
  Post,
  Comment,
  Like,
  Repost,
  Follow,
  Mention,
  Activity,
  Conversation,
  ConversationParticipant,
  Message,
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
  /** Whether the viewer and this user mutually follow each other (required to start a DM) */
  canMessage?: boolean | undefined;
}

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  name?: string;
}

// Post types
export interface ReviewSubjectSummary {
  id: string;
  postId: string;
  type: 'RELEASE' | 'TRACK';
  gtin: string | null;
  isrc: string | null;
  mbid: string | null;
  title: string;
  artistLabel: string | null;
  artworkUrl: string | null;
  releaseDate: string | null;
  snapshot: unknown;
  createdAt: Date;
}

export interface PostWithAuthor extends Post {
  author: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
  _count: {
    likes: number;
    comments: number;
    reposts: number;
  };
  isLiked?: boolean;
  isReposted?: boolean;
  /** Recent comments for inline display (optional, not always included) */
  comments?: CommentWithAuthor[];
  reviewSubject?: ReviewSubjectSummary | null;
}

export interface CreatePostInput {
  content: string;
  contentHtml?: string;
}

export interface UpdatePostInput {
  content: string;
  contentHtml?: string;
}

export interface CreateReviewSubjectInput {
  type: 'RELEASE' | 'TRACK';
  gtin?: string;
  isrc?: string;
  mbid?: string;
  snapshot: unknown;
  artworkUrl?: string;
}

export interface CreateReviewInput {
  content: string;
  contentHtml?: string;
  subject: CreateReviewSubjectInput;
}

export interface UpdateReviewInput {
  content: string;
  contentHtml?: string;
  subject?: CreateReviewSubjectInput;
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
  contentHtml?: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
  contentHtml?: string;
}

// Follow types
export interface FollowWithUser extends Follow {
  follower: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
  following: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'image'>;
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

// Messaging types
type ConversationParticipantUser = Pick<
  User,
  'id' | 'name' | 'username' | 'avatarUrl' | 'image'
>;

export interface MessageWithSender extends Message {
  sender: ConversationParticipantUser;
}

/** A conversation as shown in the inbox list, from the perspective of the current user */
export interface ConversationSummary extends Conversation {
  /** The other participant in this 1:1 conversation */
  otherParticipant: ConversationParticipantUser;
  lastMessage: MessageWithSender | null;
  /** Number of messages sent after the current user's `lastReadAt` */
  unreadCount: number;
}

/** A conversation with full participant + membership details, for authorization checks */
export interface ConversationWithParticipants extends Conversation {
  participants: (ConversationParticipant & {
    user: ConversationParticipantUser;
  })[];
}

export interface CreateMessageInput {
  content: string;
  contentHtml?: string;
}

// Re-export Prisma types
export type {
  Post,
  Comment,
  Like,
  Repost,
  Follow,
  Mention,
  Activity,
  Conversation,
  ConversationParticipant,
  Message,
  User,
  PostType,
  ReviewSubjectType,
} from '@scilent-one/db';
