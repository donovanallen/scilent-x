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
export { likePost, unlikePost, likeComment, unlikeComment } from './likes';

// Reposts
export { repostPost, unrepostPost } from './reposts';

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
  parseHtmlMentions,
  createMentions,
  createMentionsFromUsernames,
  convertLegacyMentions,
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
  getUserReposts,
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

// Conversations (direct messages)
export {
  isMutualFollow,
  getConversationById,
  getConversationSummary,
  getInboxConversations,
  getOrCreateDirectConversation,
  markConversationRead,
} from './conversations';

// Messages
export { getMessages, sendMessage } from './messages';
