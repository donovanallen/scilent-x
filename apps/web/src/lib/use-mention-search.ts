'use client';

import * as React from 'react';

export interface MentionSearchResult {
  id: string;
  label: string;
  username?: string;
  avatarUrl?: string | null;
  image?: string | null;
}

export interface UseMentionSearchOptions {
  /** Minimum query length before searching */
  minQueryLength?: number;
  /** Maximum number of results to return */
  limit?: number;
}

export interface UseMentionSearchReturn {
  /** Search function to be passed to TiptapEditor's onMentionQuery */
  searchUsers: (query: string) => Promise<MentionSearchResult[]>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Custom hook for mention search functionality
 * Wraps the /api/v1/users/search endpoint with debouncing and error handling
 */
export function useMentionSearch(
  options: UseMentionSearchOptions = {}
): UseMentionSearchReturn {
  const { minQueryLength = 1, limit = 10 } = options;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const searchUsers = React.useCallback(
    async (query: string): Promise<MentionSearchResult[]> => {
      // Don't search if query is too short
      if (query.length < minQueryLength) {
        return [];
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          limit: limit.toString(),
        });

        const response = await fetch(`/api/v1/users/search?${params}`);

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform API response to MentionSearchResult format
        return (data.items || [])
          .filter(
            (user: {
              id: string;
              name?: string | null;
              username?: string | null;
              avatarUrl?: string | null;
              image?: string | null;
            }) => Boolean(user.username)
          )
          .map(
            (user: {
              id: string;
              name?: string | null;
              username?: string | null;
              avatarUrl?: string | null;
              image?: string | null;
            }) => ({
              id: user.id,
              label: user.name || user.username || 'Unknown',
              username: user.username || undefined,
              avatarUrl: user.avatarUrl,
              image: user.image,
            })
          );
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to search users');
        setError(error);
        console.error('Mention search error:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [minQueryLength, limit]
  );

  return {
    searchUsers,
    isLoading,
    error,
  };
}
