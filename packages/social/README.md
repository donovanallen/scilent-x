# @scilent-one/social

Social features package for posts, comments, follows, and feeds.

## Installation

This package is part of the monorepo and is installed automatically. To use it in your app:

```bash
pnpm add @scilent-one/social@workspace:*
```

## Prerequisites

This package depends on:
- `@scilent-one/db` - Prisma database client with social models

Ensure your database has been migrated with the social schema:

```bash
cd packages/db
pnpm db:migrate
```

## Usage

### Posts

```typescript
import {
  createPost,
  getPostById,
  getPostsByAuthor,
  updatePost,
  deletePost,
} from '@scilent-one/social';

// Create a new post
const post = await createPost(userId, {
  content: 'Hello world! @username check this out',
});

// Get a single post (with like status for current user)
const post = await getPostById(postId, currentUserId);

// Get posts by a specific author
const { items, nextCursor, hasMore } = await getPostsByAuthor(
  authorId,
  { cursor: undefined, limit: 20 },
  currentUserId
);

// Update a post
const updated = await updatePost(userId, postId, {
  content: 'Updated content',
});

// Delete a post
await deletePost(userId, postId);
```

### Comments

```typescript
import {
  createComment,
  getCommentsByPost,
  getCommentReplies,
  updateComment,
  deleteComment,
} from '@scilent-one/social';

// Create a comment on a post
const comment = await createComment(userId, {
  content: 'Great post!',
  postId: postId,
});

// Create a reply to a comment
const reply = await createComment(userId, {
  content: 'I agree!',
  postId: postId,
  parentId: commentId, // Parent comment ID for threading
});

// Get comments for a post (includes first 3 replies)
const { items, nextCursor, hasMore } = await getCommentsByPost(
  postId,
  { limit: 20 },
  currentUserId
);

// Get more replies for a specific comment
const replies = await getCommentReplies(commentId, { limit: 10 }, currentUserId);

// Update a comment
const updated = await updateComment(userId, commentId, {
  content: 'Updated comment',
});

// Delete a comment
await deleteComment(userId, commentId);
```

### Likes

```typescript
import {
  likePost,
  unlikePost,
  likeComment,
  unlikeComment,
} from '@scilent-one/social';

// Like a post
await likePost(userId, postId);

// Unlike a post
await unlikePost(userId, postId);

// Like a comment
await likeComment(userId, commentId);

// Unlike a comment
await unlikeComment(userId, commentId);
```

### Follows

```typescript
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
} from '@scilent-one/social';

// Follow a user
await followUser(currentUserId, targetUserId);

// Unfollow a user
await unfollowUser(currentUserId, targetUserId);

// Get followers of a user
const { items, nextCursor, hasMore } = await getFollowers(
  userId,
  { limit: 20 },
  currentUserId // To check if current user follows each follower
);

// Get users that a user follows
const following = await getFollowing(userId, { limit: 20 }, currentUserId);

// Check if one user follows another
const follows = await isFollowing(followerId, followingId);
```

### Feeds

```typescript
import {
  getHomeFeed,
  getExploreFeed,
  getTrendingPosts,
  getProfileFeed,
  getLikedPosts,
} from '@scilent-one/social';

// Home feed - posts from users the current user follows (+ own posts)
const { items, nextCursor, hasMore } = await getHomeFeed(userId, { limit: 20 });

// Explore feed - all public posts, sorted by recency
const explore = await getExploreFeed({ limit: 20 }, currentUserId);

// Trending posts - most engaged posts from the last 7 days
const trending = await getTrendingPosts({ limit: 20 }, currentUserId);

// Profile feed - posts by a specific user
const profile = await getProfileFeed(userId, { limit: 20 }, currentUserId);

// Liked posts - posts that a user has liked
const liked = await getLikedPosts(userId, { limit: 20 }, currentUserId);
```

### Users & Profiles

```typescript
import {
  getUserById,
  getUserByUsername,
  searchUsers,
  getSuggestedUsers,
  updateProfile,
  checkUsernameAvailability,
} from '@scilent-one/social';

// Get user by ID
const user = await getUserById(userId, currentUserId);

// Get user by username
const user = await getUserByUsername('johndoe', currentUserId);

// Search users (for @mentions autocomplete)
const { items } = await searchUsers('john', { limit: 10 }, currentUserId);

// Get suggested users to follow
const suggestions = await getSuggestedUsers(currentUserId, 5);

// Update profile
const updated = await updateProfile(userId, {
  username: 'newusername',
  bio: 'My bio text',
  name: 'John Doe',
  avatarUrl: 'https://example.com/avatar.jpg',
});

// Check if username is available
const { available, reason } = await checkUsernameAvailability('newusername', currentUserId);
```

### Mentions

```typescript
import {
  parseMentions,
  extractMentionedUsernames,
  replaceMentionsWithLinks,
} from '@scilent-one/social';

// Parse mentions from content
const mentions = parseMentions('Hello @john and @jane!');
// Returns: [
//   { username: 'john', startIndex: 6, endIndex: 11 },
//   { username: 'jane', startIndex: 16, endIndex: 21 }
// ]

// Extract just the usernames
const usernames = extractMentionedUsernames('Hello @john and @jane!');
// Returns: ['john', 'jane']

// Replace mentions with HTML links
const html = replaceMentionsWithLinks('Hello @john!', '/profile');
// Returns: 'Hello <a href="/profile/john" class="mention">@john</a>!'
```

## Types

All types are exported for use in your application:

```typescript
import type {
  // Pagination
  PaginationParams,
  PaginatedResult,

  // User types
  UserProfile,
  UpdateProfileInput,

  // Post types
  PostWithAuthor,
  CreatePostInput,
  UpdatePostInput,

  // Comment types
  CommentWithAuthor,
  CreateCommentInput,
  UpdateCommentInput,

  // Other types
  FollowWithUser,
  ActivityWithDetails,
  ParsedMention,
} from '@scilent-one/social';
```

## Error Handling

The package exports custom error classes for different scenarios:

```typescript
import {
  SocialError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from '@scilent-one/social';

try {
  await deletePost(userId, postId);
} catch (error) {
  if (error instanceof NotFoundError) {
    // Post not found (404)
  } else if (error instanceof ForbiddenError) {
    // User doesn't own this post (403)
  } else if (error instanceof SocialError) {
    // Other social error
    console.log(error.code, error.statusCode, error.message);
  }
}
```

## Pagination

All list queries support cursor-based pagination:

```typescript
import type { PaginationParams, PaginatedResult } from '@scilent-one/social';

// First page
const page1 = await getHomeFeed(userId, { limit: 20 });

// Next page
if (page1.hasMore && page1.nextCursor) {
  const page2 = await getHomeFeed(userId, {
    cursor: page1.nextCursor,
    limit: 20,
  });
}
```

The `PaginatedResult` type includes:
- `items: T[]` - The items for this page
- `nextCursor: string | null` - Cursor for the next page (null if no more)
- `hasMore: boolean` - Whether there are more items

## API Routes

When using with Next.js API routes, you can use the utility functions:

```typescript
// apps/web/src/lib/api-utils.ts
import { SocialError } from '@scilent-one/social';
import { NextResponse } from 'next/server';

export function handleApiError(error: unknown) {
  if (error instanceof SocialError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  // ... handle other errors
}
```

## Activity Feed

The package automatically creates activity records when:
- A post is created (`POST_CREATED`)
- A post is liked (`POST_LIKED`)
- A comment is created (`COMMENT_CREATED`)
- A comment is liked (`COMMENT_LIKED`)
- A user is followed (`USER_FOLLOWED`)
- A user is mentioned (`USER_MENTIONED`)

These can be used to build notification systems.

## Validation Rules

### Username
- 3-30 characters
- Must start with a letter
- Can contain letters, numbers, and underscores
- Case-insensitive (stored as provided, matched case-insensitively)
- Reserved usernames are blocked (admin, api, help, etc.)

### Post Content
- Cannot be empty
- Maximum 5000 characters
- @mentions are automatically parsed and linked

### Comment Content
- Cannot be empty
- Maximum 2000 characters
- @mentions are automatically parsed and linked

### Bio
- Maximum 500 characters
