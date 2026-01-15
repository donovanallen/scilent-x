'use client';

import * as React from 'react';
import parse, {
  type HTMLReactParserOptions,
  type DOMNode,
  Element,
} from 'html-react-parser';
import { cn } from '../utils';

/**
 * Props passed to the renderArtistMention function
 */
export interface ArtistMentionRenderProps {
  /** Artist ID (provider-specific) */
  id: string;
  /** Artist name to display */
  name: string;
  /** Provider name (e.g., 'tidal', 'musicbrainz') */
  provider: string;
  /** React key for the element */
  key: string;
  /** Click handler */
  onClick?: ((artistId: string, provider: string) => void) | undefined;
  /** Content to render inside the mention */
  children: React.ReactNode;
}

export interface RichTextContentProps {
  html?: string | null | undefined;
  content?: string;
  className?: string;
  /** Callback when a user mention (@username) is clicked */
  onMentionClick?: ((username: string) => void) | undefined;
  /** Callback when an artist mention (#artist) is clicked */
  onArtistMentionClick?: ((artistId: string, provider: string) => void) | undefined;
  /**
   * Custom renderer for artist mentions.
   * If not provided, artist mentions render as simple styled buttons.
   * Use this to wrap artist mentions with interactive behaviors (context menus, hover previews).
   */
  renderArtistMention?: ((props: ArtistMentionRenderProps) => React.ReactNode) | undefined;
}

// Regex to match @username mentions (global flag for replace/exec)
// Note: String.replace() with global flag handles lastIndex correctly.
// For exec() loops, we reset lastIndex = 0 before each use.
const MENTION_REGEX = /@([a-zA-Z][a-zA-Z0-9_]{0,29})/g;

/**
 * Parse the provider and ID from a mention ID string
 * Format: "provider:id" (e.g., "tidal:12345")
 */
function parseMentionId(mentionId: string): { provider: string; id: string } {
  const colonIndex = mentionId.indexOf(':');
  if (colonIndex === -1) {
    return { provider: 'unknown', id: mentionId };
  }
  return {
    provider: mentionId.slice(0, colonIndex),
    id: mentionId.slice(colonIndex + 1),
  };
}

/**
 * Default artist mention renderer - simple styled button
 */
function DefaultArtistMention({
  name,
  id,
  provider,
  onClick,
  children,
}: ArtistMentionRenderProps) {
  return (
    <button
      type="button"
      className="rich-text-mention tiptap-mention text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`View artist ${name}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(id, provider);
      }}
    >
      {children}
    </button>
  );
}

/**
 * RichTextContent renders HTML content from the rich text editor
 * with proper styling and mention support.
 *
 * If html is provided, it renders the HTML content with interactive mentions.
 * If only content (plain text) is provided, it falls back to plain text
 * with mention highlighting.
 */
export function RichTextContent({
  html,
  content,
  className,
  onMentionClick,
  onArtistMentionClick,
  renderArtistMention,
}: RichTextContentProps) {
  // Use custom renderer or default
  const ArtistMentionRenderer = renderArtistMention ?? DefaultArtistMention;

  // Parser options for html-react-parser
  const parserOptions = React.useMemo<HTMLReactParserOptions>(() => ({
    replace: (domNode: DOMNode) => {
      // Only process Element nodes
      if (!(domNode instanceof Element)) {
        return;
      }

      const { attribs } = domNode;

      // Check if this is a Tiptap mention span
      if (domNode.name === 'span' && attribs['data-mention-type']) {
        const mentionType = attribs['data-mention-type'];
        const mentionId = attribs['data-mention-id'] ?? '';
        const mentionLabel = attribs['data-mention-label'] ?? '';

        // Handle artist mentions
        if (mentionType === 'ARTIST') {
          const { provider, id } = parseMentionId(mentionId);
          const rendered = ArtistMentionRenderer({
            key: `artist-${mentionId}`,
            id,
            name: mentionLabel,
            provider,
            onClick: onArtistMentionClick,
            children: `#${mentionLabel}`,
          });
          // Wrap in fragment to satisfy html-react-parser's expected return type
          return <>{rendered}</>;
        }

        // Handle user mentions as interactive buttons
        if (mentionType === 'USER') {
          return (
            <button
              key={`user-${mentionId}`}
              type="button"
              className="rich-text-mention tiptap-mention text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`View ${mentionLabel}'s profile`}
              onClick={(e) => {
                e.stopPropagation();
                onMentionClick?.(mentionLabel);
              }}
            >
              @{mentionLabel}
            </button>
          );
        }
      }

      // For other elements, return undefined to let the default behavior handle them
      return;
    },
  }), [onMentionClick, onArtistMentionClick, ArtistMentionRenderer]);

  // If we have HTML content, parse and render it
  if (html) {
    return (
      <div
        className={cn(
          'rich-text-content prose prose-sm dark:prose-invert max-w-none',
          className
        )}
      >
        {parse(html, parserOptions)}
      </div>
    );
  }

  // Fallback to plain text with mention highlighting
  if (content) {
    const parts = React.useMemo(() => {
      const result: Array<{ type: 'text' | 'mention'; value: string }> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      // Reset lastIndex before exec() loop to ensure consistent behavior
      MENTION_REGEX.lastIndex = 0;

      while ((match = MENTION_REGEX.exec(content)) !== null) {
        if (match.index > lastIndex) {
          result.push({
            type: 'text',
            value: content.slice(lastIndex, match.index),
          });
        }

        result.push({
          type: 'mention',
          value: match[1]!,
        });

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < content.length) {
        result.push({
          type: 'text',
          value: content.slice(lastIndex),
        });
      }

      return result;
    }, [content]);

    return (
      <p className={cn('whitespace-pre-wrap break-words', className)}>
        {parts.map((part, index) => {
          if (part.type === 'mention') {
            return (
              <button
                key={index}
                type="button"
                className="text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`View ${part.value}'s profile`}
                onClick={(e) => {
                  e.stopPropagation();
                  onMentionClick?.(part.value);
                }}
              >
                @{part.value}
              </button>
            );
          }
          return <React.Fragment key={index}>{part.value}</React.Fragment>;
        })}
      </p>
    );
  }

  return null;
}
