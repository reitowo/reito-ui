import { useId, useRef, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { cx } from './shared.js';

export interface PropertyItem {
  key: string;
  label: string;
  value: string | number;
  kind?: 'text' | 'number';
  description?: string;
  readOnly?: boolean;
  placeholder?: string;
  validate?: (value: string | number) => string | undefined;
}
export interface PropertyListProps { items: PropertyItem[]; onValueChange: (key: string, value: string | number) => void; label?: string; disabled?: boolean; className?: string; }

function PropertyRow({ item, onValueChange, disabled }: { item: PropertyItem; onValueChange: PropertyListProps['onValueChange']; disabled?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(item.value));
  const [error, setError] = useState<string>();
  const composing = useRef(false);
  const id = useId();
  const editRef = useRef<HTMLButtonElement>(null);
  function finish() { setEditing(false); setError(undefined); requestAnimationFrame(() => editRef.current?.focus()); }
  function save() {
    const parsed = item.kind === 'number' ? Number(draft) : draft.trim();
    const problem = item.kind === 'number' && (!draft.trim() || !Number.isFinite(parsed)) ? '请输入有效数字' : item.validate?.(parsed);
    if (problem) { setError(problem); return; }
    onValueChange(item.key, parsed); finish();
  }
  return <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-[var(--rui-content-gap)] px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">
    <dt className="pt-1 text-sm text-muted-foreground">{item.label}{item.description && <p className="mt-1 text-xs leading-relaxed">{item.description}</p>}</dt>
    <dd className="min-w-0">{editing ? <form onSubmit={event => { event.preventDefault(); save(); }} className="space-y-2">
      <Input autoFocus aria-label={item.label} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} type={item.kind === 'number' ? 'number' : 'text'} value={draft} placeholder={item.placeholder} disabled={disabled} onChange={event => { setDraft(event.target.value); setError(undefined); }} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); if (event.key === 'Escape') { event.preventDefault(); finish(); } }} />
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2"><Button type="submit" size="xs" disabled={disabled}><Check aria-hidden="true" />保存</Button><Button type="button" variant="ghost" size="xs" onClick={finish}><X aria-hidden="true" />取消</Button></div>
    </form> : <div className="flex items-center justify-between gap-2"><span className="break-all py-1 text-sm">{String(item.value) || '未设置'}</span>{!item.readOnly && <Button ref={editRef} variant="ghost" size="icon-sm" aria-label={`编辑${item.label}`} disabled={disabled} onClick={() => { setDraft(String(item.value)); setError(undefined); setEditing(true); }}><Pencil aria-hidden="true" /></Button>}</div>}</dd>
  </div>;
}

export function PropertyList({ items, onValueChange, label = '属性', disabled, className }: PropertyListProps) {
  return <dl aria-label={label} className={cx('divide-y divide-border rounded-lg border border-border font-sans text-foreground', className)}>{items.map(item => <PropertyRow key={item.key} item={item} onValueChange={onValueChange} disabled={disabled} />)}</dl>;
}
