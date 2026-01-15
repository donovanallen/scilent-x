import { db } from '@scilent-one/db';
import type { ParsedMention, LegacyParsedMention, MentionType } from '../types';

// Valid mention types for validation
const VALID_MENTION_TYPES: MentionType[] = ['USER', 'ARTIST', 'ALBUM', 'TRACK'];

/**
 * Validates if a string is a valid MentionType
 */
function isValidMentionType(
  type: string | undefined | null
): type is MentionType {
  return (
    type !== null &&
    type !== undefined &&
    VALID_MENTION_TYPES.includes(type as MentionType)
  );
}

// Regex to match @username mentions
// Username can contain letters, numbers, underscores, but must start with a letter
const MENTION_REGEX = /@([a-zA-Z][a-zA-Z0-9_]{0,29})/g;

// Regex to match #artist mentions in plain text (future use)
export const ARTIST_MENTION_REGEX = /#([^#\s]{1,80})/g;

// Regex to match Tiptap data-mention attributes in HTML
const HTML_MENTION_REGEX =
  /<span[^>]*data-mention-type="([^"]*)"[^>]*data-mention-id="([^"]*)"[^>]*data-mention-label="([^"]*)"[^>]*>/g;

// Alternative order for data attributes
const HTML_MENTION_REGEX_ALT =
  /<span[^>]*data-mention-id="([^"]*)"[^>]*data-mention-type="([^"]*)"[^>]*data-mention-label="([^"]*)"[^>]*>/g;

/**
 * Parse mentions from HTML content (Tiptap format)
 * Extracts data-mention-* attributes from span elements
 */
export function parseHtmlMentions(html: string): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  const seenIds = new Set<string>();

  // Try both regex patterns to handle different attribute orders
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  HTML_MENTION_REGEX.lastIndex = 0;
  while ((match = HTML_MENTION_REGEX.exec(html)) !== null) {
    const rawType = match[1];
    const id = match[2];
    const label = match[3];

    // Skip if id or label is missing
    if (!id || !label) continue;

    // Validate and normalize the type
    const type: MentionType = isValidMentionType(rawType) ? rawType : 'USER';

    if (!seenIds.has(id)) {
      seenIds.add(id);
      mentions.push({
        type,
        entityId: id,
        label,
      });
    }
  }

  // Also try alternative attribute order
  HTML_MENTION_REGEX_ALT.lastIndex = 0;
  while ((match = HTML_MENTION_REGEX_ALT.exec(html)) !== null) {
    const id = match[1];
    const rawType = match[2];
    const label = match[3];

    // Skip if id or label is missing
    if (!id || !label) continue;

    // Validate and normalize the type
    const type: MentionType = isValidMentionType(rawType) ? rawType : 'USER';

    if (!seenIds.has(id)) {
      seenIds.add(id);
      mentions.push({
        type,
        entityId: id,
        label,
      });
    }
  }

  return mentions;
}

/**
 * Parse mentions from plain text content (legacy format)
 * @deprecated Use parseHtmlMentions for Tiptap HTML content
 */
export function parseMentions(content: string): LegacyParsedMention[] {
  const mentions: LegacyParsedMention[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  MENTION_REGEX.lastIndex = 0;
  while ((match = MENTION_REGEX.exec(content)) !== null) {
    mentions.push({
      username: match[1]!,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Remove duplicates
  const uniqueUsernames = new Set<string>();
  return mentions.filter((mention) => {
    const lowercaseUsername = mention.username.toLowerCase();
    if (uniqueUsernames.has(lowercaseUsername)) {
      return false;
    }
    uniqueUsernames.add(lowercaseUsername);
    return true;
  });
}

/**
 * Convert legacy mentions to new format by looking up user IDs
 */
export async function convertLegacyMentions(
  legacyMentions: LegacyParsedMention[]
): Promise<ParsedMention[]> {
  if (legacyMentions.length === 0) return [];

  const usernames = legacyMentions.map((m) => m.username.toLowerCase());
  const users = await db.user.findMany({
    where: {
      username: {
        in: usernames,
        mode: 'insensitive',
      },
    },
    select: { id: true, username: true },
  });

  // Build map only for users with valid (non-null) usernames
  const usernameToId = new Map<string, string>();
  for (const user of users) {
    if (user.username) {
      usernameToId.set(user.username.toLowerCase(), user.id);
    }
  }

  const result: ParsedMention[] = [];
  for (const m of legacyMentions) {
    const userId = usernameToId.get(m.username.toLowerCase());
    if (userId) {
      result.push({
        type: 'USER',
        entityId: userId,
        label: m.username,
        startIndex: m.startIndex,
        endIndex: m.endIndex,
      });
    }
  }
  return result;
}

/**
 * Create mention records in the database from parsed mentions
 * Supports both new ParsedMention format (with type/entityId) and legacy format
 */
export async function createMentions(
  mentions: ParsedMention[],
  context: { postId?: string; commentId?: string }
): Promise<void> {
  if (mentions.length === 0) return;

  // Filter for USER type mentions (other types like ARTIST/ALBUM/TRACK are future)
  const userMentions = mentions.filter((m) => m.type === 'USER');

  if (userMentions.length === 0) return;

  // Create mention records using userId field
  const mentionData = userMentions.map((mention) => ({
    userId: mention.entityId,
    postId: context.postId ?? null,
    commentId: context.commentId ?? null,
  }));

  await db.mention.createMany({
    data: mentionData,
  });

  // Create activity for mentioned users
  const activityData = userMentions.map((mention) => ({
    type: 'USER_MENTIONED' as const,
    userId: mention.entityId,
    postId: context.postId ?? null,
    commentId: context.commentId ?? null,
  }));

  await db.activity.createMany({
    data: activityData,
  });
}

/**
 * Create mentions from legacy plain text format
 * This is the primary function used by existing posts/comments mutations
 */
export async function createMentionsFromUsernames(
  legacyMentions: LegacyParsedMention[],
  context: { postId?: string; commentId?: string }
): Promise<void> {
  if (legacyMentions.length === 0) return;

  // Convert legacy mentions to new format
  const mentions = await convertLegacyMentions(legacyMentions);
  await createMentions(mentions, context);
}

export function replaceMentionsWithLinks(
  content: string,
  baseUrl: string = '/profile'
): string {
  return content.replace(MENTION_REGEX, (match, username) => {
    return `<a href="${baseUrl}/${username}" class="mention">@${username}</a>`;
  });
}

export function extractMentionedUsernames(content: string): string[] {
  const mentions = parseMentions(content);
  return mentions.map((m) => m.username);
}
