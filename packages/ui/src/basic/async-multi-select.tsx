import { useId, useMemo, useState, type ReactNode } from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Combobox, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxValue, useComboboxAnchor } from '../primitives/combobox.js';
import { Label } from '../primitives/label.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';
import { useAsyncOptions, type AsyncOptionsLoader, type AsyncSelectOption } from './async-options.js';
import { MultiSelectActions, MultiSelectCreateAction, MultiSelectOptionList, hasExactMultiSelectOption, mergeMultiSelectOptions, type MultiSelectEnhancementProps } from './multi-select-shared.js';

export type AsyncMultiSelectOption = AsyncSelectOption;
export type AsyncMultiSelectLoader = AsyncOptionsLoader;

export interface AsyncMultiSelectProps extends MultiSelectEnhancementProps<AsyncMultiSelectOption> {
  label: string;
  loadOptions: AsyncMultiSelectLoader;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  initialOptions?: AsyncMultiSelectOption[];
  selectedOptions?: AsyncMultiSelectOption[];
  minQueryLength?: number;
  debounceMs?: number;
  name?: string;
  placeholder?: string;
  idleMessage?: string;
  loadingMessage?: string;
  emptyMessage?: string;
  retryLabel?: string;
  description?: ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onLoadError?: (error: unknown, query: string) => void;
}

/** Host-loaded multiselect that retains selected chips outside the current result page. */
export function AsyncMultiSelect({ label, loadOptions, value, defaultValue, onValueChange, query: controlledQuery, defaultQuery, onQueryChange, initialOptions = [], selectedOptions = [], minQueryLength = 0, debounceMs = 200, name, placeholder = '输入关键词搜索…', idleMessage, loadingMessage = '正在查询…', emptyMessage = '没有匹配的选项', retryLabel = '重试', description, error, disabled = false, required = false, className, onLoadError, showSelectAll = false, selectAllLabel, clearAllLabel, onCreateOption, createLabel = query => `创建“${query}”`, creatingLabel = '正在创建…', onCreateError }: AsyncMultiSelectProps) {
  const id = useId();
  const anchor = useComboboxAnchor();
  const [internalValue, setInternalValue] = useState(defaultValue ?? []);
  const [createdOptions, setCreatedOptions] = useState<AsyncMultiSelectOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string>();
  const selectedValue = value ?? internalValue;
  const { query, changeQuery, options, status, loadError, retry, cache } = useAsyncOptions({ loadOptions, query: controlledQuery, defaultQuery, onQueryChange, initialOptions, selectedOptions, minQueryLength, debounceMs, onLoadError });
  const visibleOptions = useMemo(() => mergeMultiSelectOptions(options, createdOptions), [options, createdOptions]);
  const optionMap = useMemo(() => new Map([...cache.current.values(), ...selectedOptions, ...visibleOptions].map(option => [option.value, option])), [cache, selectedOptions, visibleOptions]);
  const items = useMemo(() => visibleOptions.map(option => option.value), [visibleOptions]);
  const canCreate = Boolean(onCreateOption && status === 'ready' && !hasExactMultiSelectOption([...cache.current.values(), ...visibleOptions], query));
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : '', createError ? `${id}-create-error` : ''].filter(Boolean).join(' ') || undefined;
  const resolvedIdle = idleMessage ?? `请输入至少 ${Math.max(1, minQueryLength)} 个字符`;

  function changeValue(next: string[]) { if (value === undefined) setInternalValue(next); onValueChange?.(next); }
  async function create() {
    const nextLabel = query.trim();
    if (!onCreateOption || !nextLabel || creating) return;
    setCreating(true); setCreateError(undefined);
    try {
      const option = await onCreateOption(nextLabel);
      cache.current.set(option.value, option);
      setCreatedOptions(current => mergeMultiSelectOptions(current, [option]));
      changeValue(selectedValue.includes(option.value) ? selectedValue : [...selectedValue, option.value]);
      changeQuery('');
    } catch (cause) {
      setCreateError(cause instanceof Error && cause.message ? cause.message : '创建失败');
      onCreateError?.(cause, nextLabel);
    } finally { setCreating(false); }
  }

  return <div data-slot="async-multi-select" data-status={status} className={cn('grid min-w-0 gap-2 text-sm', className)}>
    <Label htmlFor={id}>{label}</Label>
    <Combobox<string, true> multiple items={items} filteredItems={items} filter={null} value={selectedValue} onValueChange={next => { for (const selected of next) { const option = optionMap.get(selected); if (option) cache.current.set(selected, option); } changeValue(next); changeQuery(''); }} inputValue={query} onInputValueChange={(next, details) => { if (details.reason === 'input-change' || details.reason === 'input-clear' || details.reason === 'clear-press') { changeQuery(next); setCreateError(undefined); } }} itemToStringLabel={item => cache.current.get(item)?.label ?? item} disabled={disabled} name={name}>
      <ComboboxChips ref={anchor} aria-busy={status === 'loading'} className="py-0">
        <ComboboxValue>{(selected: string[]) => selected.map(item => <ComboboxChip key={item} showRemove={false}><span className="max-w-40 truncate">{cache.current.get(item)?.label ?? item}</span><ComboboxPrimitive.ChipRemove disabled={optionMap.get(item)?.disabled} aria-label={`移除${cache.current.get(item)?.label ?? item}`} render={<Button variant="ghost" size="icon-xs" className="-mr-1" />}><X className="size-3" aria-hidden="true" /></ComboboxPrimitive.ChipRemove></ComboboxChip>)}</ComboboxValue>
        <ComboboxChipsInput id={id} aria-label={label} value={query} placeholder={placeholder} disabled={disabled} required={required && selectedValue.length === 0} aria-invalid={Boolean(error || createError)} aria-describedby={describedBy} />
        {status === 'loading' && <Spinner aria-label={loadingMessage} />}
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        {status === 'idle' ? <p className="px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground">{resolvedIdle}</p> : status === 'loading' ? <div role="status" className="flex items-center gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground"><Spinner aria-hidden="true" />{loadingMessage}</div> : status === 'error' ? <div className="grid gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]"><p role="alert" className="flex items-start gap-[var(--rui-space-2)] text-sm text-destructive"><AlertCircle aria-hidden="true" className="mt-[var(--rui-space-1)] size-3 shrink-0" />{loadError}</p><Button type="button" variant="outline" size="xs" className="justify-self-start" onClick={retry}><RotateCcw aria-hidden="true" />{retryLabel}</Button></div> : <><MultiSelectActions selected={selectedValue} visibleOptions={visibleOptions} optionMap={optionMap} showSelectAll={showSelectAll} selectAllLabel={selectAllLabel} clearAllLabel={clearAllLabel} onValueChange={changeValue} /><ComboboxEmpty>{canCreate ? null : emptyMessage}</ComboboxEmpty><MultiSelectOptionList options={visibleOptions} />{canCreate && <MultiSelectCreateAction label={creating ? creatingLabel : createLabel(query.trim())} creating={creating} onCreate={() => void create()} />}</>}
      </ComboboxContent>
    </Combobox>
    {description && <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    {createError && <p id={`${id}-create-error`} role="alert" className="text-xs text-destructive">{createError}</p>}
  </div>;
}
