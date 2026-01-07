'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface RichTextContentProps {
  html?: string | null | undefined;
  content?: string;
  className?: string;
  onMentionClick?: ((username: string) => void) | undefined;
}

// Regex to match @username mentions
const MENTION_REGEX = /@([a-zA-Z][a-zA-Z0-9_]{0,29})/g;

/**
 * RichTextContent renders HTML content from the rich text editor
 * with proper styling and mention support.
 *
 * If html is provided, it renders the HTML content.
 * If only content (plain text) is provided, it falls back to plain text
 * with mention highlighting.
 */
export function RichTextContent({
  html,
  content,
  className,
  onMentionClick,
}: RichTextContentProps) {
  // If we have HTML content, render it
  if (html) {
    // Process HTML to add mention interactivity
    const processedHtml = React.useMemo(() => {
      return html.replace(MENTION_REGEX, (match, username) => {
        return `<button type="button" class="rich-text-mention text-primary hover:underline font-medium" data-mention="${username}">${match}</button>`;
      });
    }, [html]);

    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('rich-text-mention')) {
          e.stopPropagation();
          const username = target.getAttribute('data-mention');
          if (username && onMentionClick) {
            onMentionClick(username);
          }
        }
      },
      [onMentionClick]
    );

    return (
      <div
        className={cn('rich-text-content prose prose-sm dark:prose-invert max-w-none', className)}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        onClick={handleClick}
      />
    );
  }

  // Fallback to plain text with mention highlighting
  if (content) {
    const parts = React.useMemo(() => {
      const result: Array<{ type: 'text' | 'mention'; value: string }> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

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
                className="text-primary hover:underline font-medium"
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
