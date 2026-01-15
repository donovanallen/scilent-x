'use client';

import * as React from 'react';

export interface UseEditPostOptions<T extends { id: string; content: string; contentHtml?: string | null }> {
  /**
   * Array of posts to manage edit state for
   */
  posts: T[];
  /**
   * Callback to update posts (e.g., setPosts from useState)
   */
  setPosts: React.Dispatch<React.SetStateAction<T[]>>;
  /**
   * API call to save the edited post
   */
  onSave: (postId: string, content: string, contentHtml: string) => Promise<void>;
  /**
   * Callback when edit succeeds
   */
  onSuccess?: () => void;
  /**
   * Callback when edit fails
   */
  onError?: (error: Error) => void;
}

export interface UseEditPostReturn {
  /**
   * ID of the post currently being edited (null if none)
   */
  editingPostId: string | null;
  /**
   * Whether the current edit is being saved
   */
  isSavingEdit: boolean;
  /**
   * Start editing a post
   */
  startEditing: (postId: string) => void;
  /**
   * Cancel editing
   */
  cancelEditing: () => void;
  /**
   * Save the edited post with optimistic update
   */
  saveEdit: (postId: string, content: string, contentHtml: string) => Promise<void>;
}

/**
 * Hook to manage post editing state with optimistic updates.
 * Handles edit mode toggling, saving, and rollback on error.
 */
export function useEditPost<T extends { id: string; content: string; contentHtml?: string | null }>({
  posts,
  setPosts,
  onSave,
  onSuccess,
  onError,
}: UseEditPostOptions<T>): UseEditPostReturn {
  const [editingPostId, setEditingPostId] = React.useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  
  // Store original posts for rollback
  const originalPostsRef = React.useRef<T[]>([]);

  const startEditing = React.useCallback((postId: string) => {
    setEditingPostId(postId);
  }, []);

  const cancelEditing = React.useCallback(() => {
    setEditingPostId(null);
  }, []);

  const saveEdit = React.useCallback(
    async (postId: string, content: string, contentHtml: string) => {
      if (isSavingEdit) return;

      setIsSavingEdit(true);

      // Store original posts for rollback
      originalPostsRef.current = [...posts];

      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, content, contentHtml } : post
        )
      );

      try {
        await onSave(postId, content, contentHtml);
        setEditingPostId(null);
        onSuccess?.();
      } catch (error) {
        // Rollback on error
        setPosts(originalPostsRef.current);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsSavingEdit(false);
      }
    },
    [posts, setPosts, onSave, onSuccess, onError, isSavingEdit]
  );

  return {
    editingPostId,
    isSavingEdit,
    startEditing,
    cancelEditing,
    saveEdit,
  };
}
