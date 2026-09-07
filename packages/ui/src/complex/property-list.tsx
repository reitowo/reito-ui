import { useEffect, useId, useRef, useState } from 'react';
import { Check, Pencil, RotateCcw, Save, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Field, FieldError, FieldLabel } from '../primitives/field.js';
import { Input } from '../primitives/input.js';
import { NativeSelect, NativeSelectOption } from '../primitives/native-select.js';
import { Switch } from '../primitives/switch.js';
import { cx } from './shared.js';

export type PropertyValue = string | number | boolean;
export type PropertyDraftValue = string | boolean;
export type PropertyKind = 'text' | 'number' | 'boolean' | 'select' | 'date';
export type PropertyPath = readonly (string | number)[];
export type PropertyValues = Record<string, PropertyValue>;
export type PropertyFieldErrors = Record<string, string | undefined>;
export interface PropertyOption { value: string; label: string; disabled?: boolean; }
export interface PropertyItem {
  key: string;
  label: string;
  value: PropertyValue;
  defaultValue?: PropertyValue;
  kind?: PropertyKind;
  path?: PropertyPath;
  options?: PropertyOption[];
  description?: string;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  trueLabel?: string;
  falseLabel?: string;
  validate?: (value: PropertyValue) => string | undefined;
}
export interface PropertyChange {
  key: string;
  path: PropertyPath;
  previousValue: PropertyValue;
  value: PropertyValue;
}
export interface PropertySubmissionResult {
  fieldErrors?: PropertyFieldErrors;
  error?: string;
}
export type PropertyBatchReason = 'cancel' | 'reset';
export interface PropertyListProps {
  items: PropertyItem[];
  onValueChange: (key: string, value: PropertyValue, path: PropertyPath) => void;
  onBatchValueChange?: (changes: PropertyChange[], reason: PropertyBatchReason) => void;
  onDraftValueChange?: (key: string, draft: PropertyDraftValue, path: PropertyPath) => void;
  validateAll?: (values: PropertyValues, items: PropertyItem[]) => PropertyFieldErrors | Promise<PropertyFieldErrors>;
  onSubmit?: (values: PropertyValues, changes: PropertyChange[], items: PropertyItem[]) => void | PropertySubmissionResult | Promise<void | PropertySubmissionResult>;
  label?: string;
  disabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  /** Change this identity when the host switches to another record and the current values should become the new submitted baseline. */
  baselineKey?: unknown;
  className?: string;
}

function pathOf(item: PropertyItem): PropertyPath { return item.path ?? [item.key]; }
function draftOf(item: PropertyItem): PropertyDraftValue { return item.kind === 'boolean' ? Boolean(item.value) : String(item.value); }
function valuesOf(items: PropertyItem[]): PropertyValues { return Object.fromEntries(items.map(item => [item.key, item.value])); }
function displayValue(item: PropertyItem) {
  if (item.kind === 'boolean') return item.value ? item.trueLabel ?? '开启' : item.falseLabel ?? '关闭';
  if (item.kind === 'select') return item.options?.find(option => option.value === String(item.value))?.label ?? String(item.value);
  return String(item.value) || '未设置';
}

interface PropertyRowProps {
  item: PropertyItem;
  onValueChange: PropertyListProps['onValueChange'];
  onDraftValueChange?: PropertyListProps['onDraftValueChange'];
  disabled?: boolean;
  fieldError?: string;
  transactionRevision: number;
  onClearFieldError: (key: string) => void;
  registerRow: (key: string, node: HTMLDivElement | null) => void;
}

function PropertyRow({ item, onValueChange, onDraftValueChange, disabled, fieldError, transactionRevision, onClearFieldError, registerRow }: PropertyRowProps) {
  const [editing, setEditing] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const [draft, setDraft] = useState<PropertyDraftValue>(() => draftOf(item));
  const composing = useRef(false);
  const id = useId();
  const editRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const locked = disabled || item.disabled;
  const path = pathOf(item);
  const error = localError ?? fieldError;

  useEffect(() => { if (!editing) setDraft(draftOf(item)); }, [editing, item.kind, item.value]);
  useEffect(() => {
    setEditing(false);
    setDraft(draftOf(item));
    setLocalError(undefined);
  }, [transactionRevision]);
  useEffect(() => { if (editing) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('input, select, [role="switch"]')?.focus()); }, [editing]);

  function updateDraft(next: PropertyDraftValue) {
    setDraft(next);
    setLocalError(undefined);
    onClearFieldError(item.key);
    onDraftValueChange?.(item.key, next, path);
  }

  function finish() {
    setEditing(false);
    setDraft(draftOf(item));
    setLocalError(undefined);
    requestAnimationFrame(() => editRef.current?.focus());
  }

  function parseDraft(): { value?: PropertyValue; error?: string } {
    if (item.kind === 'boolean') return { value: Boolean(draft) };
    const text = String(draft);
    if (item.kind === 'number') {
      const value = Number(text);
      if (!text.trim() || !Number.isFinite(value)) return { error: '请输入有效数字' };
      if (typeof item.min === 'number' && value < item.min) return { error: `不能小于 ${item.min}` };
      if (typeof item.max === 'number' && value > item.max) return { error: `不能大于 ${item.max}` };
      return { value };
    }
    if (item.kind === 'date' && text && !/^\d{4}-\d{2}-\d{2}$/.test(text)) return { error: '请输入有效日期' };
    if (item.kind === 'select' && !item.options?.some(option => option.value === text && !option.disabled)) return { error: '请选择有效选项' };
    return { value: item.kind === 'text' || !item.kind ? text.trim() : text };
  }

  function save() {
    const parsed = parseDraft();
    const problem = parsed.error ?? (parsed.value !== undefined ? item.validate?.(parsed.value) : undefined);
    if (problem || parsed.value === undefined) { setLocalError(problem ?? '属性值无效'); return; }
    onValueChange(item.key, parsed.value, path);
    onClearFieldError(item.key);
    setEditing(false);
    setLocalError(undefined);
    requestAnimationFrame(() => editRef.current?.focus());
  }

  const inputProps = { id, autoFocus: true, disabled: locked, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined } as const;
  const editor = item.kind === 'boolean'
    ? <Switch {...inputProps} checked={Boolean(draft)} onCheckedChange={checked => updateDraft(checked)} />
    : item.kind === 'select'
      ? <NativeSelect {...inputProps} className="w-full" value={String(draft)} onChange={event => updateDraft(event.target.value)}>{item.options?.map(option => <NativeSelectOption key={option.value} value={option.value} disabled={option.disabled}>{option.label}</NativeSelectOption>)}</NativeSelect>
      : <Input {...inputProps} type={item.kind === 'number' ? 'number' : item.kind === 'date' ? 'date' : 'text'} value={String(draft)} placeholder={item.placeholder}
        min={item.min} max={item.max} step={item.kind === 'number' ? item.step : undefined}
        onChange={event => updateDraft(event.target.value)} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={event => { if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }} />;

  return <div ref={node => { registerRow(item.key, node); }} data-property-key={item.key} data-disabled={locked || undefined} tabIndex={fieldError ? -1 : undefined} className="grid min-w-0 grid-cols-1 gap-[var(--rui-content-gap-sm)] px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)] outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-inset focus-visible:ring-ring @md/property-list:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @md/property-list:items-baseline @md/property-list:gap-[var(--rui-content-gap)]">
    <dt className="min-w-0 text-sm text-muted-foreground"><span className="block text-foreground">{item.label}</span>{item.description && <span className="mt-1 block text-xs leading-relaxed">{item.description}</span>}{item.path && <code className="mt-1 block truncate font-mono text-xs" title={path.join('.')}>{path.join('.')}</code>}</dt>
    <dd className="min-w-0">{editing ? <form ref={formRef} noValidate onSubmit={event => { event.preventDefault(); save(); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); finish(); } }} className="space-y-[var(--rui-content-gap-sm)]">
      <Field data-disabled={locked || undefined} data-invalid={!!error || undefined}><FieldLabel htmlFor={id} className="sr-only">{item.label}</FieldLabel>{editor}{error && <FieldError id={`${id}-error`} className="text-xs">{error}</FieldError>}</Field>
      <div className="flex gap-[var(--rui-space-2)]"><Button type="submit" size="xs" disabled={locked}><Check aria-hidden="true" />保存字段</Button><Button type="button" variant="ghost" size="xs" onClick={finish}><X aria-hidden="true" />取消编辑</Button></div>
    </form> : <div className="min-w-0 space-y-[var(--rui-space-1)]"><div className="flex min-w-0 items-center justify-between gap-[var(--rui-content-gap-sm)]"><span className="min-w-0 break-words py-1 text-sm">{displayValue(item)}</span>{!item.readOnly && <Button ref={editRef} variant="ghost" size="icon-sm" aria-label={`编辑${item.label}`} disabled={locked} onClick={() => { setDraft(draftOf(item)); setLocalError(undefined); setEditing(true); }}><Pencil aria-hidden="true" /></Button>}</div>{fieldError && <FieldError className="text-xs">{fieldError}</FieldError>}</div>}</dd>
  </div>;
}

export function PropertyList({
  items, onValueChange, onBatchValueChange, onDraftValueChange, validateAll, onSubmit, label = '属性', disabled,
  submitLabel = '保存全部', cancelLabel = '取消更改', resetLabel = '恢复默认', baselineKey, className,
}: PropertyListProps) {
  const baseline = useRef<PropertyValues>(valuesOf(items));
  const baselineIdentity = useRef(baselineKey);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PropertyFieldErrors>({});
  const [submissionError, setSubmissionError] = useState('');
  const [status, setStatus] = useState('');
  const [transactionRevision, setTransactionRevision] = useState(0);
  const [, setBaselineRevision] = useState(0);

  if (!Object.is(baselineIdentity.current, baselineKey)) {
    baselineIdentity.current = baselineKey;
    baseline.current = valuesOf(items);
  }
  for (const item of items) if (!(item.key in baseline.current)) baseline.current[item.key] = item.value;
  const currentKeys = new Set(items.map(item => item.key));
  for (const key of Object.keys(baseline.current)) if (!currentKeys.has(key)) delete baseline.current[key];

  const changes = items.flatMap<PropertyChange>(item => Object.is(item.value, baseline.current[item.key]) ? [] : [{ key: item.key, path: pathOf(item), previousValue: baseline.current[item.key], value: item.value }]);
  const resetChanges = items.flatMap<PropertyChange>(item => {
    const value = item.defaultValue ?? baseline.current[item.key];
    return Object.is(item.value, value) ? [] : [{ key: item.key, path: pathOf(item), previousValue: item.value, value }];
  });
  const locked = disabled || busy;

  function clearFieldError(key: string) {
    setSubmissionError('');
    setStatus('');
    if (fieldErrors[key]) setFieldErrors(previous => ({ ...previous, [key]: undefined }));
  }

  function focusFirstError(errors: PropertyFieldErrors) {
    const key = items.find(item => errors[item.key])?.key;
    if (key) requestAnimationFrame(() => rowRefs.current.get(key)?.focus());
  }

  function applyBatch(nextChanges: PropertyChange[], reason: PropertyBatchReason) {
    if (!nextChanges.length || locked) return;
    setFieldErrors({});
    setSubmissionError('');
    setStatus(reason === 'cancel' ? '已恢复到最近一次保存' : '已恢复默认值，尚未保存');
    setTransactionRevision(revision => revision + 1);
    if (onBatchValueChange) onBatchValueChange(nextChanges, reason);
    else for (const change of nextChanges) onValueChange(change.key, change.value, change.path);
  }

  async function submit() {
    if (!onSubmit || locked || inFlight.current || !changes.length) return;
    const values = valuesOf(items);
    const submittedChanges = [...changes];
    inFlight.current = true;
    setBusy(true);
    setFieldErrors({});
    setSubmissionError('');
    setStatus('正在校验…');
    try {
      const validationErrors = validateAll ? await validateAll(values, items) : {};
      if (Object.values(validationErrors).some(Boolean)) {
        setFieldErrors(validationErrors);
        setStatus('校验未通过');
        focusFirstError(validationErrors);
        return;
      }
      setStatus('正在保存…');
      const result = await onSubmit(values, submittedChanges, items);
      if (result?.fieldErrors && Object.values(result.fieldErrors).some(Boolean)) {
        setFieldErrors(result.fieldErrors);
        setSubmissionError(result.error ?? '部分属性未保存，请修正后重试。');
        setStatus('保存失败，草稿已保留');
        focusFirstError(result.fieldErrors);
        return;
      }
      if (result?.error) {
        setSubmissionError(result.error);
        setStatus('保存失败，草稿已保留');
        return;
      }
      baseline.current = { ...values };
      setBaselineRevision(revision => revision + 1);
      setStatus('全部更改已保存');
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : '属性未保存，请重试。');
      setStatus('保存失败，草稿已保留');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return <section aria-label={label} aria-busy={busy} className={cx('@container/property-list min-w-0 space-y-[var(--rui-content-gap)] font-sans text-foreground', className)}>
    <dl aria-label={label} className="divide-y divide-border rounded-lg border border-border">{items.map(item => <PropertyRow key={item.key} item={item} onValueChange={onValueChange} onDraftValueChange={onDraftValueChange} disabled={locked} fieldError={fieldErrors[item.key]} transactionRevision={transactionRevision} onClearFieldError={clearFieldError} registerRow={(key, node) => { if (node) rowRefs.current.set(key, node); else rowRefs.current.delete(key); }} />)}</dl>
    {onSubmit && <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <p role="status" className="text-xs text-muted-foreground">{status || (changes.length ? `${changes.length} 项更改尚未保存` : '没有待保存的更改')}</p>
      <div className="flex flex-wrap gap-[var(--rui-space-2)]">
        <Button type="button" variant="ghost" size="sm" disabled={locked || !changes.length} onClick={() => applyBatch(changes.map(change => ({ ...change, previousValue: change.value, value: change.previousValue })), 'cancel')}><X aria-hidden="true" />{cancelLabel}</Button>
        <Button type="button" variant="outline" size="sm" disabled={locked || !resetChanges.length} onClick={() => applyBatch(resetChanges, 'reset')}><RotateCcw aria-hidden="true" />{resetLabel}</Button>
        <Button type="button" size="sm" disabled={locked || !changes.length} onClick={() => { void submit(); }}><Save aria-hidden="true" />{busy ? '正在保存…' : submitLabel}</Button>
      </div>
    </div>}
    {submissionError && <p role="alert" className="text-sm text-destructive">{submissionError}</p>}
  </section>;
}
