import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '../primitives/combobox.js';
import { Label } from '../primitives/label.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';

export interface AsyncComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface AsyncComboboxLoadContext { signal: AbortSignal }
export type AsyncComboboxLoader = (query: string, context: AsyncComboboxLoadContext) => Promise<AsyncComboboxOption[]>;
export type AsyncComboboxStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AsyncComboboxProps {
  label: string;
  loadOptions: AsyncComboboxLoader;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  initialOptions?: AsyncComboboxOption[];
  selectedOption?: AsyncComboboxOption | null;
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

/** Host-loaded single select with controlled query, cancellation and stale-result protection. */
export function AsyncCombobox({ label, loadOptions, value, defaultValue, onValueChange, query: controlledQuery, defaultQuery, onQueryChange, initialOptions = [], selectedOption, minQueryLength = 0, debounceMs = 200, name, placeholder = '输入关键词搜索…', idleMessage, loadingMessage = '正在查询…', emptyMessage = '没有匹配的选项', retryLabel = '重试', description, error, disabled = false, required = false, className, onLoadError }: AsyncComboboxProps) {
  const id = useId();
  const initialSelection = selectedOption ?? initialOptions.find(option => option.value === (value ?? defaultValue));
  const [internalQuery, setInternalQuery] = useState(defaultQuery ?? initialSelection?.label ?? '');
  const query = controlledQuery ?? internalQuery;
  const [options, setOptions] = useState(initialOptions);
  const [status, setStatus] = useState<AsyncComboboxStatus>(query.trim().length < minQueryLength ? 'idle' : initialOptions.length ? 'ready' : 'loading');
  const [loadError, setLoadError] = useState<string>();
  const [retryVersion, setRetryVersion] = useState(0);
  const requestId = useRef(0);
  const loaderRef = useRef(loadOptions);
  const errorRef = useRef(onLoadError);
  const cache = useRef(new Map<string, AsyncComboboxOption>());
  loaderRef.current = loadOptions;
  errorRef.current = onLoadError;
  for (const option of [...initialOptions, ...options, ...(selectedOption ? [selectedOption] : [])]) cache.current.set(option.value, option);

  function changeQuery(next: string) {
    if (controlledQuery === undefined) setInternalQuery(next);
    onQueryChange?.(next);
  }

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < minQueryLength) {
      requestId.current += 1;
      setStatus('idle');
      setLoadError(undefined);
      setOptions([]);
      return;
    }
    const currentRequest = ++requestId.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus('loading');
      setLoadError(undefined);
      setOptions([]);
      void loaderRef.current(query, { signal: controller.signal }).then(result => {
        if (controller.signal.aborted || requestId.current !== currentRequest) return;
        for (const option of result) cache.current.set(option.value, option);
        setOptions(result);
        setStatus('ready');
      }).catch(cause => {
        if (controller.signal.aborted || requestId.current !== currentRequest) return;
        setStatus('error');
        setLoadError(cause instanceof Error && cause.message ? cause.message : '查询失败');
        errorRef.current?.(cause, query);
      });
    }, Math.max(0, debounceMs));
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, minQueryLength, debounceMs, retryVersion]);

  const optionMap = useMemo(() => new Map(options.map(option => [option.value, option])), [options]);
  const items = useMemo(() => options.map(option => option.value), [options]);
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const resolvedIdle = idleMessage ?? `请输入至少 ${Math.max(1, minQueryLength)} 个字符`;

  return <div data-slot="async-combobox" data-status={status} className={cn('grid min-w-0 gap-2 text-sm', className)}>
    <Label htmlFor={id}>{label}</Label>
    <Combobox<string> items={items} filteredItems={items} filter={null} value={value} defaultValue={defaultValue} onValueChange={next => { const option = next ? optionMap.get(next) ?? cache.current.get(next) : undefined; if (option) cache.current.set(option.value, option); changeQuery(option?.label ?? ''); onValueChange?.(next); }} inputValue={query} onInputValueChange={(next, details) => { if (details.reason === 'input-change' || details.reason === 'input-clear' || details.reason === 'clear-press') changeQuery(next); }} itemToStringLabel={item => cache.current.get(item)?.label ?? item} disabled={disabled} name={name}>
      <ComboboxInput id={id} aria-label={label} placeholder={placeholder} showClear showTrigger={false} disabled={disabled} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} aria-busy={status === 'loading'} />
      <ComboboxContent>
        {status === 'idle' ? <p className="px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground">{resolvedIdle}</p> : status === 'loading' ? <div role="status" className="flex items-center gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground"><Spinner aria-hidden="true" />{loadingMessage}</div> : status === 'error' ? <div className="grid gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]"><p role="alert" className="flex items-start gap-[var(--rui-space-2)] text-sm text-destructive"><AlertCircle aria-hidden="true" className="mt-[var(--rui-space-1)] size-3 shrink-0" />{loadError}</p><Button type="button" variant="outline" size="xs" className="justify-self-start" onClick={() => setRetryVersion(version => version + 1)}><RotateCcw aria-hidden="true" />{retryLabel}</Button></div> : <><ComboboxEmpty>{emptyMessage}</ComboboxEmpty><ComboboxList>{(item: string) => { const option = optionMap.get(item); return <ComboboxItem key={item} value={item} disabled={option?.disabled}><span className="min-w-0"><span className="block truncate">{option?.label ?? item}</span>{option?.description && <span className="block truncate text-xs text-muted-foreground">{option.description}</span>}</span></ComboboxItem>; }}</ComboboxList></>}
      </ComboboxContent>
    </Combobox>
    {description && <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}
