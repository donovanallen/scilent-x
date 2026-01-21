'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Mention from '@tiptap/extension-mention';
import { cn } from '../utils';
import {
  MentionList,
  type MentionSuggestion,
  type MentionListRef,
} from './mention-list';

export interface SimpleTiptapEditorProps {
  value: string;
  onChange: (content: string, html: string) => void;
  placeholder?: string | undefined;
  maxLength?: number | undefined;
  readOnly?: boolean | undefined;
  /** Key to force remount and clear editor state */
  editorKey?: string | number | undefined;
  /** Callback to search for mention suggestions */
  onMentionQuery?: ((query: string) => Promise<MentionSuggestion[]>) | undefined;
  /** Callback to search for artist mention suggestions */
  onArtistMentionQuery?: ((query: string) => Promise<MentionSuggestion[]>) | undefined;
  /** Called on Enter key (Shift+Enter for newline) */
  onSubmit?: (() => void) | undefined;
  className?: string | undefined;
}

export function SimpleTiptapEditor({
  value,
  onChange,
  placeholder = 'Write a comment...',
  maxLength = 2000,
  readOnly = false,
  editorKey,
  onMentionQuery,
  onArtistMentionQuery,
  onSubmit,
  className,
}: SimpleTiptapEditorProps) {
  const [mentionQuery, setMentionQuery] = React.useState('');
  const [artistQuery, setArtistQuery] = React.useState('');
  const [mentionSuggestions, setMentionSuggestions] = React.useState<MentionSuggestion[]>([]);
  const [artistSuggestions, setArtistSuggestions] = React.useState<MentionSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [isLoadingArtistSuggestions, setIsLoadingArtistSuggestions] = React.useState(false);
  const [mentionError, setMentionError] = React.useState<string | null>(null);
  const [artistMentionError, setArtistMentionError] = React.useState<string | null>(null);

  // Use refs to avoid stale closure issues in the mention extension
  const mentionSuggestionsRef = React.useRef<MentionSuggestion[]>([]);
  const artistSuggestionsRef = React.useRef<MentionSuggestion[]>([]);
  const isLoadingRef = React.useRef(false);
  const isLoadingArtistRef = React.useRef(false);
  const mentionErrorRef = React.useRef<string | null>(null);
  const artistMentionErrorRef = React.useRef<string | null>(null);
  const mentionListRef = React.useRef<MentionListRef>(null);
  const artistMentionListRef = React.useRef<MentionListRef>(null);

  // Keep refs in sync with state
  React.useEffect(() => {
    mentionSuggestionsRef.current = mentionSuggestions;
  }, [mentionSuggestions]);

  React.useEffect(() => {
    artistSuggestionsRef.current = artistSuggestions;
  }, [artistSuggestions]);

  React.useEffect(() => {
    isLoadingRef.current = isLoadingSuggestions;
  }, [isLoadingSuggestions]);

  React.useEffect(() => {
    isLoadingArtistRef.current = isLoadingArtistSuggestions;
  }, [isLoadingArtistSuggestions]);

  React.useEffect(() => {
    mentionErrorRef.current = mentionError;
  }, [mentionError]);

  React.useEffect(() => {
    artistMentionErrorRef.current = artistMentionError;
  }, [artistMentionError]);

  type SuggestionRectProps = {
    clientRect?: (() => DOMRect | null) | null | undefined;
    editor: {
      view: {
        coordsAtPos: (pos: number) => {
          left: number;
          right: number;
          top: number;
          bottom: number;
        };
      };
    };
    range: { from: number };
    query?: string | null | undefined;
  };

  // Debounce the mention query
  React.useEffect(() => {
    if (!mentionQuery || !onMentionQuery) {
      setMentionSuggestions([]);
      setMentionError(null);
      setIsLoadingSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      setMentionError(null);
      try {
        const results = await onMentionQuery(mentionQuery);
        setMentionSuggestions(results);
      } catch (error) {
        console.error('Failed to fetch mention suggestions:', error);
        setMentionSuggestions([]);
        setMentionError(
          error instanceof Error ? error.message : 'Failed to search users'
        );
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mentionQuery, onMentionQuery]);

  // Debounce the artist mention query
  React.useEffect(() => {
    if (!artistQuery || !onArtistMentionQuery) {
      setArtistSuggestions([]);
      setArtistMentionError(null);
      setIsLoadingArtistSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingArtistSuggestions(true);
      setArtistMentionError(null);
      try {
        const results = await onArtistMentionQuery(artistQuery);
        setArtistSuggestions(results);
      } catch (error) {
        console.error('Failed to fetch artist suggestions:', error);
        setArtistSuggestions([]);
        setArtistMentionError(
          error instanceof Error ? error.message : 'Failed to search artists'
        );
      } finally {
        setIsLoadingArtistSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [artistQuery, onArtistMentionQuery]);

  const mentionExtension = React.useMemo(() => {
    return Mention.extend({
      name: 'userMention',
      parseHTML() {
        return [
          {
            tag: 'span[data-mention-type="USER"]',
            getAttrs: (element) => {
              const el = element as HTMLElement;
              return {
                id: el.getAttribute('data-mention-id'),
                label: el.getAttribute('data-mention-label'),
              };
            },
          },
        ];
      },
    }).configure({
      HTMLAttributes: {
        class: 'tiptap-mention',
      },
      renderHTML({ options, node }) {
        return [
          'span',
          {
            class: options.HTMLAttributes.class,
            'data-mention-type': 'USER',
            'data-mention-id': node.attrs.id,
            'data-mention-label': node.attrs.label,
          },
          `@${node.attrs.label ?? node.attrs.id}`,
        ];
      },
      renderText({ node }) {
        return `@${node.attrs.label ?? node.attrs.id}`;
      },
      suggestion: {
        char: '@',
        items: ({ query }) => {
          setMentionQuery(query);
          return mentionSuggestionsRef.current;
        },
        render: () => {
          let popup: HTMLDivElement | null = null;
          let reactRoot: ReturnType<typeof import('react-dom/client').createRoot> | null = null;
          let currentCommand: ((attrs: { id: string; label: string }) => void) | null = null;
          let currentItems: MentionSuggestion[] = [];
          let currentSelectedIndex = 0;
          let currentQuery = '';

          const resolveClientRect = (props: SuggestionRectProps): DOMRect | null => {
            const rect = props.clientRect?.();
            if (rect) return rect;
            const coords = props.editor.view.coordsAtPos(props.range.from);
            return new DOMRect(
              coords.left,
              coords.top,
              coords.right - coords.left,
              coords.bottom - coords.top
            );
          };

          const updatePopupPosition = (rect: DOMRect | null) => {
            if (!rect || !popup) return;

            const popupHeight = popup.offsetHeight || 300;
            const popupWidth = popup.offsetWidth || 200;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = rect.bottom + scrollY + 8;
            let left = rect.left + scrollX;

            if (rect.bottom + popupHeight + 8 > viewportHeight) {
              top = rect.top + scrollY - popupHeight - 8;
            }

            if (left + popupWidth > viewportWidth + scrollX) {
              left = viewportWidth + scrollX - popupWidth - 8;
            }

            if (left < scrollX + 8) {
              left = scrollX + 8;
            }

            popup.style.position = 'absolute';
            popup.style.left = `${left}px`;
            popup.style.top = `${top}px`;
            popup.style.zIndex = '50';
          };

          const renderMentionList = () => {
            if (!popup || !reactRoot) return;

            const wrappedCommand = (item: MentionSuggestion) => {
              if (currentCommand) {
                const mentionLabel = item.username ?? item.label;
                currentCommand({ id: item.id, label: mentionLabel });
              }
            };

            const handleSelect = (index: number) => {
              currentSelectedIndex = index;
            };

            reactRoot.render(
              React.createElement(MentionList, {
                ref: mentionListRef,
                items: currentItems,
                command: wrappedCommand,
                isLoading: isLoadingRef.current,
                error: mentionErrorRef.current,
                placeholder: 'Search for a user',
                hasQuery: currentQuery.length > 0,
                selectedIndex: currentSelectedIndex,
                onSelect: handleSelect,
              })
            );
          };

          return {
            onStart: (props) => {
              popup = document.createElement('div');
              popup.className = 'tiptap-mention-popup';
              document.body.appendChild(popup);
              updatePopupPosition(resolveClientRect(props));

              import('react-dom/client').then(({ createRoot }) => {
                if (popup) {
                  reactRoot = createRoot(popup);
                  currentItems = props.items as MentionSuggestion[];
                  currentCommand = props.command;
                  currentSelectedIndex = 0;
                  currentQuery = props.query ?? '';
                  renderMentionList();
                  requestAnimationFrame(() => {
                    updatePopupPosition(resolveClientRect(props));
                  });
                }
              });
            },
            onUpdate: (props) => {
              updatePopupPosition(resolveClientRect(props));
              currentItems = props.items as MentionSuggestion[];
              currentCommand = props.command;
              currentQuery = props.query ?? '';
              renderMentionList();
            },
            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                popup?.remove();
                return true;
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                currentSelectedIndex =
                  (currentSelectedIndex - 1 + currentItems.length) % currentItems.length;
                renderMentionList();
                return true;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                currentSelectedIndex = (currentSelectedIndex + 1) % currentItems.length;
                renderMentionList();
                return true;
              }

              if (event.key === 'Enter') {
                event.preventDefault();
                const selectedItem = currentItems[currentSelectedIndex];
                if (selectedItem && currentCommand) {
                  const mentionLabel = selectedItem.username ?? selectedItem.label;
                  currentCommand({
                    id: selectedItem.id,
                    label: mentionLabel,
                  });
                }
                return true;
              }

              return false;
            },
            onExit: () => {
              if (reactRoot) {
                reactRoot.unmount();
                reactRoot = null;
              }
              popup?.remove();
              popup = null;
              setMentionQuery('');
              setIsLoadingSuggestions(false);
            },
          };
        },
      },
    });
  }, []);

  const artistMentionExtension = React.useMemo(() => {
    return Mention.extend({
      name: 'artistMention',
      parseHTML() {
        return [
          {
            tag: 'span[data-mention-type="ARTIST"]',
            getAttrs: (element) => {
              const el = element as HTMLElement;
              return {
                id: el.getAttribute('data-mention-id'),
                label: el.getAttribute('data-mention-label'),
              };
            },
          },
        ];
      },
    }).configure({
      HTMLAttributes: {
        class: 'tiptap-mention tiptap-mention--artist',
      },
      renderHTML({ options, node }) {
        return [
          'span',
          {
            class: options.HTMLAttributes.class,
            'data-mention-type': 'ARTIST',
            'data-mention-id': node.attrs.id,
            'data-mention-label': node.attrs.label,
          },
          node.attrs.label ?? node.attrs.id,
        ];
      },
      renderText({ node }) {
        return `#${node.attrs.label ?? node.attrs.id}`;
      },
      suggestion: {
        char: '#',
        items: ({ query }) => {
          setArtistQuery(query);
          return artistSuggestionsRef.current;
        },
        render: () => {
          let popup: HTMLDivElement | null = null;
          let reactRoot: ReturnType<typeof import('react-dom/client').createRoot> | null = null;
          let currentCommand: ((attrs: { id: string; label: string }) => void) | null = null;
          let currentItems: MentionSuggestion[] = [];
          let currentSelectedIndex = 0;
          let currentQuery = '';

          const resolveClientRect = (props: SuggestionRectProps): DOMRect | null => {
            const rect = props.clientRect?.();
            if (rect) return rect;
            const coords = props.editor.view.coordsAtPos(props.range.from);
            return new DOMRect(
              coords.left,
              coords.top,
              coords.right - coords.left,
              coords.bottom - coords.top
            );
          };

          const updatePopupPosition = (rect: DOMRect | null) => {
            if (!rect || !popup) return;

            const popupHeight = popup.offsetHeight || 300;
            const popupWidth = popup.offsetWidth || 200;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = rect.bottom + scrollY + 8;
            let left = rect.left + scrollX;

            if (rect.bottom + popupHeight + 8 > viewportHeight) {
              top = rect.top + scrollY - popupHeight - 8;
            }

            if (left + popupWidth > viewportWidth + scrollX) {
              left = viewportWidth + scrollX - popupWidth - 8;
            }

            if (left < scrollX + 8) {
              left = scrollX + 8;
            }

            popup.style.position = 'absolute';
            popup.style.left = `${left}px`;
            popup.style.top = `${top}px`;
            popup.style.zIndex = '50';
          };

          const renderMentionList = () => {
            if (!popup || !reactRoot) return;

            const wrappedCommand = (item: MentionSuggestion) => {
              if (currentCommand) {
                currentCommand({ id: item.id, label: item.label });
              }
            };

            const handleSelect = (index: number) => {
              currentSelectedIndex = index;
            };

            reactRoot.render(
              React.createElement(MentionList, {
                ref: artistMentionListRef,
                items: currentItems,
                command: wrappedCommand,
                isLoading: isLoadingArtistRef.current,
                error: artistMentionErrorRef.current,
                placeholder: 'Search for an artist',
                hasQuery: currentQuery.length > 0,
                selectedIndex: currentSelectedIndex,
                onSelect: handleSelect,
              })
            );
          };

          return {
            onStart: (props) => {
              popup = document.createElement('div');
              popup.className = 'tiptap-mention-popup';
              document.body.appendChild(popup);
              updatePopupPosition(resolveClientRect(props));

              import('react-dom/client').then(({ createRoot }) => {
                if (popup) {
                  reactRoot = createRoot(popup);
                  currentItems = props.items as MentionSuggestion[];
                  currentCommand = props.command;
                  currentSelectedIndex = 0;
                  currentQuery = props.query ?? '';
                  renderMentionList();
                  requestAnimationFrame(() => {
                    updatePopupPosition(resolveClientRect(props));
                  });
                }
              });
            },
            onUpdate: (props) => {
              updatePopupPosition(resolveClientRect(props));
              currentItems = props.items as MentionSuggestion[];
              currentCommand = props.command;
              currentQuery = props.query ?? '';
              renderMentionList();
            },
            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                popup?.remove();
                return true;
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                currentSelectedIndex =
                  (currentSelectedIndex - 1 + currentItems.length) % currentItems.length;
                renderMentionList();
                return true;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                currentSelectedIndex = (currentSelectedIndex + 1) % currentItems.length;
                renderMentionList();
                return true;
              }

              if (event.key === 'Enter') {
                event.preventDefault();
                const selectedItem = currentItems[currentSelectedIndex];
                if (selectedItem && currentCommand) {
                  currentCommand({
                    id: selectedItem.id,
                    label: selectedItem.label,
                  });
                }
                return true;
              }

              return false;
            },
            onExit: () => {
              if (reactRoot) {
                reactRoot.unmount();
                reactRoot = null;
              }
              popup?.remove();
              popup = null;
              setArtistQuery('');
              setIsLoadingArtistSuggestions(false);
            },
          };
        },
      },
    });
  }, []);

  const [isFocused, setIsFocused] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // Use StarterKit but disable most features - we only want basic text
      StarterKit.configure({
        // Disable features we don't want in comments
        heading: false,
        horizontalRule: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        bold: false,
        italic: false,
        strike: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      mentionExtension,
      artistMentionExtension,
    ],
    content: value,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'simple-tiptap-editor-content',
      },
      handleKeyDown: (_view, event) => {
        // Submit on Enter (without Shift), but only if no mention popup is active
        if (event.key === 'Enter' && !event.shiftKey) {
          // Check if mention popup is open
          const mentionPopup = document.querySelector('.tiptap-mention-popup');
          if (!mentionPopup && onSubmit) {
            event.preventDefault();
            onSubmit();
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText().trim();
      const html = editor.getHTML();
      onChange(text, html);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  // Reset editor when key changes
  React.useEffect(() => {
    if (editor && value === '') {
      editor.commands.clearContent();
    }
  }, [editorKey, editor, value]);

  // Update editable state
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  // Get character count info
  const characterCount = editor?.storage.characterCount?.characters() ?? 0;
  const isNearLimit = characterCount >= maxLength * 0.9;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div
      className={cn(
        'simple-tiptap-editor rounded-md border bg-background transition-colors duration-200',
        isFocused ? 'border-brand ring-1 ring-brand' : 'border-input',
        readOnly && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <EditorContent editor={editor} />
      {/* Character count footer */}
      <div className="flex items-center justify-end px-2 py-1 border-t border-border/50">
        <div
          className={cn(
            'text-xs text-muted-foreground',
            isNearLimit && 'text-yellow-600',
            isAtLimit && 'text-destructive'
          )}
        >
          {characterCount}/{maxLength}
        </div>
      </div>
    </div>
  );
}
