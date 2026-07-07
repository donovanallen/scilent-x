'use client';

import * as React from 'react';

export interface MentionTextProps {
  content: string;
  className?: string;
  onMentionClick?: ((username: string) => void) | undefined;
}

// Regex to match @username mentions
const MENTION_REGEX = /@([a-zA-Z][a-zA-Z0-9_]{0,29})/g;

export function MentionText({
  content,
  className,
  onMentionClick,
}: MentionTextProps) {
  const parts = React.useMemo(() => {
    const result: Array<{ type: 'text' | 'mention'; value: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex state
    MENTION_REGEX.lastIndex = 0;

    while ((match = MENTION_REGEX.exec(content)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          value: content.slice(lastIndex, match.index),
        });
      }

      // Add the mention
      result.push({
        type: 'mention',
        value: match[1]!,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        value: content.slice(lastIndex),
      });
    }

    return result;
  }, [content]);

  return (
    <p className={className}>
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
