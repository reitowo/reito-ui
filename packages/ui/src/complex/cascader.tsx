import * as React from 'react';
import { Check, ChevronDown, ChevronRight, CircleAlert, LoaderCircle, RotateCcw, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Label } from '../primitives/label.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { cn } from '../lib/utils.js';

export interface CascaderOption {
  id: string;
  label: string;
  description?: React.ReactNode;
  disabled?: boolean;
  children?: CascaderOption[];
  loadable?: boolean;
}

export interface CascaderLoadContext { signal: AbortSignal }
export type CascaderSelectionBoundary = 'leaf' | 'any';
export type CascaderDisplayMode = 'label' | 'path';

export interface CascaderProps {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (path: string[] | undefined) => void;
  selectionBoundary?: CascaderSelectionBoundary;
  displayMode?: CascaderDisplayMode;
  loadChildren?: (option: CascaderOption, context: CascaderLoadContext) => Promise<CascaderOption[]>;
  refreshKey?: string | number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  loadError?: React.ReactNode;
  onRetry?: () => void;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  label?: string;
  placeholder?: string;
  emptyMessage?: React.ReactNode;
  loadingMessage?: React.ReactNode;
  retryLabel?: string;
  selectBranchLabel?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  name?: string;
  form?: string;
  id?: string;
  className?: string;
  renderOption?: (option: CascaderOption, state: { active: boolean; selected: boolean; depth: number }) => React.ReactNode;
}

interface LoadEntry {
  status: 'loading' | 'loaded' | 'error';
  children?: CascaderOption[];
  error?: unknown;
  request: number;
}

function optionText(value: React.ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

export function resolveCascaderPath(options: CascaderOption[], path: readonly string[] | undefined) {
  const resolved: CascaderOption[] = [];
  let level = options;
  for (const id of path ?? []) {
    const option = level.find(item => item.id === id);
    if (!option) break;
    resolved.push(option);
    level = option.children ?? [];
  }
  return resolved;
}

export function serializeCascaderPath(path: readonly string[] | undefined) {
  return path?.length ? JSON.stringify(path) : '';
}

/** Column-based selector for an arbitrary-depth option hierarchy. */
export function Cascader({
  options,
  value,
  defaultValue,
  onValueChange,
  selectionBoundary = 'leaf',
  displayMode = 'path',
  loadChildren,
  refreshKey,
  open,
  defaultOpen = false,
  onOpenChange,
  loading = false,
  loadError,
  onRetry,
  disabled = false,
  required = false,
  clearable = true,
  label = '级联选择',
  placeholder = '请选择',
  emptyMessage = '没有可用选项',
  loadingMessage = '正在加载选项',
  retryLabel = '重试',
  selectBranchLabel = '选择当前层级',
  description,
  error,
  name,
  form,
  id: suppliedId,
  className,
  renderOption,
}: CascaderProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? `cascader-${generatedId}`;
  const [internalValue, setInternalValue] = React.useState<string[] | undefined>(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [cursorPath, setCursorPath] = React.useState<string[]>(defaultValue ?? []);
  const [loads, setLoads] = React.useState<Map<string, LoadEntry>>(() => new Map());
  const requests = React.useRef(new Map<string, AbortController>());
  const requestCounter = React.useRef(0);
  const optionRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const selectedPath = value === undefined ? internalValue : value;
  const isOpen = open === undefined ? internalOpen : open;

  React.useEffect(() => () => requests.current.forEach(controller => controller.abort()), []);
  React.useEffect(() => {
    requests.current.forEach(controller => controller.abort());
    requests.current.clear();
    setLoads(new Map());
  }, [refreshKey]);

  const resolvedOptions = React.useMemo(() => {
    const merge = (items: CascaderOption[]): CascaderOption[] => items.map(option => {
      const loaded = loads.get(option.id);
      const children = loaded?.status === 'loaded' ? loaded.children : option.children;
      return children === undefined ? option : { ...option, children: merge(children) };
    });
    return merge(options);
  }, [loads, options]);

  const selectedOptions = React.useMemo(() => resolveCascaderPath(resolvedOptions, selectedPath), [resolvedOptions, selectedPath]);
  const normalizedCursor = React.useMemo(() => resolveCascaderPath(resolvedOptions, cursorPath).map(option => option.id), [cursorPath, resolvedOptions]);
  const columns = React.useMemo(() => {
    const result: CascaderOption[][] = [];
    let level = resolvedOptions;
    result.push(level);
    for (const id of normalizedCursor) {
      const option = level.find(item => item.id === id);
      if (!option?.children) break;
      level = option.children;
      result.push(level);
    }
    return result;
  }, [normalizedCursor, resolvedOptions]);
  const cursorOptions = React.useMemo(() => resolveCascaderPath(resolvedOptions, normalizedCursor), [normalizedCursor, resolvedOptions]);
  const currentOption = cursorOptions.at(-1);
  const currentLoad = currentOption ? loads.get(currentOption.id) : undefined;
  const currentIsBranch = Boolean(currentOption && (currentOption.loadable || currentOption.children !== undefined));
  const selectedText = selectedOptions.length
    ? displayMode === 'label' ? selectedOptions.at(-1)?.label : selectedOptions.map(option => option.label).join(' / ')
    : placeholder;
  const describedBy = [description ? `${id}-description` : undefined, error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;

  const setOpen = React.useCallback((next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    if (next) setCursorPath(selectedPath?.length ? [...selectedPath] : []);
    onOpenChange?.(next);
  }, [onOpenChange, open, selectedPath]);

  const emitValue = React.useCallback((next: string[] | undefined) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }, [onValueChange, value]);

  const focusOption = React.useCallback((optionId: string) => {
    requestAnimationFrame(() => optionRefs.current.get(optionId)?.focus());
  }, []);

  const ensureChildren = React.useCallback((option: CascaderOption) => {
    if (!loadChildren || !option.loadable || option.children !== undefined || loads.get(option.id)?.status === 'loading') return;
    requests.current.get(option.id)?.abort();
    const controller = new AbortController();
    const request = ++requestCounter.current;
    requests.current.set(option.id, controller);
    setLoads(current => new Map(current).set(option.id, { status: 'loading', request }));
    loadChildren(option, { signal: controller.signal }).then(children => {
      if (controller.signal.aborted) return;
      setLoads(current => {
        if (current.get(option.id)?.request !== request) return current;
        return new Map(current).set(option.id, { status: 'loaded', children, request });
      });
    }).catch(loadFailure => {
      if (controller.signal.aborted) return;
      setLoads(current => {
        if (current.get(option.id)?.request !== request) return current;
        return new Map(current).set(option.id, { status: 'error', error: loadFailure, request });
      });
    });
  }, [loadChildren, loads]);

  function select(path: string[]) {
    emitValue(path);
    setOpen(false);
  }

  function activate(option: CascaderOption, depth: number, focusChild = false) {
    if (disabled || option.disabled) return;
    const nextPath = [...normalizedCursor.slice(0, depth), option.id];
    setCursorPath(nextPath);
    const branch = option.loadable || option.children !== undefined;
    if (!branch) {
      select(nextPath);
      return;
    }
    ensureChildren(option);
    const first = option.children?.find(child => !child.disabled);
    if (focusChild && first) {
      setCursorPath([...nextPath, first.id]);
      focusOption(first.id);
    }
  }

  function move(depth: number, delta: number) {
    const enabled = (columns[depth] ?? []).filter(option => !option.disabled);
    if (!enabled.length) return;
    const currentId = normalizedCursor[depth];
    const index = enabled.findIndex(option => option.id === currentId);
    const next = enabled[Math.max(0, Math.min(enabled.length - 1, (index < 0 ? 0 : index) + delta))];
    setCursorPath([...normalizedCursor.slice(0, depth), next.id]);
    focusOption(next.id);
  }

  function handleKeyDown(event: React.KeyboardEvent, option: CascaderOption, depth: number) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); move(depth, event.key === 'ArrowDown' ? 1 : -1); return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const enabled = (columns[depth] ?? []).filter(item => !item.disabled);
      const next = event.key === 'Home' ? enabled[0] : enabled.at(-1);
      if (next) { setCursorPath([...normalizedCursor.slice(0, depth), next.id]); focusOption(next.id); }
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault(); activate(option, depth, true); return;
    }
    if (event.key === 'ArrowLeft' && depth > 0) {
      event.preventDefault();
      const parentId = normalizedCursor[depth - 1];
      setCursorPath(normalizedCursor.slice(0, depth));
      focusOption(parentId);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const branch = option.loadable || option.children !== undefined;
      if (!branch || selectionBoundary === 'any') select([...normalizedCursor.slice(0, depth), option.id]);
      else activate(option, depth, true);
    }
  }

  const currentPath = cursorOptions.map(option => option.id);
  const maySelectCurrentBranch = selectionBoundary === 'any' && currentOption && currentIsBranch && !currentOption.disabled;

  return <div data-slot="cascader" data-invalid={error ? true : undefined} className={cn('grid min-w-0 gap-[var(--rui-space-2)]', className)}>
    <Label htmlFor={`${id}-trigger`}>{label}</Label>
    <div className="flex min-w-0 gap-1">
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button id={`${id}-trigger`} type="button" role="combobox" aria-autocomplete="none" aria-haspopup="listbox" variant="outline" disabled={disabled} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className="min-w-0 flex-1 justify-between font-normal" />}>
          <span className={cn('truncate', !selectedOptions.length && 'text-muted-foreground')}>{selectedText}</span><ChevronDown aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent id={`${id}-popup`} align="start" className="w-max max-w-[calc(100vw-var(--rui-space-8))] gap-0 overflow-hidden p-0">
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          {loading ? <div role="status" className="flex min-w-64 items-center gap-2 p-[var(--rui-content-padding)] text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />{loadingMessage}</div>
            : loadError ? <div role="alert" className="grid min-w-64 gap-2 p-[var(--rui-content-padding)] text-sm text-destructive"><span className="flex items-center gap-2"><CircleAlert className="size-4" aria-hidden="true" />{loadError}</span>{onRetry && <Button type="button" variant="outline" size="sm" onClick={onRetry}><RotateCcw aria-hidden="true" />{retryLabel}</Button>}</div>
              : options.length === 0 ? <div className="min-w-64 p-[var(--rui-content-padding)] text-sm text-muted-foreground">{emptyMessage}</div>
                : <>
                  <div className="flex min-w-0 divide-x divide-border overflow-x-auto" data-slot="cascader-columns">
                    {columns.map((column, depth) => <ul key={depth} role="listbox" aria-label={`${label}，第 ${depth + 1} 级`} className="max-h-72 w-56 shrink-0 overflow-y-auto p-1">
                      {column.length ? column.map(option => {
                        const active = normalizedCursor[depth] === option.id;
                        const selected = selectedPath?.[depth] === option.id && selectedPath.length === depth + 1;
                        const branch = option.loadable || option.children !== undefined;
                        const load = loads.get(option.id);
                        return <li key={option.id} role="none">
                          <button ref={element => { if (element) optionRefs.current.set(option.id, element); else optionRefs.current.delete(option.id); }} type="button" role="option" aria-selected={active} aria-disabled={option.disabled || undefined} aria-busy={load?.status === 'loading' || undefined} data-cascader-option={option.id} tabIndex={active || (!normalizedCursor[depth] && column.find(item => !item.disabled)?.id === option.id) ? 0 : -1} disabled={option.disabled}
                            className="flex min-h-[var(--rui-control-height-xs)] w-full min-w-0 items-center gap-1 rounded-md px-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring data-[active=true]:bg-muted disabled:opacity-[var(--rui-opacity-disabled)]"
                            data-active={active || undefined} onMouseEnter={() => { if (!option.disabled) setCursorPath([...normalizedCursor.slice(0, depth), option.id]); }} onClick={() => activate(option, depth)} onKeyDown={event => handleKeyDown(event, option, depth)}>
                            {renderOption ? <span className="min-w-0 flex-1">{renderOption(option, { active, selected: Boolean(selected), depth })}</span> : <span className="min-w-0 flex-1"><span className="block truncate">{option.label}</span>{option.description && <span className="block truncate text-xs text-muted-foreground">{option.description}</span>}</span>}
                            {selected && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
                            {load?.status === 'loading' ? <LoaderCircle className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" /> : load?.status === 'error' ? <CircleAlert className="size-3.5 shrink-0 text-destructive" aria-hidden="true" /> : branch ? <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
                          </button>
                        </li>;
                      }) : <li role="none" className="p-2 text-sm text-muted-foreground">{emptyMessage}</li>}
                    </ul>)}
                  </div>
                  {(currentLoad?.status === 'loading' || currentLoad?.status === 'error' || maySelectCurrentBranch) && <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5 text-xs text-muted-foreground">
                    {currentLoad?.status === 'loading' ? <span role="status">{loadingMessage}</span> : currentLoad?.status === 'error' ? <span role="alert" className="text-destructive">{currentLoad.error instanceof Error ? currentLoad.error.message : '加载失败'}</span> : <span>{cursorOptions.map(item => optionText(item.label)).filter(Boolean).join(' / ')}</span>}
                    {currentLoad?.status === 'error' ? <Button type="button" variant="ghost" size="xs" onClick={() => { setLoads(current => { const next = new Map(current); next.delete(currentOption!.id); return next; }); ensureChildren(currentOption!); }}><RotateCcw aria-hidden="true" />{retryLabel}</Button> : maySelectCurrentBranch ? <Button type="button" variant="ghost" size="xs" onClick={() => select(currentPath)}>{selectBranchLabel}</Button> : null}
                  </div>}
                </>}
        </PopoverContent>
      </Popover>
      {clearable && selectedPath?.length ? <Button type="button" variant="outline" size="icon" aria-label="清除选择" disabled={disabled} onClick={() => emitValue(undefined)}><X aria-hidden="true" /></Button> : null}
    </div>
    {name && <input type="hidden" name={name} form={form} value={serializeCascaderPath(selectedPath)} disabled={disabled} />}
    {description && <p id={`${id}-description`} className="text-sm text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
