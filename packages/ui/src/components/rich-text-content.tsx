'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface RichTextContentProps {
  html?: string | null | undefined;
  content?: string;
  className?: string;
  onMentionClick?: ((username: string) => void) | undefined;
}

// Regex to match @username mentions (global flag for replace/exec)
// Note: String.replace() with global flag handles lastIndex correctly.
// For exec() loops, we reset lastIndex = 0 before each use.
const MENTION_REGEX = /@([a-zA-Z][a-zA-Z0-9_]{0,29})/g;

// Regex to match Tiptap data-mention attributes
const TIPTAP_MENTION_REGEX = /<span[^>]*data-mention-type="([^"]*)"[^>]*data-mention-id="([^"]*)"[^>]*data-mention-label="([^"]*)"[^>]*>@[^<]*<\/span>/g;

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
    // Process HTML to add mention interactivity with accessibility attributes
    const processedHtml = React.useMemo(() => {
      let result = html;
      
      // First, handle Tiptap-style mentions (data-mention-* attributes)
      // Convert them to interactive buttons while preserving the mention data
      result = result.replace(
        TIPTAP_MENTION_REGEX,
        (_match, type, id, label) => {
          return `<button type="button" class="rich-text-mention tiptap-mention text-primary hover:underline font-medium" data-mention="${label}" data-mention-type="${type}" data-mention-id="${id}" aria-label="View ${label}'s profile">@${label}</button>`;
        }
      );
      
      // Then handle plain @username mentions (backwards compatibility)
      // Only replace mentions that aren't already wrapped in buttons
      result = result.replace(
        /(?<!<button[^>]*>)@([a-zA-Z][a-zA-Z0-9_]{0,29})(?![^<]*<\/button>)/g,
        (match, username) => {
          return `<button type="button" class="rich-text-mention text-primary hover:underline font-medium" data-mention="${username}" aria-label="View ${username}'s profile">${match}</button>`;
        }
      );
      
      return result;
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
