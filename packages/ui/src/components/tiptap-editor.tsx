'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Mention from '@tiptap/extension-mention';
import { cn } from '../utils';
import {
  MentionList,
  type MentionSuggestion,
  type MentionListRef,
} from './mention-list';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { Button } from './button';

export interface TiptapEditorProps {
  value: string;
  onChange: (content: string, html: string) => void;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  className?: string | undefined;
  minHeight?: string | undefined;
  maxLength?: number | undefined;
  /** Key to force remount and clear editor state */
  editorKey?: string | number | undefined;
  /** Callback to search for mention suggestions */
  onMentionQuery?:
    | ((query: string) => Promise<MentionSuggestion[]>)
    | undefined;
  /** Callback to search for artist mention suggestions */
  onArtistMentionQuery?:
    | ((query: string) => Promise<MentionSuggestion[]>)
    | undefined;
  /** Placeholder text for user mention suggestions */
  mentionPlaceholder?: string | undefined;
  /** Placeholder text for artist mention suggestions */
  artistMentionPlaceholder?: string | undefined;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "What's on your mind?",
  readOnly = false,
  className,
  minHeight = '100px',
  maxLength,
  editorKey,
  onMentionQuery,
  onArtistMentionQuery,
  mentionPlaceholder,
  artistMentionPlaceholder,
}: TiptapEditorProps) {
  const [mentionQuery, setMentionQuery] = React.useState('');
  const [artistQuery, setArtistQuery] = React.useState('');
  const [mentionSuggestions, setMentionSuggestions] = React.useState<
    MentionSuggestion[]
  >([]);
  const [artistSuggestions, setArtistSuggestions] = React.useState<
    MentionSuggestion[]
  >([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [isLoadingArtistSuggestions, setIsLoadingArtistSuggestions] =
    React.useState(false);
  const [mentionError, setMentionError] = React.useState<string | null>(null);
  const [artistMentionError, setArtistMentionError] = React.useState<
    string | null
  >(null);

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
          // Return current suggestions from ref to avoid stale closure
          return mentionSuggestionsRef.current;
        },
        render: () => {
          let popup: HTMLDivElement | null = null;
          let reactRoot: ReturnType<
            typeof import('react-dom/client').createRoot
          > | null = null;
          let currentCommand:
            | ((attrs: { id: string; label: string }) => void)
            | null = null;
          let currentItems: MentionSuggestion[] = [];
          let currentSelectedIndex = 0;
          let currentQuery = '';

          const resolveClientRect = (
            props: SuggestionRectProps
          ): DOMRect | null => {
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

            // Calculate positions
            let top = rect.bottom + scrollY + 8;
            let left = rect.left + scrollX;

            // Check if popup would overflow bottom of viewport
            if (rect.bottom + popupHeight + 8 > viewportHeight) {
              // Position above the cursor instead
              top = rect.top + scrollY - popupHeight - 8;
            }

            // Check if popup would overflow right of viewport
            if (left + popupWidth > viewportWidth + scrollX) {
              left = viewportWidth + scrollX - popupWidth - 8;
            }

            // Ensure popup doesn't go off the left edge
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
                placeholder: mentionPlaceholder,
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

              // Create React root once
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
                  (currentSelectedIndex - 1 + currentItems.length) %
                  currentItems.length;
                renderMentionList();
                return true;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                currentSelectedIndex =
                  (currentSelectedIndex + 1) % currentItems.length;
                renderMentionList();
                return true;
              }

              if (event.key === 'Enter') {
                event.preventDefault();
                const selectedItem = currentItems[currentSelectedIndex];
                if (selectedItem && currentCommand) {
                  const mentionLabel =
                    selectedItem.username ?? selectedItem.label;
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
              // Cleanup React root properly
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
        class: 'tiptap-mention',
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
          `#${node.attrs.label ?? node.attrs.id}`,
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
          let reactRoot: ReturnType<
            typeof import('react-dom/client').createRoot
          > | null = null;
          let currentCommand:
            | ((attrs: { id: string; label: string }) => void)
            | null = null;
          let currentItems: MentionSuggestion[] = [];
          let currentSelectedIndex = 0;
          let currentQuery = '';

          const resolveClientRect = (
            props: SuggestionRectProps
          ): DOMRect | null => {
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
                placeholder: artistMentionPlaceholder,
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
                  (currentSelectedIndex - 1 + currentItems.length) %
                  currentItems.length;
                renderMentionList();
                return true;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                currentSelectedIndex =
                  (currentSelectedIndex + 1) % currentItems.length;
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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      // Use CharacterCount extension for proper max length handling
      ...(maxLength
        ? [
            CharacterCount.configure({
              limit: maxLength,
            }),
          ]
        : []),
      mentionExtension,
      artistMentionExtension,
    ],
    content: value,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText().trim();
      const html = editor.getHTML();
      onChange(text, html);
    },
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
  const isNearLimit = maxLength ? characterCount >= maxLength * 0.9 : false;
  const isAtLimit = maxLength ? characterCount >= maxLength : false;

  return (
    <div
      className={cn(
        'tiptap-editor rounded-md border border-input bg-background',
        readOnly && 'opacity-50 pointer-events-none',
        className
      )}
      style={{
        ['--min-height' as string]: minHeight,
      }}
    >
      {editor && <TiptapToolbar editor={editor} />}
      <EditorContent editor={editor} />
      {maxLength && (
        <div
          className={cn(
            'text-xs px-3 py-1 text-right text-muted-foreground',
            isNearLimit && 'text-yellow-600',
            isAtLimit && 'text-destructive'
          )}
        >
          {characterCount}/{maxLength}
        </div>
      )}
    </div>
  );
}

interface TiptapToolbarProps {
  editor: ReturnType<typeof useEditor>;
}

function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = React.useState(false);

  if (!editor) {
    return null;
  }

  const handleSetLink = () => {
    if (linkUrl) {
      // Validate URL
      try {
        new URL(linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`);
        const finalUrl = linkUrl.startsWith('http')
          ? linkUrl
          : `https://${linkUrl}`;
        editor.chain().focus().setLink({ href: finalUrl }).run();
      } catch {
        // Invalid URL - still set it but log warning
        console.warn('Invalid URL format:', linkUrl);
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
    }
    setLinkUrl('');
    setIsLinkPopoverOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setIsLinkPopoverOpen(false);
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    label,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 rounded hover:bg-muted transition-colors',
        isActive && 'bg-muted text-primary'
      )}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );

  return (
    <div
      className="tiptap-toolbar flex flex-wrap gap-1 p-2 border-b border-border bg-muted/50 rounded-t-md"
      role="toolbar"
      aria-label="Text formatting"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        label="Bold"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        label="Italic"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        label="Underline"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        label="Strikethrough"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
        </svg>
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" role="separator" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        label="Quote"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        label="Code Block"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
        </svg>
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" role="separator" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        label="Bullet List"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        label="Numbered List"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
        </svg>
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" role="separator" />
      <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'p-2 rounded hover:bg-muted transition-colors',
              editor.isActive('link') && 'bg-muted text-primary'
            )}
            title="Insert Link"
            aria-label="Insert Link"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="link-url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSetLink();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSetLink} disabled={!linkUrl}>
                Apply
              </Button>
              {editor.isActive('link') && (
                <Button size="sm" variant="outline" onClick={handleRemoveLink}>
                  Remove Link
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        label="Clear Formatting"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
