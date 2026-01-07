/**
 * @scilent-one/social
 *
 * Social features package for posts, comments, follows, and feeds.
 *
 * @example
 * ```ts
 * import { createPost, getHomeFeed, followUser } from "@scilent-one/social";
 *
 * // Create a post
 * const post = await createPost(userId, { content: "Hello world!" });
 *
 * // Get home feed
 * const feed = await getHomeFeed(userId, { limit: 20 });
 *
 * // Follow a user
 * await followUser(currentUserId, targetUserId);
 * ```
 */

// Types
export * from './types';

// Utilities
export * from './utils';

// Posts
export {
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
} from './posts';

// Comments
export {
  getCommentById,
  getCommentsByPost,
  getCommentReplies,
  createComment,
  updateComment,
  deleteComment,
} from './comments';

// Likes
export {
  likePost,
  unlikePost,
  likeComment,
  unlikeComment,
} from './likes';

// Follows
export {
  getFollowers,
  getFollowing,
  isFollowing,
  followUser,
  unfollowUser,
} from './follows';

// Mentions
export {
  parseMentions,
  createMentions,
  replaceMentionsWithLinks,
  extractMentionedUsernames,
  deleteMentionsByPost,
  deleteMentionsByComment,
} from './mentions';

// Feeds
export {
  getHomeFeed,
  getExploreFeed,
  getTrendingPosts,
  getProfileFeed,
  getLikedPosts,
} from './feeds';

// Users
export {
  getUserById,
  getUserByUsername,
  searchUsers,
  getSuggestedUsers,
  updateProfile,
  checkUsernameAvailability,
} from './users';
