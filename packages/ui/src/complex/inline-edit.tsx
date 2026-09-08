import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Check, LoaderCircle, Pencil, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Field, FieldError, FieldLabel } from '../primitives/field.js';
import { Input } from '../primitives/input.js';
import { cx } from './shared.js';

export type InlineEditValue = string | number;
export type InlineEditKind = 'text' | 'number';
export interface InlineEditSubmitContext { signal: AbortSignal; }
export interface InlineEditEditorArgs {
  draft: string;
  onDraftChange: (draft: string) => void;
  inputProps: {
    id: string;
    autoFocus: true;
    disabled: boolean;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
    'data-inline-edit-editor': string;
  };
}

export interface InlineEditProps {
  label: string;
  value: InlineEditValue;
  onValueChange: (value: InlineEditValue) => void;
  onSubmit?: (value: InlineEditValue, context: InlineEditSubmitContext) => void | Promise<void>;
  onCancel?: () => void;
  kind?: InlineEditKind;
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  emptyLabel?: ReactNode;
  editLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  validate?: (value: InlineEditValue) => string | undefined;
  renderDisplay?: (value: InlineEditValue) => ReactNode;
  renderEditor?: (args: InlineEditEditorArgs) => ReactNode;
  className?: string;
}

/** A focused display-to-editor transaction for short text and numeric values. */
export function InlineEdit({
  label,
  value,
  onValueChange,
  onSubmit,
  onCancel,
  kind = 'text',
  editing,
  defaultEditing = false,
  onEditingChange,
  disabled = false,
  readOnly = false,
  required = false,
  min,
  max,
  step,
  placeholder,
  emptyLabel = '未设置',
  editLabel = `编辑${label}`,
  saveLabel = '保存',
  cancelLabel = '取消',
  validate,
  renderDisplay,
  renderEditor,
  className,
}: InlineEditProps) {
  const id = useId();
  const [internalEditing, setInternalEditing] = useState(defaultEditing);
  const [draft, setDraft] = useState(String(value));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const editButton = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const request = useRef<AbortController | null>(null);
  const composing = useRef(false);
  const active = !readOnly && (editing ?? internalEditing);
  const previousActive = useRef(active);
  const restoreDisplayFocus = useRef(false);
  const errorId = `${id}-error`;

  useEffect(() => { if (!active) setDraft(String(value)); }, [active, value]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (!previousActive.current && active) focusEditor();
    if (previousActive.current && !active && restoreDisplayFocus.current) {
      restoreDisplayFocus.current = false;
      requestAnimationFrame(() => editButton.current?.focus());
    }
    previousActive.current = active;
  }, [active]);

  function changeEditing(next: boolean) {
    if (editing === undefined) setInternalEditing(next);
    onEditingChange?.(next);
  }

  function focusEditor() {
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[data-inline-edit-editor], input, textarea, select')?.focus());
  }

  function open() {
    if (disabled || readOnly) return;
    setDraft(String(value));
    setError('');
    changeEditing(true);
  }

  function cancel() {
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setDraft(String(value));
    setError('');
    restoreDisplayFocus.current = true;
    changeEditing(false);
    onCancel?.();
  }

  function parse(): { value?: InlineEditValue; error?: string } {
    const text = draft.trim();
    if (required && !text) return { error: '此项不能为空' };
    if (kind === 'number') {
      if (!text) return { error: '请输入有效数字' };
      const number = Number(text);
      if (!Number.isFinite(number)) return { error: '请输入有效数字' };
      if (min !== undefined && number < min) return { error: `不能小于 ${min}` };
      if (max !== undefined && number > max) return { error: `不能大于 ${max}` };
      return { value: number };
    }
    return { value: text };
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || disabled || readOnly) return;
    const parsed = parse();
    const problem = parsed.error ?? (parsed.value !== undefined ? validate?.(parsed.value) : undefined);
    if (problem || parsed.value === undefined) {
      setError(problem ?? '输入无效');
      focusEditor();
      return;
    }
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    setBusy(true);
    setError('');
    try {
      await onSubmit?.(parsed.value, { signal: controller.signal });
      if (controller.signal.aborted || request.current !== controller) return;
      onValueChange(parsed.value);
      restoreDisplayFocus.current = true;
      changeEditing(false);
    } catch (reason) {
      if (controller.signal.aborted || request.current !== controller) return;
      setError(reason instanceof Error ? reason.message : '保存失败，请重试。');
      focusEditor();
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }

  const display = renderDisplay?.(value) ?? (String(value) || emptyLabel);
  if (!active) return <div data-slot="inline-edit" data-state="display" data-readonly={readOnly || undefined} className={cx('min-w-0', className)}>
    {readOnly
      ? <span data-slot="inline-edit-display" className="block min-w-0 break-words text-sm">{display}</span>
      : <Button ref={editButton} type="button" size="sm" variant="ghost" disabled={disabled} aria-label={editLabel} className="max-w-full justify-start px-[var(--rui-space-1)] font-normal" onClick={open}>
          <span data-slot="inline-edit-display" className="min-w-0 truncate">{display}</span><Pencil aria-hidden="true" className="text-muted-foreground" />
        </Button>}
  </div>;

  const inputProps: InlineEditEditorArgs['inputProps'] = {
    id,
    autoFocus: true,
    disabled: disabled || busy,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    'data-inline-edit-editor': '',
  };
  return <form ref={form} data-slot="inline-edit" data-state="editing" aria-busy={busy || undefined} noValidate onSubmit={submit} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); cancel(); }
    if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
  }} className={cx('grid min-w-0 gap-[var(--rui-space-1)]', className)}>
    <Field data-invalid={Boolean(error) || undefined} data-disabled={disabled || busy || undefined}>
      <FieldLabel htmlFor={id} className="sr-only">{label}</FieldLabel>
      {renderEditor?.({ draft, onDraftChange: next => { setDraft(next); setError(''); }, inputProps }) ?? <Input {...inputProps} type={kind} value={draft} min={min} max={max} step={step} required={required} placeholder={placeholder} onChange={event => { setDraft(event.target.value); setError(''); }} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} />}
      {error && <FieldError id={errorId} className="text-xs">{error}</FieldError>}
    </Field>
    <div className="flex items-center gap-[var(--rui-space-1)]">
      <Button type="submit" size="xs" disabled={disabled || busy} aria-busy={busy || undefined}>{busy ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Check aria-hidden="true" />}{busy ? '正在保存…' : saveLabel}</Button>
      <Button type="button" size="xs" variant="ghost" disabled={disabled} onClick={cancel}><X aria-hidden="true" />{cancelLabel}</Button>
    </div>
  </form>;
}
