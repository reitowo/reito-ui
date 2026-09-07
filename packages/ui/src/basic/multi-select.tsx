import { useId, useMemo, useState, type ReactNode } from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Combobox, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxValue, useComboboxAnchor } from '../primitives/combobox.js';
import { Label } from '../primitives/label.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';
import { MultiSelectActions, MultiSelectCreateAction, MultiSelectOptionList, filterMultiSelectOptions, hasExactMultiSelectOption, mergeMultiSelectOptions, type MultiSelectEnhancementProps, type MultiSelectOption } from './multi-select-shared.js';

export type { MultiSelectOption, MultiSelectVirtualRange } from './multi-select-shared.js';
export interface MultiSelectProps extends MultiSelectEnhancementProps {
  label: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  description?: ReactNode;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/** Searchable local multiselection with grouped options, creation and visible-result bulk actions. */
export function MultiSelect({ label, options, value, defaultValue, onValueChange, name, disabled = false, loading = false, error, description, placeholder = '搜索并选择…', emptyMessage = '没有匹配的选项', className, showSelectAll = false, selectAllLabel, clearAllLabel, onCreateOption, createLabel = query => `创建“${query}”`, creatingLabel = '正在创建…', onCreateError, virtual = false, virtualOverscan = 4, onVirtualRangeChange }: MultiSelectProps) {
  const id = useId();
  const anchor = useComboboxAnchor();
  const [internalValue, setInternalValue] = useState(defaultValue ?? []);
  const [query, setQuery] = useState('');
  const [createdOptions, setCreatedOptions] = useState<MultiSelectOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string>();
  const [highlightedValue, setHighlightedValue] = useState<string>();
  const selectedValue = value ?? internalValue;
  const allOptions = useMemo(() => mergeMultiSelectOptions(options, createdOptions), [options, createdOptions]);
  const visibleOptions = useMemo(() => filterMultiSelectOptions(allOptions, query), [allOptions, query]);
  const labels = useMemo(() => new Map(allOptions.map(option => [option.value, option.label])), [allOptions]);
  const optionMap = useMemo(() => new Map(allOptions.map(option => [option.value, option])), [allOptions]);
  const items = useMemo(() => allOptions.map(option => option.value), [allOptions]);
  const filteredItems = useMemo(() => visibleOptions.map(option => option.value), [visibleOptions]);
  const canCreate = Boolean(onCreateOption && !hasExactMultiSelectOption(allOptions, query));
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : '', createError ? `${id}-create-error` : ''].filter(Boolean).join(' ') || undefined;
  function changeValue(next: string[]) { if (value === undefined) setInternalValue(next); onValueChange?.(next); }
  async function create() {
    const nextLabel = query.trim();
    if (!onCreateOption || !nextLabel || creating) return;
    setCreating(true); setCreateError(undefined);
    try {
      const option = await onCreateOption(nextLabel);
      setCreatedOptions(current => mergeMultiSelectOptions(current, [option]));
      changeValue(selectedValue.includes(option.value) ? selectedValue : [...selectedValue, option.value]);
      setQuery('');
    } catch (cause) {
      setCreateError(cause instanceof Error && cause.message ? cause.message : '创建失败');
      onCreateError?.(cause, nextLabel);
    } finally { setCreating(false); }
  }
  return <div data-slot="multi-select" className={cn('grid min-w-0 gap-2 text-sm', className)}>
    <Label htmlFor={id}>{label}</Label>
    <Combobox<string, true> multiple items={items} filteredItems={filteredItems} filter={null} virtualized={virtual} onItemHighlighted={item => setHighlightedValue(item)} value={selectedValue} onValueChange={next => { changeValue(next); setQuery(''); }} inputValue={query} onInputValueChange={(next, details) => { if (details.reason === 'input-change' || details.reason === 'input-clear' || details.reason === 'clear-press') { setQuery(next); setCreateError(undefined); } }} itemToStringLabel={item => labels.get(item) ?? item} disabled={disabled || loading} name={name}>
      <ComboboxChips ref={anchor} className="min-h-[var(--rui-control-height)]" aria-busy={loading}>
        <ComboboxValue>{(selected: string[]) => selected.map(item => { const option = optionMap.get(item); return <ComboboxChip key={item} showRemove={false}><span>{labels.get(item) ?? item}</span><ComboboxPrimitive.ChipRemove disabled={option?.disabled} aria-label={`移除${labels.get(item) ?? item}`} render={<Button variant="ghost" size="icon-xs" className="-mr-1" />}><X className="size-3" aria-hidden="true" /></ComboboxPrimitive.ChipRemove></ComboboxChip>; })}</ComboboxValue>
        <ComboboxChipsInput id={id} value={query} placeholder={loading ? '正在加载选项…' : placeholder} aria-label={label} aria-invalid={Boolean(error || createError)} aria-describedby={describedBy} />
        {loading && <Spinner aria-label="正在加载选项" />}
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <MultiSelectActions selected={selectedValue} visibleOptions={visibleOptions} optionMap={optionMap} showSelectAll={showSelectAll} selectAllLabel={selectAllLabel} clearAllLabel={clearAllLabel} onValueChange={changeValue} />
        <ComboboxEmpty>{canCreate ? null : emptyMessage}</ComboboxEmpty>
        <MultiSelectOptionList options={visibleOptions} virtual={virtual} overscan={virtualOverscan} highlightedValue={highlightedValue} onRangeChange={onVirtualRangeChange} />
        {canCreate && <MultiSelectCreateAction label={creating ? creatingLabel : createLabel(query.trim())} creating={creating} onCreate={() => void create()} />}
      </ComboboxContent>
    </Combobox>
    {description && <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    {createError && <p id={`${id}-create-error`} role="alert" className="text-xs text-destructive">{createError}</p>}
  </div>;
}
