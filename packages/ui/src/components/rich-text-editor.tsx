'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (content: string, html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
  maxLength?: number;
  /** Key to force remount and clear editor state */
  editorKey?: string | number;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'list',
  'link',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QuillComponent = React.ComponentType<any>;

export function RichTextEditor({
  value,
  onChange,
  placeholder = "What's on your mind?",
  readOnly = false,
  className,
  minHeight = '100px',
  maxLength,
  editorKey,
}: RichTextEditorProps) {
  const [mounted, setMounted] = React.useState(false);
  const [ReactQuill, setReactQuill] = React.useState<QuillComponent | null>(null);

  React.useEffect(() => {
    setMounted(true);
    // Dynamically import ReactQuill only on client side
    // CSS is imported statically in globals.css to avoid FOUC
    import('react-quill-new').then((module) => {
      setReactQuill(() => module.default);
    });
  }, []);

  const handleChange = React.useCallback(
    (content: string, _delta: unknown, _source: string, editor: { getText: () => string }) => {
      const text = editor.getText().trim();
      // Check max length on plain text
      if (maxLength && text.length > maxLength) {
        return;
      }
      // Get HTML content
      const html = content;
      // Pass both plain text (for backwards compat) and HTML
      onChange(text, html);
    },
    [onChange, maxLength]
  );

  // Show skeleton/placeholder during SSR and while loading
  if (!mounted || !ReactQuill) {
    return (
      <div
        className={cn(
          'rich-text-editor rounded-md border border-input bg-background',
          readOnly && 'opacity-50 pointer-events-none',
          className
        )}
        style={{
          ['--min-height' as string]: minHeight,
        }}
      >
        <div className="p-3 min-h-[100px] text-muted-foreground italic">
          {placeholder}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rich-text-editor rounded-md border border-input bg-background',
        readOnly && 'opacity-50 pointer-events-none',
        className
      )}
      style={{
        ['--min-height' as string]: minHeight,
      }}
    >
      <ReactQuill
        key={editorKey}
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}
