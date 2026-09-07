import { useId, useRef, useState } from 'react';
import { Eye, EyeOff, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Field, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { Input } from '../primitives/input.js';
import { NativeSelect, NativeSelectOption } from '../primitives/native-select.js';
import { Switch } from '../primitives/switch.js';
import { cx } from './shared.js';

export type KeyValueKind = 'text' | 'number' | 'boolean' | 'select' | 'date';
export type KeyValuePath = readonly (string | number)[];
export interface KeyValueOption { value: string; label: string; disabled?: boolean; }
export interface KeyValueEntry {
  id: string;
  key: string;
  value: string;
  kind?: KeyValueKind;
  path?: KeyValuePath;
  options?: KeyValueOption[];
  min?: number | string;
  max?: number | string;
  secret?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  validateValue?: (value: string, entry: KeyValueEntry) => string | undefined;
}
export interface KeyValueEntryError { key?: string; value?: string; }
export type KeyValueEntryErrors = Record<string, KeyValueEntryError | undefined>;
export interface KeyValueChange {
  id: string;
  type: 'add' | 'update' | 'remove';
  previousEntry?: KeyValueEntry;
  entry?: KeyValueEntry;
  previousIndex?: number;
  index?: number;
}
export interface KeyValueSubmissionResult {
  entryErrors?: KeyValueEntryErrors;
  error?: string;
}
export interface KeyValueEditorProps {
  value: KeyValueEntry[];
  onValueChange: (entries: KeyValueEntry[]) => void;
  onDraftValueChange?: (id: string, patch: Partial<Pick<KeyValueEntry, 'key' | 'value'>>, path: KeyValuePath) => void;
  validateAll?: (entries: KeyValueEntry[]) => KeyValueEntryErrors | Promise<KeyValueEntryErrors>;
  onSubmit?: (entries: KeyValueEntry[], changes: KeyValueChange[]) => void | KeyValueSubmissionResult | Promise<void | KeyValueSubmissionResult>;
  defaultValue?: KeyValueEntry[];
  label?: string;
  requireValues?: boolean;
  maxRows?: number;
  disabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  /** Change this identity when the host switches records and the controlled value should become the new submitted baseline. */
  baselineKey?: unknown;
  className?: string;
}

function cloneEntries(entries: KeyValueEntry[]) {
  return entries.map(entry => ({ ...entry, path: entry.path ? [...entry.path] : undefined, options: entry.options?.map(option => ({ ...option })) }));
}

function changesOf(baseline: KeyValueEntry[], current: KeyValueEntry[]): KeyValueChange[] {
  const before = new Map(baseline.map((entry, index) => [entry.id, { entry, index }]));
  const after = new Map(current.map((entry, index) => [entry.id, { entry, index }]));
  const changes: KeyValueChange[] = [];
  for (const [id, previous] of before) {
    const next = after.get(id);
    if (!next) changes.push({ id, type: 'remove', previousEntry: previous.entry, previousIndex: previous.index });
    else if (previous.entry.key !== next.entry.key || previous.entry.value !== next.entry.value || previous.index !== next.index) changes.push({ id, type: 'update', previousEntry: previous.entry, entry: next.entry, previousIndex: previous.index, index: next.index });
  }
  for (const [id, next] of after) if (!before.has(id)) changes.push({ id, type: 'add', entry: next.entry, index: next.index });
  return changes;
}

/** An ordered, controlled collection preserves invalid drafts and duplicate keys until they are fixed. */
export function KeyValueEditor({
  value, onValueChange, onDraftValueChange, validateAll, onSubmit, defaultValue, label = '键值配置', requireValues = false,
  maxRows, disabled = false, submitLabel = '应用配置', cancelLabel = '取消更改', resetLabel = '恢复默认', baselineKey, className,
}: KeyValueEditorProps) {
  const editorId = useId();
  const serial = useRef(0);
  const addButton = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const baseline = useRef(cloneEntries(value));
  const baselineIdentity = useRef(baselineKey);
  const inFlight = useRef(false);
  const [newRowId, setNewRowId] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [entryErrors, setEntryErrors] = useState<KeyValueEntryErrors>({});
  const [submissionError, setSubmissionError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [, setBaselineRevision] = useState(0);

  if (!Object.is(baselineIdentity.current, baselineKey)) {
    baselineIdentity.current = baselineKey;
    baseline.current = cloneEntries(value);
  }

  const locked = disabled || saving;
  const keyCounts = new Map<string, number>();
  for (const entry of value) {
    const key = entry.key.trim();
    if (key) keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
  }
  const clientErrors = value.map(entry => {
    let valueError = requireValues && !entry.value.trim() ? '值不能为空' : undefined;
    if (!valueError && entry.kind === 'number' && entry.value.trim()) {
      const number = Number(entry.value);
      if (!Number.isFinite(number)) valueError = '请输入有效数字';
      else if (typeof entry.min === 'number' && number < entry.min) valueError = `不能小于 ${entry.min}`;
      else if (typeof entry.max === 'number' && number > entry.max) valueError = `不能大于 ${entry.max}`;
    }
    if (!valueError && entry.kind === 'date' && entry.value && !/^\d{4}-\d{2}-\d{2}$/.test(entry.value)) valueError = '请输入有效日期';
    if (!valueError && entry.kind === 'select' && !entry.options?.some(option => option.value === entry.value && !option.disabled)) valueError = '请选择有效选项';
    valueError ??= entry.validateValue?.(entry.value, entry);
    return { key: !entry.key.trim() ? '键不能为空' : (keyCounts.get(entry.key.trim()) ?? 0) > 1 ? '键不能重复' : undefined, value: valueError };
  });
  const errors = value.map((entry, index) => ({ key: clientErrors[index].key ?? entryErrors[entry.id]?.key, value: clientErrors[index].value ?? entryErrors[entry.id]?.value }));
  const invalidCount = errors.filter(error => error.key || error.value).length;
  const dirtyChanges = changesOf(baseline.current, value);
  const resetChanges = defaultValue ? changesOf(value, defaultValue) : [];

  function clearSubmissionState(id?: string) {
    setSubmissionError('');
    setTransactionStatus('');
    if (id && entryErrors[id]) setEntryErrors(previous => ({ ...previous, [id]: undefined }));
  }

  function update(id: string, patch: Partial<Pick<KeyValueEntry, 'key' | 'value'>>) {
    clearSubmissionState(id);
    const entry = value.find(candidate => candidate.id === id);
    if (entry) onDraftValueChange?.(id, patch, entry.path ?? [entry.key.trim() || entry.id]);
    onValueChange(value.map(entry => entry.id === id ? { ...entry, ...patch } : entry));
  }

  function add() {
    if (locked || (maxRows !== undefined && value.length >= maxRows)) return;
    const id = `${editorId}-${serial.current++}`;
    setNewRowId(id);
    clearSubmissionState();
    setEntryErrors({});
    onValueChange([...value, { id, key: '', value: '' }]);
  }

  function remove(id: string) {
    clearSubmissionState();
    setEntryErrors(previous => { const next = { ...previous }; delete next[id]; return next; });
    onValueChange(value.filter(entry => entry.id !== id));
    setRevealed(previous => { const next = new Set(previous); next.delete(id); return next; });
    requestAnimationFrame(() => addButton.current?.focus());
  }

  function replace(entries: KeyValueEntry[], status: string) {
    if (locked) return;
    setEntryErrors({});
    setSubmissionError('');
    setTransactionStatus(status);
    setRevealed(new Set());
    onValueChange(cloneEntries(entries));
  }

  function focusFirstError(nextErrors: KeyValueEntryErrors) {
    const id = value.find(entry => nextErrors[entry.id]?.key || nextErrors[entry.id]?.value)?.id;
    if (id) requestAnimationFrame(() => rowRefs.current.get(id)?.focus());
  }

  async function submit() {
    if (!onSubmit || locked || inFlight.current || invalidCount || !dirtyChanges.length) return;
    const normalized = value.map(entry => ({ ...entry, key: entry.key.trim() }));
    const submittedChanges = changesOf(baseline.current, normalized);
    inFlight.current = true;
    setSaving(true);
    setEntryErrors({});
    setSubmissionError('');
    setTransactionStatus('正在校验…');
    try {
      const validationErrors = validateAll ? await validateAll(normalized) : {};
      if (Object.values(validationErrors).some(error => error?.key || error?.value)) {
        setEntryErrors(validationErrors);
        setTransactionStatus('校验未通过');
        focusFirstError(validationErrors);
        return;
      }
      setTransactionStatus('正在应用…');
      const result = await onSubmit(normalized, submittedChanges);
      if (result?.entryErrors && Object.values(result.entryErrors).some(error => error?.key || error?.value)) {
        setEntryErrors(result.entryErrors);
        setSubmissionError(result.error ?? '部分配置未保存，请修正后重试。');
        setTransactionStatus('应用失败，草稿已保留');
        focusFirstError(result.entryErrors);
        return;
      }
      if (result?.error) {
        setSubmissionError(result.error);
        setTransactionStatus('应用失败，草稿已保留');
        return;
      }
      baseline.current = cloneEntries(normalized);
      if (normalized.some((entry, index) => entry.key !== value[index]?.key)) onValueChange(cloneEntries(normalized));
      setBaselineRevision(revision => revision + 1);
      setTransactionStatus('全部配置已应用');
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : '配置未保存，请重试。');
      setTransactionStatus('应用失败，草稿已保留');
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  const status = transactionStatus || (invalidCount ? `${invalidCount} 项需要修正` : dirtyChanges.length ? `${dirtyChanges.length} 项更改尚未应用` : `${value.length} 项配置有效`);

  return <section aria-label={label} aria-busy={saving} className={cx('@container/key-value-editor min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <header className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <h3 className="font-medium">{label}</h3>
      <Button ref={addButton} variant="outline" size="sm" disabled={locked || (maxRows !== undefined && value.length >= maxRows)} onClick={add}><Plus aria-hidden="true" />添加键值</Button>
    </header>
    {value.length ? <ol className="divide-y divide-border rounded-lg border border-border">
      {value.map((entry, index) => {
        const keyId = `${editorId}-key-${index}`;
        const valueId = `${editorId}-value-${index}`;
        const problem = errors[index];
        const serverProblem = entryErrors[entry.id];
        const visible = revealed.has(entry.id);
        const entryLocked = locked || entry.disabled;
        const path = entry.path ?? [entry.key.trim() || entry.id];
        const valueControl = entry.kind === 'boolean'
          ? <Switch id={valueId} checked={entry.value === 'true'} disabled={entryLocked} aria-invalid={!!problem.value} aria-describedby={problem.value ? `${valueId}-error` : undefined} onCheckedChange={checked => update(entry.id, { value: String(checked) })} />
          : entry.kind === 'select'
            ? <NativeSelect id={valueId} className="w-full" value={entry.value} disabled={entryLocked} aria-invalid={!!problem.value} aria-describedby={problem.value ? `${valueId}-error` : undefined} onChange={event => update(entry.id, { value: event.target.value })}>{entry.options?.map(option => <NativeSelectOption key={option.value} value={option.value} disabled={option.disabled}>{option.label}</NativeSelectOption>)}</NativeSelect>
            : <div className="flex items-center gap-[var(--rui-space-1)]"><Input id={valueId} type={entry.secret && !visible ? 'password' : entry.kind === 'number' ? 'number' : entry.kind === 'date' ? 'date' : 'text'} value={entry.value}
              min={entry.min} max={entry.max} disabled={entryLocked} readOnly={entry.readOnly} autoComplete="off"
              aria-required={requireValues} aria-invalid={!!problem.value} aria-describedby={problem.value ? `${valueId}-error` : undefined}
              onChange={event => update(entry.id, { value: event.target.value })} />
              {entry.secret && (!entry.kind || entry.kind === 'text') && <Button variant="ghost" size="icon-sm" disabled={entryLocked} aria-label={`${visible ? '隐藏' : '显示'}第 ${index + 1} 项的值`} aria-pressed={visible} onClick={() => setRevealed(previous => {
                const next = new Set(previous);
                if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id);
                return next;
              })}>{visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>}
            </div>;
        return <li ref={node => { if (node) rowRefs.current.set(entry.id, node); else rowRefs.current.delete(entry.id); }} key={entry.id} data-entry-id={entry.id} tabIndex={serverProblem ? -1 : undefined} className="relative grid grid-cols-1 items-start gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)] outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-inset focus-visible:ring-ring @md/key-value-editor:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]">
          <Field data-disabled={entryLocked || undefined} data-invalid={!!problem.key || undefined} className="min-w-0 gap-[var(--rui-space-1)]">
            <FieldLabel htmlFor={keyId} className="text-xs text-muted-foreground">键 {index + 1}</FieldLabel>
            <Input id={keyId} autoFocus={newRowId === entry.id} value={entry.key} disabled={entryLocked} readOnly={entry.readOnly}
              aria-required="true" aria-invalid={!!problem.key} aria-describedby={problem.key ? `${keyId}-error` : undefined}
              onChange={event => update(entry.id, { key: event.target.value })} />
            {entry.path && <FieldDescription className="truncate font-mono text-xs" title={path.join('.')}>{path.join('.')}</FieldDescription>}
            {problem.key && <FieldError id={`${keyId}-error`} className="text-xs">{problem.key}</FieldError>}
          </Field>
          <Field data-disabled={entryLocked || undefined} data-invalid={!!problem.value || undefined} className="min-w-0 gap-[var(--rui-space-1)]">
            <FieldLabel htmlFor={valueId} className="text-xs text-muted-foreground">值 {index + 1}{entry.secret ? '（敏感）' : ''}</FieldLabel>
            {valueControl}
            {problem.value && <FieldError id={`${valueId}-error`} className="text-xs">{problem.value}</FieldError>}
          </Field>
          <Button variant="ghost" size="icon-sm" className="absolute right-[var(--rui-content-padding)] top-[var(--rui-content-padding)] @md/key-value-editor:static @md/key-value-editor:mt-5" disabled={entryLocked || entry.readOnly} aria-label={`删除第 ${index + 1} 项`} onClick={() => remove(entry.id)}><Trash2 aria-hidden="true" /></Button>
        </li>;
      })}
    </ol> : <p className="rounded-lg border border-dashed border-border p-[var(--rui-content-padding)] text-muted-foreground">尚未添加键值，使用“添加键值”开始。</p>}
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <p role="status" className="text-xs text-muted-foreground">{status}{maxRows !== undefined && ` · 最多 ${maxRows} 项`}</p>
      {onSubmit && <div className="flex flex-wrap gap-[var(--rui-space-2)]">
        <Button type="button" variant="ghost" size="sm" disabled={locked || !dirtyChanges.length} onClick={() => replace(baseline.current, '已恢复到最近一次应用')}><X aria-hidden="true" />{cancelLabel}</Button>
        {defaultValue && <Button type="button" variant="outline" size="sm" disabled={locked || !resetChanges.length} onClick={() => replace(defaultValue, '已恢复默认值，尚未应用')}><RotateCcw aria-hidden="true" />{resetLabel}</Button>}
        <Button type="button" size="sm" disabled={locked || invalidCount > 0 || !dirtyChanges.length} onClick={() => { void submit(); }}><Save aria-hidden="true" />{saving ? '正在应用…' : submitLabel}</Button>
      </div>}
    </div>
    {submissionError && <p role="alert" className="text-sm text-destructive">{submissionError}</p>}
  </section>;
}
