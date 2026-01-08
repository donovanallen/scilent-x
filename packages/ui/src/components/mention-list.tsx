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
  error?: string | null;
  /** Controlled selected index from parent */
  selectedIndex?: number;
  /** Callback when selection changes */
  onSelect?: (index: number) => void;
}

export interface MentionListRef {
  getSelectedIndex: () => number;
  setSelectedIndex: (index: number) => void;
  selectItem: (index: number) => void;
}

export const MentionList = React.forwardRef<MentionListRef, MentionListProps>(
  ({ items, command, isLoading, error, selectedIndex = 0, onSelect }, ref) => {
    const [internalSelectedIndex, setInternalSelectedIndex] =
      React.useState(selectedIndex);

    // Use controlled index if provided, otherwise internal state
    const currentIndex =
      selectedIndex !== undefined ? selectedIndex : internalSelectedIndex;

    // Sync internal state with controlled index
    React.useEffect(() => {
      if (selectedIndex !== undefined) {
        setInternalSelectedIndex(selectedIndex);
      }
    }, [selectedIndex]);

    // Reset selection when items change
    React.useEffect(() => {
      setInternalSelectedIndex(0);
      onSelect?.(0);
    }, [items, onSelect]);

    // Expose imperative handle for parent to control selection
    React.useImperativeHandle(
      ref,
      () => ({
        getSelectedIndex: () => currentIndex,
        setSelectedIndex: (index: number) => {
          setInternalSelectedIndex(index);
          onSelect?.(index);
        },
        selectItem: (index: number) => {
          if (items[index]) {
            command(items[index]);
          }
        },
      }),
      [currentIndex, items, command, onSelect]
    );

    // Scroll selected item into view
    const selectedRef = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      selectedRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }, [currentIndex]);

    if (isLoading) {
      return (
        <div
          className="bg-popover border border-border rounded-md shadow-md p-2 min-w-[200px]"
          role="listbox"
          aria-busy="true"
          aria-label="Loading mention suggestions"
        >
          <div className="flex items-center gap-2 p-2 text-muted-foreground">
            <LoadingSpinner />
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="bg-popover border border-border rounded-md shadow-md p-2 min-w-[200px]"
          role="alert"
        >
          <div className="flex items-center gap-2 p-2 text-destructive">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div
          className="bg-popover border border-border rounded-md shadow-md p-2 min-w-[200px]"
          role="listbox"
          aria-label="No results"
        >
          <div className="p-2 text-muted-foreground text-sm">No users found</div>
        </div>
      );
    }

    return (
      <div
        className="bg-popover border border-border rounded-md shadow-md overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto"
        role="listbox"
        aria-label="Mention suggestions"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={index === currentIndex ? selectedRef : null}
            type="button"
            role="option"
            aria-selected={index === currentIndex}
            onClick={() => command(item)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
              'hover:bg-accent focus:bg-accent focus:outline-none',
              index === currentIndex && 'bg-accent'
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
        alt=""
        aria-hidden="true"
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
      aria-hidden="true"
    >
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
      aria-hidden="true"
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
