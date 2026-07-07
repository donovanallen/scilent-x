'use client';

import * as React from 'react';
import { TiptapEditor } from './tiptap-editor';

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

/**
 * RichTextEditor - Wrapper around TiptapEditor for backwards compatibility
 * @deprecated Use TiptapEditor directly for new code
 */
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
  return (
    <TiptapEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={className}
      minHeight={minHeight}
      maxLength={maxLength}
      editorKey={editorKey}
    />
  );
}
