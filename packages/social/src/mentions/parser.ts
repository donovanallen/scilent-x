import { db } from '@scilent-one/db';
import type { ParsedMention } from '../types';

// Regex to match @username mentions
// Username can contain letters, numbers, underscores, but must start with a letter
const MENTION_REGEX = /@([a-zA-Z][a-zA-Z0-9_]{0,29})/g;

export function parseMentions(content: string): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  let match: RegExpExecArray | null;

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

export async function createMentions(
  mentions: ParsedMention[],
  context: { postId?: string; commentId?: string }
): Promise<void> {
  if (mentions.length === 0) return;

  // Find users by username
  const usernames = mentions.map((m) => m.username.toLowerCase());
  const users = await db.user.findMany({
    where: {
      username: {
        in: usernames,
        mode: 'insensitive',
      },
    },
    select: { id: true, username: true },
  });

  if (users.length === 0) return;

  // Create mention records
  const mentionData = users.map((user) => ({
    userId: user.id,
    postId: context.postId ?? null,
    commentId: context.commentId ?? null,
  }));

  await db.mention.createMany({
    data: mentionData,
  });

  // Create activity for mentioned users
  const activityData = users.map((user) => ({
    type: 'USER_MENTIONED' as const,
    userId: user.id,
    postId: context.postId ?? null,
    commentId: context.commentId ?? null,
  }));

  await db.activity.createMany({
    data: activityData,
  });
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
