import { describe, it, expect } from 'vitest';
import type { Trigger } from '@tiptap/suggestion';
import { createBoundedSpaceMatcher } from '../mention-suggestion-match';

/**
 * Builds a minimal `Trigger` config where `textBeforeCursor` is the text of the
 * single text node before the cursor, and the cursor sits at the end of it.
 * This mirrors what `@tiptap/suggestion` passes to `findSuggestionMatch`
 * without needing a real ProseMirror document.
 */
function trigger(
  textBeforeCursor: string,
  overrides: Partial<Trigger> = {}
): Trigger {
  return {
    char: '#',
    allowSpaces: false,
    allowToIncludeChar: false,
    allowedPrefixes: [' '],
    startOfLine: false,
    $position: {
      pos: textBeforeCursor.length,
      nodeBefore: {
        isText: true,
        text: textBeforeCursor,
      },
    },
    ...overrides,
  } as unknown as Trigger;
}

describe('createBoundedSpaceMatcher', () => {
  const match = createBoundedSpaceMatcher({
    char: '#',
    maxWords: 5,
    maxChars: 80,
  });

  it('matches a single-word query', () => {
    const result = match(trigger('#Radiohead'));
    expect(result?.query).toBe('Radiohead');
    expect(result?.text).toBe('#Radiohead');
  });

  it('keeps the popover open across a space for multi-word names', () => {
    const result = match(trigger('#Massive Attack'));
    expect(result?.query).toBe('Massive Attack');
    expect(result?.text).toBe('#Massive Attack');
  });

  it('matches an empty query right after the trigger char', () => {
    const result = match(trigger('#'));
    expect(result?.query).toBe('');
  });

  it('stays open with a trailing space while typing the next word', () => {
    // The regression: without a trailing-space allowance the popover would
    // close the instant the space is typed, before the next word.
    const result = match(trigger('#Massive '));
    expect(result?.query).toBe('Massive');
    expect(result?.text).toBe('#Massive ');
  });

  it('abandons the mention on 2+ consecutive spaces', () => {
    const result = match(trigger('#Massive  Attack'));
    expect(result).toBeNull();
  });

  it('respects an in-line trigger preceded by allowed whitespace prefix', () => {
    const result = match(trigger('hey #Tame Impala'));
    expect(result?.query).toBe('Tame Impala');
  });

  it('exits (returns null) once the query exceeds maxWords', () => {
    // 6 words after the trigger char, cap is 5.
    const result = match(trigger('#one two three four five six'));
    expect(result).toBeNull();
  });

  it('exits (returns null) once the query exceeds maxChars', () => {
    const longName = `#${'a'.repeat(100)}`;
    const result = match(trigger(longName));
    expect(result).toBeNull();
  });

  it('returns null when there is no text before the cursor', () => {
    const result = match(
      trigger('', {
        $position: {
          pos: 0,
          nodeBefore: null,
        },
      } as unknown as Partial<Trigger>)
    );
    expect(result).toBeNull();
  });

  it('returns null when the trigger char is not preceded by an allowed prefix', () => {
    // `#` immediately after a word char is not an allowed prefix.
    const result = match(trigger('word#Artist'));
    expect(result).toBeNull();
  });
});
