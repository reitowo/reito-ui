import { useId, useRef, useState } from 'react';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { cx } from './shared.js';

export interface KeyValueEntry { id: string; key: string; value: string; secret?: boolean; readOnly?: boolean; }
export interface KeyValueEditorProps {
  value: KeyValueEntry[];
  onValueChange: (entries: KeyValueEntry[]) => void;
  onSubmit?: (entries: KeyValueEntry[]) => void | Promise<void>;
  label?: string;
  requireValues?: boolean;
  maxRows?: number;
  disabled?: boolean;
  submitLabel?: string;
  className?: string;
}

/** An ordered, controlled collection preserves invalid drafts and duplicate keys until they are fixed. */
export function KeyValueEditor({
  value, onValueChange, onSubmit, label = '键值配置', requireValues = false,
  maxRows, disabled = false, submitLabel = '应用配置', className,
}: KeyValueEditorProps) {
  const editorId = useId();
  const serial = useRef(0);
  const addButton = useRef<HTMLButtonElement>(null);
  const [newRowId, setNewRowId] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const inFlight = useRef(false);
  const locked = disabled || saving;
  const keyCounts = new Map<string, number>();
  for (const entry of value) {
    const key = entry.key.trim();
    if (key) keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
  }
  const errors = value.map(entry => ({
    key: !entry.key.trim() ? '键不能为空' : (keyCounts.get(entry.key.trim()) ?? 0) > 1 ? '键不能重复' : undefined,
    value: requireValues && !entry.value.trim() ? '值不能为空' : undefined,
  }));
  const invalidCount = errors.filter(error => error.key || error.value).length;

  function update(id: string, patch: Partial<Pick<KeyValueEntry, 'key' | 'value'>>) {
    setSubmissionError('');
    onValueChange(value.map(entry => entry.id === id ? { ...entry, ...patch } : entry));
  }

  function add() {
    if (locked || (maxRows !== undefined && value.length >= maxRows)) return;
    const id = `${editorId}-${serial.current++}`;
    setNewRowId(id);
    setSubmissionError('');
    onValueChange([...value, { id, key: '', value: '' }]);
  }

  function remove(id: string) {
    setSubmissionError('');
    onValueChange(value.filter(entry => entry.id !== id));
    setRevealed(previous => { const next = new Set(previous); next.delete(id); return next; });
    requestAnimationFrame(() => addButton.current?.focus());
  }

  async function submit() {
    if (!onSubmit || locked || inFlight.current || invalidCount) return;
    inFlight.current = true;
    setSaving(true);
    setSubmissionError('');
    try {
      await onSubmit(value.map(entry => ({ ...entry, key: entry.key.trim() })));
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : '配置未保存，请重试。');
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return <section aria-label={label} aria-busy={saving} className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <header className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <h3 className="font-medium">{label}</h3>
      <Button ref={addButton} variant="outline" size="sm" disabled={locked || (maxRows !== undefined && value.length >= maxRows)} onClick={add}><Plus aria-hidden="true" />添加键值</Button>
    </header>
    {value.length ? <ol className="divide-y divide-border rounded-lg border border-border">
      {value.map((entry, index) => {
        const keyId = `${editorId}-key-${index}`;
        const valueId = `${editorId}-value-${index}`;
        const problem = errors[index];
        const visible = revealed.has(entry.id);
        return <li key={entry.id} className="grid grid-cols-1 items-start gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]">
          <div className="min-w-0 space-y-1">
            <label htmlFor={keyId} className="text-xs text-muted-foreground">键 {index + 1}</label>
            <Input id={keyId} autoFocus={newRowId === entry.id} value={entry.key} disabled={locked} readOnly={entry.readOnly}
              aria-required="true" aria-invalid={!!problem.key} aria-describedby={problem.key ? `${keyId}-error` : undefined}
              onChange={event => update(entry.id, { key: event.target.value })} />
            {problem.key && <p id={`${keyId}-error`} className="text-xs text-destructive">{problem.key}</p>}
          </div>
          <div className="min-w-0 space-y-1">
            <label htmlFor={valueId} className="text-xs text-muted-foreground">值 {index + 1}{entry.secret ? '（敏感）' : ''}</label>
            <div className="flex items-center gap-1">
              <Input id={valueId} type={entry.secret && !visible ? 'password' : 'text'} value={entry.value}
                disabled={locked} readOnly={entry.readOnly} autoComplete="off"
                aria-required={requireValues} aria-invalid={!!problem.value} aria-describedby={problem.value ? `${valueId}-error` : undefined}
                onChange={event => update(entry.id, { value: event.target.value })} />
              {entry.secret && <Button variant="ghost" size="icon-sm" disabled={locked} aria-label={`${visible ? '隐藏' : '显示'}第 ${index + 1} 项的值`} aria-pressed={visible} onClick={() => setRevealed(previous => {
                const next = new Set(previous);
                if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id);
                return next;
              })}>{visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>}
            </div>
            {problem.value && <p id={`${valueId}-error`} className="text-xs text-destructive">{problem.value}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" className="sm:mt-5" disabled={locked || entry.readOnly} aria-label={`删除第 ${index + 1} 项`} onClick={() => remove(entry.id)}><Trash2 aria-hidden="true" /></Button>
        </li>;
      })}
    </ol> : <p className="rounded-lg border border-dashed border-border p-[var(--rui-content-padding)] text-muted-foreground">尚未添加键值，使用“添加键值”开始。</p>}
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <p role="status" className="text-xs text-muted-foreground">{invalidCount ? `${invalidCount} 项需要修正` : `${value.length} 项配置有效`}{maxRows !== undefined && ` · 最多 ${maxRows} 项`}</p>
      {onSubmit && <Button size="sm" disabled={locked || invalidCount > 0} onClick={() => { void submit(); }}>{saving ? '正在应用…' : submitLabel}</Button>}
    </div>
    {submissionError && <p role="alert" className="text-sm text-destructive">{submissionError}</p>}
  </section>;
}
