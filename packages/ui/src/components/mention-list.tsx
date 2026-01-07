'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface MentionSuggestion {
  id: string;
  label: string;
  username?: string;
  avatarUrl?: string | null;
  image?: string | null;
}

export interface MentionListProps {
  items: MentionSuggestion[];
  command: (item: MentionSuggestion) => void;
  isLoading?: boolean;
}

export const MentionList = React.forwardRef<HTMLDivElement, MentionListProps>(
  ({ items, command, isLoading }, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    // Reset selection when items change
    React.useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          if (items[selectedIndex]) {
            command(items[selectedIndex]);
          }
          return true;
        }

        return false;
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [items, selectedIndex, command]);

    if (isLoading) {
      return (
        <div
          ref={ref}
          className="bg-popover border border-border rounded-md shadow-md p-2 min-w-[200px]"
        >
          <div className="flex items-center gap-2 p-2 text-muted-foreground">
            <LoadingSpinner />
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div
          ref={ref}
          className="bg-popover border border-border rounded-md shadow-md p-2 min-w-[200px]"
        >
          <div className="p-2 text-muted-foreground text-sm">No users found</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="bg-popover border border-border rounded-md shadow-md overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => command(item)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
              'hover:bg-accent focus:bg-accent focus:outline-none',
              index === selectedIndex && 'bg-accent'
            )}
          >
            <MentionAvatar item={item} />
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate">{item.label}</span>
              {item.username && (
                <span className="text-sm text-muted-foreground truncate">
                  @{item.username}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';

function MentionAvatar({ item }: { item: MentionSuggestion }) {
  const avatarSrc = item.avatarUrl || item.image;
  const initials = item.label
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={item.label}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
      {initials || '?'}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
