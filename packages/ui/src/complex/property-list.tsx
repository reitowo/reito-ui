import { useEffect, useId, useRef, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
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
export interface PropertyOption { value: string; label: string; disabled?: boolean; }
export interface PropertyItem {
  key: string;
  label: string;
  value: PropertyValue;
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
export interface PropertyListProps {
  items: PropertyItem[];
  onValueChange: (key: string, value: PropertyValue, path: PropertyPath) => void;
  onDraftValueChange?: (key: string, draft: PropertyDraftValue, path: PropertyPath) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

function pathOf(item: PropertyItem): PropertyPath { return item.path ?? [item.key]; }
function draftOf(item: PropertyItem): PropertyDraftValue { return item.kind === 'boolean' ? Boolean(item.value) : String(item.value); }
function displayValue(item: PropertyItem) {
  if (item.kind === 'boolean') return item.value ? item.trueLabel ?? '开启' : item.falseLabel ?? '关闭';
  if (item.kind === 'select') return item.options?.find(option => option.value === String(item.value))?.label ?? String(item.value);
  return String(item.value) || '未设置';
}

function PropertyRow({ item, onValueChange, onDraftValueChange, disabled }: { item: PropertyItem; onValueChange: PropertyListProps['onValueChange']; onDraftValueChange?: PropertyListProps['onDraftValueChange']; disabled?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PropertyDraftValue>(() => draftOf(item));
  const [error, setError] = useState<string>();
  const composing = useRef(false);
  const id = useId();
  const editRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const locked = disabled || item.disabled;
  const path = pathOf(item);

  useEffect(() => { if (!editing) setDraft(draftOf(item)); }, [editing, item.kind, item.value]);
  useEffect(() => { if (editing) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('input, select, [role="switch"]')?.focus()); }, [editing]);

  function updateDraft(next: PropertyDraftValue) {
    setDraft(next);
    setError(undefined);
    onDraftValueChange?.(item.key, next, path);
  }

  function finish() {
    setEditing(false);
    setDraft(draftOf(item));
    setError(undefined);
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
    if (problem || parsed.value === undefined) { setError(problem ?? '属性值无效'); return; }
    onValueChange(item.key, parsed.value, path);
    setEditing(false);
    setError(undefined);
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

  return <div data-disabled={locked || undefined} className="grid min-w-0 grid-cols-1 gap-[var(--rui-content-gap-sm)] px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)] @md/property-list:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @md/property-list:gap-[var(--rui-content-gap)]">
    <dt className="min-w-0 text-sm text-muted-foreground"><span className="block text-foreground">{item.label}</span>{item.description && <span className="mt-1 block text-xs leading-relaxed">{item.description}</span>}{item.path && <code className="mt-1 block truncate font-mono text-xs" title={path.join('.')}>{path.join('.')}</code>}</dt>
    <dd className="min-w-0">{editing ? <form ref={formRef} noValidate onSubmit={event => { event.preventDefault(); save(); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); finish(); } }} className="space-y-[var(--rui-content-gap-sm)]">
      <Field data-disabled={locked || undefined} data-invalid={!!error || undefined}><FieldLabel htmlFor={id} className="sr-only">{item.label}</FieldLabel>{editor}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}</Field>
      <div className="flex gap-[var(--rui-space-2)]"><Button type="submit" size="xs" disabled={locked}><Check aria-hidden="true" />保存</Button><Button type="button" variant="ghost" size="xs" onClick={finish}><X aria-hidden="true" />取消</Button></div>
    </form> : <div className="flex min-w-0 items-center justify-between gap-[var(--rui-content-gap-sm)]"><span className="min-w-0 break-words py-1 text-sm">{displayValue(item)}</span>{!item.readOnly && <Button ref={editRef} variant="ghost" size="icon-sm" aria-label={`编辑${item.label}`} disabled={locked} onClick={() => { setDraft(draftOf(item)); setError(undefined); setEditing(true); }}><Pencil aria-hidden="true" /></Button>}</div>}</dd>
  </div>;
}

export function PropertyList({ items, onValueChange, onDraftValueChange, label = '属性', disabled, className }: PropertyListProps) {
  return <dl aria-label={label} className={cx('@container/property-list divide-y divide-border rounded-lg border border-border font-sans text-foreground', className)}>{items.map(item => <PropertyRow key={item.key} item={item} onValueChange={onValueChange} onDraftValueChange={onDraftValueChange} disabled={disabled} />)}</dl>;
}
