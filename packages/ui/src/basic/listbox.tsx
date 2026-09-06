import * as React from 'react';
import { Check, Search, X } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { Button } from '../primitives/button.js';
import { Field, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { Input } from '../primitives/input.js';

export interface ListboxOption {
  value: string;
  label: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  group?: string;
  disabled?: boolean;
  keywords?: readonly string[];
}

export type ListboxSelectionMode = 'single' | 'multiple';
export type ListboxValue = string | string[] | null;

export interface ListboxProps extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  label: string;
  options: readonly ListboxOption[];
  selectionMode?: ListboxSelectionMode;
  value?: ListboxValue;
  defaultValue?: ListboxValue;
  onValueChange?: (value: ListboxValue) => void;
  activeValue?: string | null;
  defaultActiveValue?: string | null;
  onActiveValueChange?: (value: string | null) => void;
  searchable?: boolean;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  rangeSelection?: boolean;
  bulkSelection?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  placeholder?: string;
  emptyMessage?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  listClassName?: string;
}

function textOf(value: React.ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function normalizeValue(value: ListboxValue | undefined, mode: ListboxSelectionMode) {
  if (mode === 'multiple') return Array.isArray(value) ? value : value ? [value] : [];
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

/** Persistent single or multi-select list with grouped rich options and active-descendant focus. */
export function Listbox({
  label,
  options,
  selectionMode = 'single',
  value,
  defaultValue = selectionMode === 'multiple' ? [] : null,
  onValueChange,
  activeValue,
  defaultActiveValue = null,
  onActiveValueChange,
  searchable = false,
  query,
  defaultQuery = '',
  onQueryChange,
  rangeSelection = true,
  bulkSelection = true,
  clearable = false,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  form,
  placeholder = '搜索选项…',
  emptyMessage = '没有可用选项',
  description,
  error,
  className,
  listClassName,
  id: suppliedId,
  ...props
}: ListboxProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? `listbox-${generatedId}`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const [internalValue, setInternalValue] = React.useState<ListboxValue>(() => normalizeValue(defaultValue, selectionMode));
  const selectedValue = normalizeValue(value === undefined ? internalValue : value, selectionMode);
  const selected = React.useMemo(() => new Set(Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : []), [selectedValue]);
  const [internalQuery, setInternalQuery] = React.useState(defaultQuery);
  const searchQuery = query ?? internalQuery;
  const [internalActive, setInternalActive] = React.useState<string | null>(defaultActiveValue);
  const currentActive = activeValue === undefined ? internalActive : activeValue;
  const anchor = React.useRef<string | null>(null);
  const typeahead = React.useRef('');
  const typeaheadTimer = React.useRef<number | undefined>(undefined);
  const listRef = React.useRef<HTMLDivElement>(null);

  const visibleOptions = React.useMemo(() => {
    const term = searchQuery.trim().toLocaleLowerCase();
    if (!term) return [...options];
    return options.filter(option => [option.label, textOf(option.description), ...(option.keywords ?? [])].join(' ').toLocaleLowerCase().includes(term));
  }, [options, searchQuery]);
  const enabledOptions = React.useMemo(() => visibleOptions.filter(option => !option.disabled), [visibleOptions]);
  const optionIndex = React.useMemo(() => new Map(options.map((option, index) => [option.value, index])), [options]);
  const optionId = (option: ListboxOption) => `${id}-option-${optionIndex.get(option.value) ?? 0}`;

  const setActive = React.useCallback((next: string | null) => {
    if (activeValue === undefined) setInternalActive(next);
    onActiveValueChange?.(next);
  }, [activeValue, onActiveValueChange]);
  const emitValue = React.useCallback((next: ListboxValue) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }, [onValueChange, value]);
  const setSearchQuery = (next: string) => {
    if (query === undefined) setInternalQuery(next);
    onQueryChange?.(next);
  };

  React.useEffect(() => {
    if (currentActive && enabledOptions.some(option => option.value === currentActive)) return;
    const selectedCandidate = enabledOptions.find(option => selected.has(option.value));
    setActive(selectedCandidate?.value ?? enabledOptions[0]?.value ?? null);
  }, [currentActive, enabledOptions, selected, setActive]);
  React.useEffect(() => {
    if (!currentActive) return;
    document.getElementById(optionId({ value: currentActive, label: '' }))?.scrollIntoView({ block: 'nearest' });
  }, [currentActive, optionIndex]);
  React.useEffect(() => () => window.clearTimeout(typeaheadTimer.current), []);

  const choose = (option: ListboxOption, withRange = false) => {
    if (disabled || readOnly || option.disabled) return;
    if (selectionMode === 'single') {
      emitValue(option.value);
      anchor.current = option.value;
      return;
    }
    const next = new Set(selected);
    if (withRange && rangeSelection && anchor.current) {
      const anchorIndex = enabledOptions.findIndex(item => item.value === anchor.current);
      const targetIndex = enabledOptions.findIndex(item => item.value === option.value);
      if (anchorIndex >= 0 && targetIndex >= 0) {
        for (const item of enabledOptions.slice(Math.min(anchorIndex, targetIndex), Math.max(anchorIndex, targetIndex) + 1)) next.add(item.value);
      }
    } else if (next.has(option.value)) next.delete(option.value);
    else next.add(option.value);
    anchor.current = option.value;
    emitValue(options.filter(item => next.has(item.value)).map(item => item.value));
  };
  const move = (delta: number, extend = false) => {
    if (!enabledOptions.length) return;
    const index = enabledOptions.findIndex(option => option.value === currentActive);
    const next = enabledOptions[Math.max(0, Math.min(enabledOptions.length - 1, (index < 0 ? 0 : index) + delta))];
    if (!next) return;
    setActive(next.value);
    if (extend && selectionMode === 'multiple' && rangeSelection) choose(next, true);
  };
  const clear = () => {
    if (disabled || readOnly) return;
    emitValue(selectionMode === 'multiple' ? [] : null);
    anchor.current = null;
    listRef.current?.focus();
  };
  const keyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1, event.shiftKey);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActive((event.key === 'Home' ? enabledOptions[0] : enabledOptions.at(-1))?.value ?? null);
      return;
    }
    if ((event.key === ' ' || event.key === 'Enter') && currentActive) {
      event.preventDefault();
      const option = enabledOptions.find(item => item.value === currentActive);
      if (option) choose(option, event.shiftKey);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'a' && selectionMode === 'multiple' && bulkSelection && !readOnly) {
      event.preventDefault();
      const allSelected = enabledOptions.every(option => selected.has(option.value));
      emitValue(allSelected ? [] : options.filter(option => !option.disabled && visibleOptions.includes(option)).map(option => option.value));
      return;
    }
    if (!searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead.current += event.key.toLocaleLowerCase();
      window.clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = window.setTimeout(() => { typeahead.current = ''; }, 600);
      const start = Math.max(0, enabledOptions.findIndex(option => option.value === currentActive) + 1);
      const ordered = [...enabledOptions.slice(start), ...enabledOptions.slice(0, start)];
      const match = ordered.find(option => option.label.toLocaleLowerCase().startsWith(typeahead.current));
      if (match) { event.preventDefault(); setActive(match.value); }
    }
  };

  const grouped = React.useMemo(() => {
    const result: Array<{ group: string | null; options: ListboxOption[] }> = [];
    for (const option of visibleOptions) {
      const group = option.group ?? null;
      let entry = result.find(item => item.group === group);
      if (!entry) { entry = { group, options: [] }; result.push(entry); }
      entry.options.push(option);
    }
    return result;
  }, [visibleOptions]);
  const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(' ') || undefined;
  const selectedCount = selected.size;

  return <Field data-slot="listbox-field" data-disabled={disabled || undefined} data-invalid={Boolean(error) || undefined} className={className}>
    <div className="flex min-w-0 items-center justify-between gap-[var(--rui-space-2)]">
      <FieldLabel id={`${id}-label`} htmlFor={id}>{label}</FieldLabel>
      <div className="flex shrink-0 items-center gap-[var(--rui-space-1)] text-xs text-muted-foreground">
        {selectionMode === 'multiple' && <output aria-live="polite">已选 {selectedCount} 项</output>}
        {clearable && selectedCount > 0 && <Button type="button" variant="ghost" size="xs" onClick={clear} disabled={disabled || readOnly}><X aria-hidden="true" />清除</Button>}
      </div>
    </div>
    {searchable && <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute left-[var(--rui-space-2)] top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input value={searchQuery} onChange={event => setSearchQuery(event.currentTarget.value)} onKeyDown={event => {
        if (event.key === 'ArrowDown') { event.preventDefault(); listRef.current?.focus(); setActive(enabledOptions[0]?.value ?? null); }
      }} disabled={disabled} readOnly={readOnly} aria-label={`搜索${label}`} placeholder={placeholder} className="pl-[calc(var(--rui-space-2)+var(--rui-space-4))]" />
    </div>}
    <div data-slot="listbox-viewport" data-disabled={disabled || undefined} data-empty={!visibleOptions.length || undefined} className={cn('max-h-64 min-w-0 overflow-y-auto rounded-lg border border-border bg-background p-[var(--rui-space-1)] text-sm focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring', listClassName)}>
    <div {...props} ref={listRef} id={id} role="listbox" tabIndex={0} aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-multiselectable={selectionMode === 'multiple' || undefined} aria-activedescendant={currentActive ? optionId({ value: currentActive, label: '' }) : undefined} aria-disabled={disabled || undefined} aria-readonly={readOnly || undefined} aria-required={required || undefined} aria-invalid={Boolean(error) || undefined} data-slot="listbox" data-empty={!visibleOptions.length || undefined} onFocus={() => {
      if (!currentActive) setActive(enabledOptions.find(option => selected.has(option.value))?.value ?? enabledOptions[0]?.value ?? null);
    }} onKeyDown={keyDown} className="min-h-[var(--rui-border-width)] min-w-0 outline-none">
      {visibleOptions.length ? grouped.map(({ group, options: groupOptions }, groupIndex) => {
        const groupId = `${id}-group-${groupIndex}`;
        return <div key={group ?? 'ungrouped'} role={group ? 'group' : 'presentation'} aria-labelledby={group ? groupId : undefined} className="min-w-0">
          {group && <div id={groupId} role="presentation" className="px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-xs font-medium text-muted-foreground">{group}</div>}
          {groupOptions.map(option => {
            const isSelected = selected.has(option.value);
            const isActive = currentActive === option.value;
            return <div key={option.value} id={optionId(option)} role="option" aria-selected={isSelected} aria-disabled={option.disabled || undefined} data-slot="listbox-option" data-active={isActive || undefined} data-selected={isSelected || undefined} data-disabled={option.disabled || undefined} onPointerMove={() => { if (!option.disabled) setActive(option.value); }} onClick={event => {
              listRef.current?.focus(); setActive(option.value); choose(option, event.shiftKey);
            }} className="flex min-h-[var(--rui-control-height)] min-w-0 cursor-default items-center gap-[var(--rui-space-2)] rounded-md px-[var(--rui-space-2)] py-[var(--rui-space-1)] leading-tight outline-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-[var(--rui-opacity-disabled)] data-[selected=true]:font-medium">
              {option.icon && <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-full" aria-hidden="true">{option.icon}</span>}
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="block truncate leading-none">{option.label}</span>
                {option.description && <span className="block truncate text-xs font-normal leading-none text-muted-foreground">{option.description}</span>}
              </span>
              <Check aria-hidden="true" className={cn('size-3.5 shrink-0 text-primary', !isSelected && 'invisible')} />
            </div>;
          })}
        </div>;
      }) : null}
    </div>
    {!visibleOptions.length && <div role="status" className="px-[var(--rui-space-2)] py-[var(--rui-content-padding)] text-center text-sm text-muted-foreground">{emptyMessage}</div>}
    </div>
    {name && (selectionMode === 'multiple' ? [...selected].map(item => <input key={item} type="hidden" name={name} form={form} value={item} disabled={disabled} />) : <input type="hidden" name={name} form={form} value={Array.isArray(selectedValue) ? selectedValue[0] ?? '' : selectedValue ?? ''} disabled={disabled} />)}
    {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
    {error && <FieldError id={errorId}>{error}</FieldError>}
  </Field>;
}
