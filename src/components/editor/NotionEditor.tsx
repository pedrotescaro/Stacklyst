'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, type FocusEvent } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Code, Italic, Link as LinkIcon } from 'lucide-react';
import { ExecutableCodeBlock } from '@/components/editor/extensions/executable-code-block';
import { SlashCommand } from '@/components/editor/extensions/slash-command';
import { PostColor } from '@/components/editor/extensions/post-color';
import { docToMarkdown, markdownToDoc } from '@/lib/editor/markdown';
import { isPostTextColor } from '@/lib/editor/text-colors';
import { cn } from '@/lib/cn';
import './NotionEditor.css';
import './PostTextFormatting.css';

export interface NotionEditorRef {
  insertText: (text: string) => void;
  focus: () => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  setTextColor: (color: string | null) => void;
  clearFormatting: () => void;
  insertCodeBlock: () => void;
  insertBlock: (type: 'paragraph' | 'heading' | 'bulletList' | 'blockquote') => void;
}

export interface EditorFormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string | null;
}

interface NotionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  onFocus?: () => void;
  onBlur?: (event?: FocusEvent) => void;
  onStateChange?: (state: EditorFormattingState) => void;
  className?: string;
}

export const NotionEditor = forwardRef<NotionEditorRef, NotionEditorProps>(function NotionEditor(
  {
    value,
    onChange,
    placeholder = 'Comece a escrever ou digite / para blocos...',
    maxLength,
    minHeight = '2.5rem',
    onFocus,
    onBlur,
    onStateChange,
    className,
  },
  ref
) {
  const syncingRef = useRef(false);
  const lastEmittedRef = useRef(value);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-dd-accent underline',
          },
        },
      }),
      ExecutableCodeBlock.configure({
        defaultLanguage: 'typescript',
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
      }),
      SlashCommand,
      PostColor,
    ],
    content: markdownToDoc(value),
    editorProps: {
      attributes: {
        class: 'notion-editor-content focus:outline-none',
        role: 'textbox',
        'aria-label': placeholder,
        'aria-multiline': 'true',
        ...(maxLength ? { 'data-max-length': String(maxLength) } : {}),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (syncingRef.current) return;
      // Never truncate serialized markdown: it can cut a mark or code fence in half.
      // The shared composer validates the complete body and shows its character limit.
      const markdown = docToMarkdown(currentEditor.getJSON());
      lastEmittedRef.current = markdown;
      onChange(markdown);
    },
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
    onTransaction: ({ editor: currentEditor }) => {
      onStateChangeRef.current?.({
        bold: currentEditor.isActive('bold'),
        italic: currentEditor.isActive('italic'),
        underline: currentEditor.isActive('underline'),
        color: currentEditor.getAttributes('postColor').color ?? null,
      });
    },
  });

  useEffect(() => {
    if (!editor || value === lastEmittedRef.current) return;

    syncingRef.current = true;
    editor.commands.setContent(markdownToDoc(value));
    lastEmittedRef.current = value;
    syncingRef.current = false;
  }, [editor, value]);

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      editor?.chain().focus().insertContent({ type: 'text', text }).run();
    },
    focus: () => {
      editor?.chain().focus().run();
    },
    toggleBold: () => {
      editor?.chain().focus().toggleBold().run();
    },
    toggleItalic: () => {
      editor?.chain().focus().toggleItalic().run();
    },
    toggleUnderline: () => {
      editor?.chain().focus().toggleUnderline().run();
    },
    setTextColor: (color) => {
      if (!editor) return;
      if (isPostTextColor(color)) editor.chain().focus().setMark('postColor', { color }).run();
      else editor.chain().focus().unsetMark('postColor').run();
    },
    clearFormatting: () => {
      editor?.chain().focus().unsetAllMarks().run();
    },
    insertCodeBlock: () => {
      if (!editor) return;
      const { $to } = editor.state.selection;
      const position = $to.depth > 0 ? $to.after(1) : editor.state.doc.content.size;
      editor
        .chain()
        .focus()
        .insertContentAt(position, [
          { type: 'codeBlock', attrs: { language: 'typescript', isExecutable: true } },
          { type: 'paragraph' },
        ])
        .run();
    },
    insertBlock: (type) => {
      if (!editor) return;
      const chain = editor.chain().focus();
      if (type === 'heading') chain.toggleHeading({ level: 2 }).run();
      else if (type === 'bulletList') chain.toggleBulletList().run();
      else if (type === 'blockquote') chain.toggleBlockquote().run();
      else chain.setParagraph().run();
    },
  }));

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL do link', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={cn('notion-editor relative min-w-0 w-full', className)} style={{ minHeight }}>
      {editor && (
        <BubbleMenu
          editor={editor}
          className="bubble-toolbar flex items-center gap-0.5 rounded-lg border border-dd-border bg-dd-surface p-1 shadow-lg"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer',
              editor.isActive('bold')
                ? 'bg-dd-accent/15 text-dd-accent'
                : 'text-dd-muted hover:bg-dd-bg hover:text-dd-text'
            )}
            aria-label="Negrito"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer',
              editor.isActive('italic')
                ? 'bg-dd-accent/15 text-dd-accent'
                : 'text-dd-muted hover:bg-dd-bg hover:text-dd-text'
            )}
            aria-label="Itálico"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer',
              editor.isActive('code')
                ? 'bg-dd-accent/15 text-dd-accent'
                : 'text-dd-muted hover:bg-dd-bg hover:text-dd-text'
            )}
            aria-label="Código inline"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer',
              editor.isActive('link')
                ? 'bg-dd-accent/15 text-dd-accent'
                : 'text-dd-muted hover:bg-dd-bg hover:text-dd-text'
            )}
            aria-label="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
});

// Backward-compatible export while callers migrate off MarkdownEditor.
export { NotionEditor as MarkdownEditor };
export type { NotionEditorRef as MarkdownEditorRef };
