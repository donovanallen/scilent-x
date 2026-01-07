'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { cn } from '../utils';
import { MentionList, type MentionSuggestion } from './mention-list';

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
  onMentionQuery?: ((query: string) => Promise<MentionSuggestion[]>) | undefined;
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
}: TiptapEditorProps) {
  const [mentionQuery, setMentionQuery] = React.useState('');
  const [mentionSuggestions, setMentionSuggestions] = React.useState<MentionSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);

  // Debounce the mention query
  React.useEffect(() => {
    if (!mentionQuery || !onMentionQuery) {
      setMentionSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await onMentionQuery(mentionQuery);
        setMentionSuggestions(results);
      } catch (error) {
        console.error('Failed to fetch mention suggestions:', error);
        setMentionSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mentionQuery, onMentionQuery]);

  const mentionExtension = React.useMemo(() => {
    return Mention.configure({
      HTMLAttributes: {
        class: 'tiptap-mention',
      },
      renderHTML({ options, node }) {
        return [
          'span',
          {
            'class': options.HTMLAttributes.class,
            'data-mention-type': 'user',
            'data-mention-id': node.attrs.id,
            'data-mention-label': node.attrs.label,
          },
          `@${node.attrs.label ?? node.attrs.id}`,
        ];
      },
      suggestion: {
        char: '@',
        items: ({ query }) => {
          setMentionQuery(query);
          return mentionSuggestions;
        },
        render: () => {
          let popup: HTMLDivElement | null = null;
          // Store the current command function
          let currentCommand: ((attrs: { id: string; label: string }) => void) | null = null;
          let currentItems: MentionSuggestion[] = [];

          const renderMentionList = () => {
            if (!popup) return;

            const root = document.createElement('div');
            popup.innerHTML = '';
            popup.appendChild(root);

            // Wrap command to convert MentionSuggestion to Tiptap's expected format
            const wrappedCommand = (item: MentionSuggestion) => {
              if (currentCommand) {
                currentCommand({ id: item.id, label: item.label });
              }
            };

            // Render the MentionList
            import('react-dom/client').then(({ createRoot }) => {
              const reactRoot = createRoot(root);
              reactRoot.render(
                React.createElement(MentionList, {
                  items: currentItems,
                  command: wrappedCommand,
                  isLoading: isLoadingSuggestions,
                })
              );
            });
          };

          return {
            onStart: (props) => {
              popup = document.createElement('div');
              popup.className = 'tiptap-mention-popup';
              document.body.appendChild(popup);

              const rect = props.clientRect?.();
              if (rect && popup) {
                popup.style.position = 'absolute';
                popup.style.left = `${rect.left}px`;
                popup.style.top = `${rect.bottom + 8}px`;
                popup.style.zIndex = '50';
              }

              currentItems = props.items as MentionSuggestion[];
              currentCommand = props.command;
              renderMentionList();
            },
            onUpdate: (props) => {
              const rect = props.clientRect?.();
              if (rect && popup) {
                popup.style.left = `${rect.left}px`;
                popup.style.top = `${rect.bottom + 8}px`;
              }

              currentItems = props.items as MentionSuggestion[];
              currentCommand = props.command;
              renderMentionList();
            },
            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                popup?.remove();
                return true;
              }
              return false;
            },
            onExit: () => {
              popup?.remove();
              setMentionQuery('');
            },
          };
        },
      },
    });
  }, [mentionSuggestions, isLoadingSuggestions]);

  const editor = useEditor({
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
      mentionExtension,
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
      // Check max length on plain text
      if (maxLength && text.length > maxLength) {
        return;
      }
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
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

interface TiptapToolbarProps {
  editor: ReturnType<typeof useEditor>;
}

function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 rounded hover:bg-muted transition-colors',
        isActive && 'bg-muted text-primary'
      )}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="tiptap-toolbar flex flex-wrap gap-1 p-2 border-b border-border bg-muted/50 rounded-t-md">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
        </svg>
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
        </svg>
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        isActive={editor.isActive('link')}
        title="Link"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/>
        </svg>
      </ToolbarButton>
    </div>
  );
}
