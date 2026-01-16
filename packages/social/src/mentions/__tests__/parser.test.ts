import { describe, it, expect } from 'vitest';
import {
  parseHtmlMentions,
  parseMentions,
  replaceMentionsWithLinks,
  extractMentionedUsernames,
  ARTIST_MENTION_REGEX,
} from '../parser';

describe('parseHtmlMentions', () => {
  it('parses valid HTML mentions with type-id-label order', () => {
    const html = '<p>Hello <span data-mention-type="USER" data-mention-id="user123" data-mention-label="johndoe">@johndoe</span></p>';
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'USER',
      entityId: 'user123',
      label: 'johndoe',
    });
  });

  it('parses valid HTML mentions with id-type-label order', () => {
    const html = '<p>Hello <span data-mention-id="user456" data-mention-type="ARTIST" data-mention-label="Taylor Swift">@taylorswift</span></p>';
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'ARTIST',
      entityId: 'user456',
      label: 'Taylor Swift',
    });
  });

  it('parses multiple mentions from HTML', () => {
    const html = `
      <p>
        <span data-mention-type="USER" data-mention-id="id1" data-mention-label="user1">@user1</span>
        <span data-mention-type="USER" data-mention-id="id2" data-mention-label="user2">@user2</span>
      </p>
    `;
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(2);
    expect(result[0]?.entityId).toBe('id1');
    expect(result[1]?.entityId).toBe('id2');
  });

  it('deduplicates mentions with same ID', () => {
    const html = `
      <p>
        <span data-mention-type="USER" data-mention-id="same-id" data-mention-label="user1">@user1</span>
        <span data-mention-type="USER" data-mention-id="same-id" data-mention-label="user1">@user1</span>
      </p>
    `;
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(1);
  });

  it('defaults to USER type for invalid mention types', () => {
    const html = '<span data-mention-type="INVALID" data-mention-id="id1" data-mention-label="test">@test</span>';
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('USER');
  });

  it('defaults to USER type for empty type', () => {
    const html = '<span data-mention-type="" data-mention-id="id1" data-mention-label="test">@test</span>';
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('USER');
  });

  it('handles all valid mention types', () => {
    const types = ['USER', 'ARTIST', 'ALBUM', 'TRACK'] as const;
    
    for (const mentionType of types) {
      const html = `<span data-mention-type="${mentionType}" data-mention-id="id-${mentionType}" data-mention-label="label">@test</span>`;
      const result = parseHtmlMentions(html);

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe(mentionType);
    }
  });

  it('skips mentions without id', () => {
    const html = '<span data-mention-type="USER" data-mention-id="" data-mention-label="test">@test</span>';
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(0);
  });

  it('skips mentions without label', () => {
    const html = '<span data-mention-type="USER" data-mention-id="id1" data-mention-label="">@test</span>';
    const result = parseHtmlMentions(html);

    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty string', () => {
    expect(parseHtmlMentions('')).toEqual([]);
  });

  it('returns empty array for HTML without mentions', () => {
    const html = '<p>Hello world, no mentions here!</p>';
    expect(parseHtmlMentions(html)).toEqual([]);
  });
});

describe('parseMentions', () => {
  it('parses single @mention', () => {
    const content = 'Hello @johndoe!';
    const result = parseMentions(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      username: 'johndoe',
      startIndex: 6,
      endIndex: 14,
    });
  });

  it('parses multiple @mentions', () => {
    const content = '@alice and @bob are friends';
    const result = parseMentions(content);

    expect(result).toHaveLength(2);
    expect(result[0]?.username).toBe('alice');
    expect(result[1]?.username).toBe('bob');
  });

  it('deduplicates case-insensitive mentions', () => {
    const content = '@User @user @USER';
    const result = parseMentions(content);

    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe('User');
  });

  it('handles usernames with numbers and underscores', () => {
    const content = '@user_123 @test2024';
    const result = parseMentions(content);

    expect(result).toHaveLength(2);
    expect(result[0]?.username).toBe('user_123');
    expect(result[1]?.username).toBe('test2024');
  });

  it('requires username to start with a letter', () => {
    const content = '@123user @_invalid';
    const result = parseMentions(content);

    expect(result).toHaveLength(0);
  });

  it('limits username to 30 characters', () => {
    const longUsername = 'a'.repeat(31);
    const content = `@${longUsername}`;
    const result = parseMentions(content);

    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe('a'.repeat(30));
  });

  it('returns empty array for content without mentions', () => {
    expect(parseMentions('Hello world!')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseMentions('')).toEqual([]);
  });

  it('handles mention at start of content', () => {
    const result = parseMentions('@first in line');
    expect(result[0]?.startIndex).toBe(0);
  });

  it('handles mention at end of content', () => {
    const content = 'last mention @final';
    const result = parseMentions(content);
    expect(result[0]?.endIndex).toBe(content.length);
  });
});

describe('replaceMentionsWithLinks', () => {
  it('replaces single mention with link', () => {
    const content = 'Hello @johndoe!';
    const result = replaceMentionsWithLinks(content);

    expect(result).toBe('Hello <a href="/profile/johndoe" class="mention">@johndoe</a>!');
  });

  it('replaces multiple mentions with links', () => {
    const content = '@alice and @bob';
    const result = replaceMentionsWithLinks(content);

    expect(result).toContain('<a href="/profile/alice" class="mention">@alice</a>');
    expect(result).toContain('<a href="/profile/bob" class="mention">@bob</a>');
  });

  it('uses custom baseUrl', () => {
    const content = 'Hello @user!';
    const result = replaceMentionsWithLinks(content, '/u');

    expect(result).toBe('Hello <a href="/u/user" class="mention">@user</a>!');
  });

  it('preserves text without mentions', () => {
    const content = 'No mentions here';
    const result = replaceMentionsWithLinks(content);

    expect(result).toBe('No mentions here');
  });

  it('handles empty string', () => {
    expect(replaceMentionsWithLinks('')).toBe('');
  });
});

describe('extractMentionedUsernames', () => {
  it('extracts usernames from mentions', () => {
    const content = '@alice and @bob are friends';
    const result = extractMentionedUsernames(content);

    expect(result).toEqual(['alice', 'bob']);
  });

  it('returns empty array for no mentions', () => {
    expect(extractMentionedUsernames('No mentions')).toEqual([]);
  });

  it('deduplicates usernames', () => {
    const content = '@user @User @USER';
    const result = extractMentionedUsernames(content);

    expect(result).toHaveLength(1);
  });
});

describe('ARTIST_MENTION_REGEX', () => {
  it('matches hashtag artist mentions', () => {
    const content = 'Listening to #Taylor Swift';
    const matches = content.match(ARTIST_MENTION_REGEX);

    expect(matches).toHaveLength(1);
    expect(matches?.[0]).toBe('#Taylor');
  });

  it('captures artist name without hashtag', () => {
    const content = '#Radiohead is great';
    ARTIST_MENTION_REGEX.lastIndex = 0;
    const match = ARTIST_MENTION_REGEX.exec(content);

    expect(match?.[1]).toBe('Radiohead');
  });

  it('limits artist name to 80 characters', () => {
    const longName = 'a'.repeat(81);
    const content = `#${longName}`;
    ARTIST_MENTION_REGEX.lastIndex = 0;
    const match = ARTIST_MENTION_REGEX.exec(content);

    expect(match?.[1]).toBe('a'.repeat(80));
  });

  it('stops at whitespace', () => {
    const content = '#Artist Name Here';
    ARTIST_MENTION_REGEX.lastIndex = 0;
    const match = ARTIST_MENTION_REGEX.exec(content);

    expect(match?.[1]).toBe('Artist');
  });
});
