import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor, type Editor, type JSONContent } from '@tiptap/react';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '../lib/utils.js';

export type RichTextEditorFormat = 'json' | 'html' | 'markdown';
export type RichTextEditorValue = string | JSONContent;

export interface RichTextEditorSnapshot {
  json: JSONContent;
  html: string;
  markdown: string;
  text: string;
  isEmpty: boolean;
}

export interface RichTextEditorContentError {
  format: RichTextEditorFormat;
  value: RichTextEditorValue;
  message: string;
  cause?: unknown;
}

export interface RichTextEditorProps {
  format?: RichTextEditorFormat;
  value?: RichTextEditorValue;
  defaultValue?: RichTextEditorValue;
  onValueChange?: (value: RichTextEditorValue, snapshot: RichTextEditorSnapshot) => void;
  onContentError?: (error: RichTextEditorContentError) => void;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  error?: ReactNode;
  readOnly?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  editorClassName?: string;
  className?: string;
}

const emptyDocument: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };
const editorExtensions = [StarterKit, Markdown];

function emptyValue(format: RichTextEditorFormat): RichTextEditorValue {
  return format === 'json' ? emptyDocument : '';
}

function validValue(format: RichTextEditorFormat, value: RichTextEditorValue) {
  if (format === 'json') return Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.type === 'doc');
  return typeof value === 'string';
}

function snapshot(editor: Editor): RichTextEditorSnapshot {
  return {
    json: editor.getJSON(),
    html: editor.getHTML(),
    markdown: editor.getMarkdown(),
    text: editor.getText({ blockSeparator: '\n' }),
    isEmpty: editor.isEmpty,
  };
}

function outputFor(format: RichTextEditorFormat, state: RichTextEditorSnapshot): RichTextEditorValue {
  if (format === 'json') return state.json;
  if (format === 'html') return state.html;
  return state.markdown;
}

function sameValue(format: RichTextEditorFormat, left: RichTextEditorValue, right: RichTextEditorValue) {
  if (format === 'json') {
    try { return JSON.stringify(left) === JSON.stringify(right); }
    catch { return left === right; }
  }
  return left === right;
}

/** A schema-backed Tiptap document surface with explicit JSON, HTML and Markdown I/O. */
export function RichTextEditor({
  format = 'json',
  value,
  defaultValue,
  onValueChange,
  onContentError,
  label = '富文本内容',
  description,
  placeholder = '开始输入…',
  error,
  readOnly = false,
  disabled = false,
  autoFocus = false,
  editorClassName,
  className,
}: RichTextEditorProps) {
  const descriptionId = useId();
  const errorId = useId();
  const initialized = useRef(false);
  const controlled = value !== undefined;
  const initialValue = useRef(defaultValue ?? value ?? emptyValue(format));
  const currentInput = useRef<RichTextEditorValue>(controlled ? value! : initialValue.current);
  const pendingHostEchoes = useRef<Array<{ format: RichTextEditorFormat; value: RichTextEditorValue }>>([]);
  const formatRef = useRef(format);
  const onValueChangeRef = useRef(onValueChange);
  const onContentErrorRef = useRef(onContentError);
  const [isEmpty, setIsEmpty] = useState(true);
  const [parseError, setParseError] = useState<string>();
  const visibleError = error ?? parseError;
  const describedBy = [description && descriptionId, visibleError && errorId].filter(Boolean).join(' ') || undefined;

  formatRef.current = format;
  currentInput.current = controlled ? value! : initialValue.current;
  onValueChangeRef.current = onValueChange;
  onContentErrorRef.current = onContentError;

  function reportContentError(nextFormat: RichTextEditorFormat, nextValue: RichTextEditorValue, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause || '内容无法按所选格式解析');
    setParseError(message);
    onContentErrorRef.current?.({ format: nextFormat, value: nextValue, message, cause });
  }

  function replaceContent(editor: Editor, nextFormat: RichTextEditorFormat, nextValue: RichTextEditorValue) {
    if (!validValue(nextFormat, nextValue)) {
      reportContentError(nextFormat, nextValue, new Error(nextFormat === 'json' ? 'JSON 内容必须是 type 为 doc 的文档对象' : `${nextFormat.toUpperCase()} 内容必须是字符串`));
      return false;
    }
    try {
      const parsed = nextFormat === 'markdown'
        ? editor.markdown?.parse(nextValue as string) ?? emptyDocument
        : nextValue;
      editor.commands.setContent(parsed, {
        contentType: nextFormat === 'markdown' ? 'json' : nextFormat,
        emitUpdate: false,
        // JSON is the canonical schema document and must be exact. HTML is
        // intentionally normalized to the installed schema like browser paste.
        errorOnInvalidContent: nextFormat === 'json',
      });
      setParseError(undefined);
      setIsEmpty(editor.isEmpty);
      return true;
    } catch (cause) {
      reportContentError(nextFormat, nextValue, cause);
      return false;
    }
  }

  const editor = useEditor({
    extensions: editorExtensions,
    content: emptyDocument,
    editable: false,
    immediatelyRender: false,
    enableContentCheck: true,
    onUpdate: ({ editor: current }) => {
      const state = snapshot(current);
      const currentFormat = formatRef.current;
      const nextValue = outputFor(currentFormat, state);
      setIsEmpty(state.isEmpty);
      setParseError(undefined);
      pendingHostEchoes.current.push({ format: currentFormat, value: nextValue });
      if (pendingHostEchoes.current.length > 32) pendingHostEchoes.current.shift();
      onValueChangeRef.current?.(nextValue, state);
    },
    onContentError: ({ error: contentError }) => {
      const currentFormat = formatRef.current;
      reportContentError(currentFormat, currentInput.current, contentError);
    },
  });

  useLayoutEffect(() => {
    if (!editor || initialized.current) return;
    initialized.current = true;
    replaceContent(editor, format, controlled ? value! : initialValue.current);
    editor.setEditable(!disabled && !readOnly, false);
    if (autoFocus && !disabled && !readOnly) requestAnimationFrame(() => editor.commands.focus('start'));
  }, [autoFocus, controlled, disabled, editor, format, readOnly, value]);

  useEffect(() => {
    if (!editor || !initialized.current || !controlled) return;
    const echoed = pendingHostEchoes.current.findIndex(candidate => candidate.format === format && sameValue(format, candidate.value, value!));
    if (echoed >= 0) {
      pendingHostEchoes.current.splice(0, echoed + 1);
      return;
    }
    pendingHostEchoes.current = [];
    const current = outputFor(format, snapshot(editor));
    if (!sameValue(format, current, value!)) replaceContent(editor, format, value!);
  }, [controlled, editor, format, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled && !readOnly, false);
    editor.setOptions({ editorProps: { attributes: {
      role: 'textbox',
      'aria-label': label,
      'aria-multiline': 'true',
      'aria-readonly': String(readOnly || disabled),
      'aria-disabled': String(disabled),
      ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      'data-slot': 'rich-text-editor-content',
      class: cn(
        'min-h-[var(--rui-editor-min-height)] px-[var(--rui-content-padding)] py-[var(--rui-content-padding)] text-sm leading-relaxed text-foreground outline-none',
        '[&_p]:my-[var(--rui-space-2)] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
        '[&_h1]:my-[var(--rui-space-3)] [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1:first-child]:mt-0',
        '[&_h2]:my-[var(--rui-space-3)] [&_h2]:text-base [&_h2]:font-semibold [&_h2:first-child]:mt-0',
        '[&_h3]:my-[var(--rui-space-2)] [&_h3]:font-semibold [&_h3:first-child]:mt-0',
        '[&_ul]:my-[var(--rui-space-2)] [&_ul]:list-disc [&_ul]:pl-[var(--rui-space-5)]',
        '[&_ol]:my-[var(--rui-space-2)] [&_ol]:list-decimal [&_ol]:pl-[var(--rui-space-5)]',
        '[&_li]:my-[var(--rui-space-1)] [&_li>p]:my-0',
        '[&_blockquote]:my-[var(--rui-space-3)] [&_blockquote]:border-l-[length:var(--rui-outline-width)] [&_blockquote]:border-border [&_blockquote]:pl-[var(--rui-space-3)] [&_blockquote]:text-muted-foreground',
        '[&_pre]:my-[var(--rui-space-3)] [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-[var(--rui-content-padding)] [&_pre]:font-mono [&_pre]:text-xs',
        '[&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-[var(--rui-space-1)] [&_code]:font-mono [&_code]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4',
        '[&_hr]:my-[var(--rui-space-4)] [&_hr]:border-border',
        editorClassName,
      ),
    } } });
  }, [describedBy, disabled, editor, editorClassName, label, readOnly]);

  return <div
    data-slot="rich-text-editor"
    role="region"
    aria-label={`${label}编辑器`}
    data-format={format}
    data-empty={isEmpty ? 'true' : undefined}
    data-readonly={readOnly ? 'true' : undefined}
    data-disabled={disabled ? 'true' : undefined}
    className={cn('min-w-0 font-sans text-foreground', disabled && 'cursor-not-allowed', className)}
  >
    <div className="mb-[var(--rui-space-2)] flex min-w-0 items-baseline justify-between gap-[var(--rui-content-gap)]">
      <span className="truncate text-sm font-medium">{label}</span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">{format.toUpperCase()}</span>
    </div>
    {description && <div id={descriptionId} className="mb-[var(--rui-space-2)] text-xs text-muted-foreground">{description}</div>}
    <div className={cn('relative min-w-0 overflow-hidden rounded-lg border border-border bg-background transition-colors focus-within:border-ring focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring/50', visibleError && 'border-destructive', (readOnly || disabled) && 'bg-muted/30')}>
      {isEmpty && placeholder && <span aria-hidden="true" className="pointer-events-none absolute left-[var(--rui-content-padding)] top-[var(--rui-content-padding)] text-sm leading-relaxed text-muted-foreground">{placeholder}</span>}
      <EditorContent editor={editor} />
    </div>
    {visibleError && <div id={errorId} role="alert" className="mt-[var(--rui-space-2)] text-xs text-destructive">{visibleError}</div>}
  </div>;
}
