import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Combobox, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxValue, useComboboxAnchor } from '../primitives/combobox.js';
import { Label } from '../primitives/label.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';
import { useAsyncOptions, type AsyncOptionsLoader, type AsyncSelectOption } from './async-options.js';
import { MultiSelectActions, MultiSelectCreateAction, MultiSelectOptionList, hasExactMultiSelectOption, mergeMultiSelectOptions, type MultiSelectEnhancementProps, type MultiSelectVirtualRange } from './multi-select-shared.js';

export type AsyncMultiSelectOption = AsyncSelectOption;
export type AsyncMultiSelectLoader = AsyncOptionsLoader;
export interface AsyncMultiSelectLoadMoreContext { signal: AbortSignal; offset: number }
export type AsyncMultiSelectLoadMoreLoader = (query: string, context: AsyncMultiSelectLoadMoreContext) => Promise<AsyncMultiSelectOption[]>;

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
  loadMoreOptions?: AsyncMultiSelectLoadMoreLoader;
  hasMore?: boolean;
  loadMoreThreshold?: number;
  loadingMoreMessage?: string;
  loadMoreRetryLabel?: string;
  onLoadMoreError?: (error: unknown, query: string) => void;
}

/** Host-loaded multiselect that retains selected chips outside the current result page. */
export function AsyncMultiSelect({ label, loadOptions, value, defaultValue, onValueChange, query: controlledQuery, defaultQuery, onQueryChange, initialOptions = [], selectedOptions = [], minQueryLength = 0, debounceMs = 200, name, placeholder = '输入关键词搜索…', idleMessage, loadingMessage = '正在查询…', emptyMessage = '没有匹配的选项', retryLabel = '重试', description, error, disabled = false, required = false, className, onLoadError, showSelectAll = false, selectAllLabel, clearAllLabel, onCreateOption, createLabel = query => `创建“${query}”`, creatingLabel = '正在创建…', onCreateError, virtual = false, virtualOverscan = 4, onVirtualRangeChange, loadMoreOptions, hasMore = false, loadMoreThreshold = 4, loadingMoreMessage = '正在加载更多…', loadMoreRetryLabel = '重试加载', onLoadMoreError }: AsyncMultiSelectProps) {
  const id = useId();
  const anchor = useComboboxAnchor();
  const [internalValue, setInternalValue] = useState(defaultValue ?? []);
  const [createdOptions, setCreatedOptions] = useState<AsyncMultiSelectOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string>();
  const [highlightedValue, setHighlightedValue] = useState<string>();
  const [virtualRangeEnd, setVirtualRangeEnd] = useState(-1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string>();
  const [loadMoreRetryVersion, setLoadMoreRetryVersion] = useState(0);
  const loadMoreRequest = useRef(0);
  const loadMoreController = useRef<AbortController | null>(null);
  const lastRequestedCount = useRef(-1);
  const selectedValue = value ?? internalValue;
  const { query, changeQuery, options, appendOptions, status, resultQuery, loadError, retry, cache } = useAsyncOptions({ loadOptions, query: controlledQuery, defaultQuery, onQueryChange, initialOptions, selectedOptions, minQueryLength, debounceMs, onLoadError });
  const visibleOptions = useMemo(() => mergeMultiSelectOptions(options, createdOptions), [options, createdOptions]);
  const optionMap = useMemo(() => new Map([...cache.current.values(), ...selectedOptions, ...visibleOptions].map(option => [option.value, option])), [cache, selectedOptions, visibleOptions]);
  const items = useMemo(() => visibleOptions.map(option => option.value), [visibleOptions]);
  const canCreate = Boolean(onCreateOption && status === 'ready' && !hasExactMultiSelectOption([...cache.current.values(), ...visibleOptions], query));
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : '', createError ? `${id}-create-error` : ''].filter(Boolean).join(' ') || undefined;
  const resolvedIdle = idleMessage ?? `请输入至少 ${Math.max(1, minQueryLength)} 个字符`;

  useEffect(() => {
    loadMoreController.current?.abort();
    lastRequestedCount.current = -1;
    setLoadingMore(false);
    setLoadMoreError(undefined);
  }, [query]);
  useEffect(() => {
    const threshold = Math.max(0, Math.floor(Number.isFinite(loadMoreThreshold) ? loadMoreThreshold : 0));
    if (!virtual || !loadMoreOptions || !hasMore || status !== 'ready' || resultQuery !== query.trim() || options.length === 0 || virtualRangeEnd < options.length - 1 - threshold || lastRequestedCount.current === options.length) return;
    lastRequestedCount.current = options.length;
    const request = ++loadMoreRequest.current;
    const controller = new AbortController();
    loadMoreController.current?.abort();
    loadMoreController.current = controller;
    setLoadingMore(true);
    setLoadMoreError(undefined);
    void loadMoreOptions(query, { signal: controller.signal, offset: options.length }).then(next => {
      if (controller.signal.aborted || request !== loadMoreRequest.current) return;
      appendOptions(next);
      setLoadingMore(false);
    }).catch(cause => {
      if (controller.signal.aborted || request !== loadMoreRequest.current) return;
      setLoadingMore(false);
      setLoadMoreError(cause instanceof Error && cause.message ? cause.message : '加载更多失败');
      onLoadMoreError?.(cause, query);
    });
    return () => controller.abort();
  }, [appendOptions, hasMore, loadMoreOptions, loadMoreRetryVersion, loadMoreThreshold, onLoadMoreError, options.length, query, resultQuery, status, virtual, virtualRangeEnd]);
  useEffect(() => () => loadMoreController.current?.abort(), []);

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
    <Combobox<string, true> multiple items={items} filteredItems={items} filter={null} virtualized={virtual} onItemHighlighted={item => setHighlightedValue(item)} value={selectedValue} onValueChange={next => { for (const selected of next) { const option = optionMap.get(selected); if (option) cache.current.set(selected, option); } changeValue(next); changeQuery(''); }} inputValue={query} onInputValueChange={(next, details) => { if (details.reason === 'input-change' || details.reason === 'input-clear' || details.reason === 'clear-press') { changeQuery(next); setCreateError(undefined); } }} itemToStringLabel={item => cache.current.get(item)?.label ?? item} disabled={disabled} name={name}>
      <ComboboxChips ref={anchor} aria-busy={status === 'loading'} className="py-0">
        <ComboboxValue>{(selected: string[]) => selected.map(item => <ComboboxChip key={item} showRemove={false}><span className="max-w-40 truncate">{cache.current.get(item)?.label ?? item}</span><ComboboxPrimitive.ChipRemove disabled={optionMap.get(item)?.disabled} aria-label={`移除${cache.current.get(item)?.label ?? item}`} render={<Button variant="ghost" size="icon-xs" className="-mr-1" />}><X className="size-3" aria-hidden="true" /></ComboboxPrimitive.ChipRemove></ComboboxChip>)}</ComboboxValue>
        <ComboboxChipsInput id={id} aria-label={label} value={query} placeholder={placeholder} disabled={disabled} required={required && selectedValue.length === 0} aria-invalid={Boolean(error || createError)} aria-describedby={describedBy} />
        {status === 'loading' && <Spinner aria-label={loadingMessage} />}
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        {status === 'idle' ? <p className="px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground">{resolvedIdle}</p> : status === 'loading' ? <div role="status" className="flex items-center gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground"><Spinner aria-hidden="true" />{loadingMessage}</div> : status === 'error' ? <div className="grid gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]"><p role="alert" className="flex items-start gap-[var(--rui-space-2)] text-sm text-destructive"><AlertCircle aria-hidden="true" className="mt-[var(--rui-space-1)] size-3 shrink-0" />{loadError}</p><Button type="button" variant="outline" size="xs" className="justify-self-start" onClick={retry}><RotateCcw aria-hidden="true" />{retryLabel}</Button></div> : <><MultiSelectActions selected={selectedValue} visibleOptions={visibleOptions} optionMap={optionMap} showSelectAll={showSelectAll} selectAllLabel={selectAllLabel} clearAllLabel={clearAllLabel} onValueChange={changeValue} /><ComboboxEmpty>{canCreate ? null : emptyMessage}</ComboboxEmpty><MultiSelectOptionList options={visibleOptions} virtual={virtual} overscan={virtualOverscan} highlightedValue={highlightedValue} onRangeChange={(range: MultiSelectVirtualRange) => { setVirtualRangeEnd(range.visibleEndIndex); onVirtualRangeChange?.(range); }} />{canCreate && <MultiSelectCreateAction label={creating ? creatingLabel : createLabel(query.trim())} creating={creating} onCreate={() => void create()} />}{virtual && (loadingMore || loadMoreError) && <div data-slot="multi-select-load-more" className="flex items-center justify-center gap-2 border-t border-border p-1 text-xs text-muted-foreground">{loadingMore ? <><Spinner aria-hidden="true" />{loadingMoreMessage}</> : <><span role="alert" className="text-destructive">{loadMoreError}</span><Button type="button" variant="ghost" size="xs" onClick={() => { lastRequestedCount.current = -1; setLoadMoreRetryVersion(version => version + 1); }}>{loadMoreRetryLabel}</Button></>}</div>}</>}
      </ComboboxContent>
    </Combobox>
    {description && <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    {createError && <p id={`${id}-create-error`} role="alert" className="text-xs text-destructive">{createError}</p>}
  </div>;
}
