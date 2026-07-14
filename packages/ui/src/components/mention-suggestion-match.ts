import type { SuggestionMatch, Trigger } from '@tiptap/suggestion';

export interface BoundedSpaceMatcherOptions {
  /**
   * Trigger character the matcher is scoped to (e.g. `#`). Documented for
   * clarity at the call site; the actual char is read from the plugin's
   * `Trigger` config at match time.
   */
  char: string;
  /**
   * Maximum number of space-separated words the query may span before the
   * match stops covering the cursor (which causes the suggestion to exit).
   * @default 5
   */
  maxWords?: number;
  /**
   * Maximum number of characters (including the trigger char) the match may
   * span before it stops covering the cursor.
   * @default 80
   */
  maxChars?: number;
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a `findSuggestionMatch` implementation for `@tiptap/suggestion` that
 * allows spaces in the query (so multi-word entities like "Massive Attack" stay
 * searchable) while remaining bounded: the match stops at 2+ consecutive
 * whitespace, a newline, once it spans more than `maxWords` words, or once it
 * exceeds `maxChars`. When the bound is exceeded the match no longer covers the
 * cursor, so the plugin cleanly exits the suggestion via its normal lifecycle.
 */
export function createBoundedSpaceMatcher(
  options: BoundedSpaceMatcherOptions
): (config: Trigger) => SuggestionMatch {
  const maxWords = Math.max(1, options.maxWords ?? 5);
  const maxChars = Math.max(1, options.maxChars ?? 80);

  return function boundedFindSuggestionMatch(config: Trigger): SuggestionMatch {
    const { char, allowedPrefixes, startOfLine, $position } = config;

    const escapedChar = escapeForRegExp(char);
    const prefix = startOfLine ? '^' : '';

    // First word may be empty (user just typed the trigger char); each further
    // word requires a single whitespace followed by at least one non-space
    // char. A single optional trailing whitespace is allowed so the match keeps
    // covering the cursor while the user is typing the next word (e.g. right
    // after "#Massive "). Two consecutive whitespace chars (or a newline) end
    // the match, cleanly abandoning the mention.
    const regexp = new RegExp(
      `${prefix}${escapedChar}\\S*(?:\\s\\S+){0,${maxWords - 1}}\\s?`,
      'gm'
    );

    const text =
      $position.nodeBefore?.isText && $position.nodeBefore.text
        ? $position.nodeBefore.text
        : null;

    if (!text) {
      return null;
    }

    const textFrom = $position.pos - text.length;
    const match = Array.from(text.matchAll(regexp)).pop();

    if (!match || match.input === undefined || match.index === undefined) {
      return null;
    }

    const matchPrefix = match.input.slice(
      Math.max(0, match.index - 1),
      match.index
    );
    const matchPrefixIsAllowed = new RegExp(
      `^[${allowedPrefixes?.join('') ?? ''}\0]?$`
    ).test(matchPrefix);

    if (allowedPrefixes !== null && !matchPrefixIsAllowed) {
      return null;
    }

    const from = textFrom + match.index;
    // Enforce the character cap: if the match is longer than allowed, trim it
    // so it no longer reaches the cursor, which makes the plugin exit.
    const matchText =
      match[0].length > maxChars ? match[0].slice(0, maxChars) : match[0];
    const to = from + matchText.length;

    if (from < $position.pos && to >= $position.pos) {
      return {
        range: { from, to },
        // Trim a trailing space from the query so searches aren't re-triggered
        // by the transient "typed a space, no next word yet" state.
        query: matchText.slice(char.length).replace(/\s+$/, ''),
        text: matchText,
      };
    }

    return null;
  };
}
