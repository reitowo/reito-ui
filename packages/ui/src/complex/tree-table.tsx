import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Columns3, LoaderCircle, RotateCcw, Search } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Input } from '../primitives/input.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { cx } from './shared.js';

export interface TreeTableNode<TData> {
  id: string;
  data: TData;
  children?: TreeTableNode<TData>[];
  disabled?: boolean;
  /** Marks a branch whose children can be requested when it is first expanded. */
  loadable?: boolean;
}

export interface TreeTableColumn<TData> {
  id: string;
  header: ReactNode;
  cell: (node: TreeTableNode<TData>) => ReactNode;
  label?: string;
  /** Raw value used by global and column filters. Defaults to data[column.id]. */
  filterValue?: (node: TreeTableNode<TData>) => unknown;
  filterable?: boolean;
  hideable?: boolean;
  className?: string;
}

export type TreeTableSelectionMode = 'none' | 'single' | 'checkbox';
export type TreeTableCheckPropagation = 'cascade' | 'independent';
export type TreeTableFilterMode = 'ancestors' | 'subtree';
export type TreeTableColumnFilters = Record<string, string>;
export type TreeTableColumnVisibility = Record<string, boolean>;

export interface TreeTableProps<TData> {
  nodes: TreeTableNode<TData>[];
  columns: TreeTableColumn<TData>[];
  caption?: string;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectionMode?: TreeTableSelectionMode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  checked?: string[];
  defaultChecked?: string[];
  onCheckedChange?: (ids: string[]) => void;
  checkPropagation?: TreeTableCheckPropagation;
  searchable?: boolean;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  filterable?: boolean;
  columnFilters?: TreeTableColumnFilters;
  defaultColumnFilters?: TreeTableColumnFilters;
  onColumnFiltersChange?: (filters: TreeTableColumnFilters) => void;
  filterMode?: TreeTableFilterMode;
  columnManager?: boolean;
  columnVisibility?: TreeTableColumnVisibility;
  defaultColumnVisibility?: TreeTableColumnVisibility;
  onColumnVisibilityChange?: (visibility: TreeTableColumnVisibility) => void;
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  loadChildren?: (node: TreeTableNode<TData>, context: { signal: AbortSignal }) => Promise<TreeTableNode<TData>[]>;
  /** Change this key to discard resolved lazy children and abort pending requests. */
  refreshKey?: string | number;
  loading?: boolean;
  loadingMessage?: ReactNode;
  error?: ReactNode;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
  className?: string;
}

interface FlatNode<TData> {
  node: TreeTableNode<TData>;
  parentId?: string;
  level: number;
  posInSet: number;
  setSize: number;
}

type CheckState = boolean | 'mixed';
type LoadState = 'loading' | 'error';

function fallbackFilterValue<TData>(node: TreeTableNode<TData>, columnId: string) {
  if (!node.data || typeof node.data !== 'object') return node.data;
  return (node.data as Record<string, unknown>)[columnId];
}

/** Compact row-focused treegrid with stable hierarchical selection state. */
export function TreeTable<TData>({
  nodes,
  columns,
  caption = '层级数据',
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  selectionMode = 'none',
  value,
  defaultValue,
  onValueChange,
  checked,
  defaultChecked = [],
  onCheckedChange,
  checkPropagation = 'cascade',
  searchable = false,
  query,
  defaultQuery = '',
  onQueryChange,
  filterable = false,
  columnFilters,
  defaultColumnFilters = {},
  onColumnFiltersChange,
  filterMode = 'ancestors',
  columnManager = false,
  columnVisibility,
  defaultColumnVisibility = {},
  onColumnVisibilityChange,
  page,
  defaultPage = 0,
  pageSize,
  onPageChange,
  loadChildren,
  refreshKey,
  loading = false,
  loadingMessage = '正在加载层级数据…',
  error,
  onRetry,
  emptyMessage = '没有层级数据',
  className,
}: TreeTableProps<TData>) {
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpanded));
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalChecked, setInternalChecked] = useState(() => new Set(defaultChecked));
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const [internalFilters, setInternalFilters] = useState<TreeTableColumnFilters>(defaultColumnFilters);
  const [internalVisibility, setInternalVisibility] = useState<TreeTableColumnVisibility>(defaultColumnVisibility);
  const [internalPage, setInternalPage] = useState(defaultPage);
  const [loadedChildren, setLoadedChildren] = useState(() => new Map<string, TreeTableNode<TData>[]>());
  const [loadStates, setLoadStates] = useState(() => new Map<string, LoadState>());
  const [loadErrors, setLoadErrors] = useState(() => new Map<string, string>());
  const requests = useRef(new Map<string, { id: number; controller: AbortController }>());
  const requestId = useRef(0);
  const open = expanded === undefined ? internalExpanded : new Set(expanded);
  const selected = value === undefined ? internalValue : value;
  const currentQuery = query === undefined ? internalQuery : query;
  const currentFilters = columnFilters === undefined ? internalFilters : columnFilters;
  const currentVisibility = columnVisibility === undefined ? internalVisibility : columnVisibility;
  const currentPage = page === undefined ? internalPage : page;

  const resolvedNodes = useMemo(() => {
    const resolve = (items: TreeTableNode<TData>[]): TreeTableNode<TData>[] => items.map(node => {
      const lazyChildren = loadedChildren.get(node.id);
      const children = lazyChildren ?? node.children;
      return children === undefined ? node : { ...node, children: resolve(children), loadable: lazyChildren?.length === 0 ? false : node.loadable };
    });
    return resolve(nodes);
  }, [loadedChildren, nodes]);

  const all = useMemo(() => {
    const map = new Map<string, { node: TreeTableNode<TData>; parentId?: string }>();
    const visit = (items: TreeTableNode<TData>[], parentId?: string) => items.forEach(node => {
      map.set(node.id, { node, parentId });
      if (node.children) visit(node.children, node.id);
    });
    visit(resolvedNodes);
    return map;
  }, [resolvedNodes]);

  const columnValue = useCallback((node: TreeTableNode<TData>, column: TreeTableColumn<TData>) => column.filterValue?.(node) ?? fallbackFilterValue(node, column.id), []);
  const hasFilters = Boolean(currentQuery.trim()) || Object.values(currentFilters).some(filter => filter.trim());
  const filteredNodes = useMemo(() => {
    if (!hasFilters) return resolvedNodes;
    const globalNeedle = currentQuery.trim().toLocaleLowerCase();
    const activeFilters = Object.entries(currentFilters).filter(([, filter]) => filter.trim());
    const selfMatches = (node: TreeTableNode<TData>) => {
      const globalMatch = !globalNeedle || columns.some(column => String(columnValue(node, column) ?? '').toLocaleLowerCase().includes(globalNeedle));
      return globalMatch && activeFilters.every(([id, filter]) => {
        const column = columns.find(candidate => candidate.id === id);
        return !column || String(columnValue(node, column) ?? '').toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase());
      });
    };
    const project = (node: TreeTableNode<TData>): TreeTableNode<TData> | undefined => {
      const ownMatch = selfMatches(node);
      if (ownMatch && filterMode === 'subtree') return node;
      const children = node.children?.map(project).filter((child): child is TreeTableNode<TData> => Boolean(child));
      if (!ownMatch && !children?.length) return undefined;
      return { ...node, children: children ?? [] };
    };
    return resolvedNodes.map(project).filter((node): node is TreeTableNode<TData> => Boolean(node));
  }, [columnValue, columns, currentFilters, currentQuery, filterMode, hasFilters, resolvedNodes]);
  const pageCount = pageSize ? Math.max(1, Math.ceil(filteredNodes.length / pageSize)) : 1;
  const safePage = Math.min(Math.max(0, currentPage), pageCount - 1);
  const pagedNodes = pageSize ? filteredNodes.slice(safePage * pageSize, (safePage + 1) * pageSize) : filteredNodes;
  const visibleColumns = columns.filter((column, index) => index === 0 || currentVisibility[column.id] !== false);

  const visible = useMemo(() => {
    const result: FlatNode<TData>[] = [];
    const visit = (items: TreeTableNode<TData>[], level: number, parentId?: string) => items.forEach((node, index) => {
      result.push({ node, parentId, level, posInSet: index + 1, setSize: items.length });
      if (node.children && (hasFilters || open.has(node.id))) visit(node.children, level + 1, node.id);
    });
    visit(pagedNodes, 1);
    return result;
  }, [hasFilters, open, pagedNodes]);

  function setPage(next: number) {
    const bounded = Math.min(Math.max(0, next), pageCount - 1);
    if (page === undefined) setInternalPage(bounded);
    onPageChange?.(bounded);
  }
  const setQuery = (next: string) => {
    if (query === undefined) setInternalQuery(next);
    onQueryChange?.(next);
    setPage(0);
  };
  const setFilters = (next: TreeTableColumnFilters) => {
    if (columnFilters === undefined) setInternalFilters(next);
    onColumnFiltersChange?.(next);
    setPage(0);
  };
  const setVisibility = (next: TreeTableColumnVisibility) => {
    if (columnVisibility === undefined) setInternalVisibility(next);
    onColumnVisibilityChange?.(next);
  };

  const loadNode = useCallback(async (node: TreeTableNode<TData>) => {
    if (!loadChildren || !node.loadable || loadedChildren.has(node.id)) return;
    requests.current.get(node.id)?.controller.abort();
    const controller = new AbortController();
    const id = ++requestId.current;
    requests.current.set(node.id, { id, controller });
    setLoadStates(previous => new Map(previous).set(node.id, 'loading'));
    setLoadErrors(previous => { const next = new Map(previous); next.delete(node.id); return next; });
    try {
      const children = await loadChildren(node, { signal: controller.signal });
      if (controller.signal.aborted || requests.current.get(node.id)?.id !== id) return;
      setLoadedChildren(previous => new Map(previous).set(node.id, children));
      setLoadStates(previous => { const next = new Map(previous); next.delete(node.id); return next; });
    } catch (caught) {
      if (controller.signal.aborted || requests.current.get(node.id)?.id !== id) return;
      setLoadStates(previous => new Map(previous).set(node.id, 'error'));
      setLoadErrors(previous => new Map(previous).set(node.id, caught instanceof Error ? caught.message : '子节点加载失败'));
    } finally {
      if (requests.current.get(node.id)?.id === id) requests.current.delete(node.id);
    }
  }, [loadChildren, loadedChildren]);

  useEffect(() => {
    for (const request of requests.current.values()) request.controller.abort();
    requests.current.clear();
    setLoadedChildren(new Map());
    setLoadStates(new Map());
    setLoadErrors(new Map());
  }, [refreshKey]);
  useEffect(() => () => { for (const request of requests.current.values()) request.controller.abort(); }, []);

  const mutableDescendants = useCallback((id: string) => {
    const result: string[] = [];
    const visit = (node: TreeTableNode<TData>) => node.children?.forEach(child => {
      if (child.disabled) return;
      result.push(child.id);
      visit(child);
    });
    const entry = all.get(id);
    if (entry) visit(entry.node);
    return result;
  }, [all]);

  const normalizeChecked = useCallback((source: Iterable<string>) => {
    const original = new Set([...source].filter(id => all.has(id)));
    const next = new Set(original);
    if (checkPropagation === 'independent') return next;
    for (const id of original) if (!all.get(id)?.node.disabled) for (const childId of mutableDescendants(id)) next.add(childId);
    for (const [id, entry] of [...all].reverse()) {
      if (entry.node.disabled) continue;
      const children = entry.node.children?.filter(child => !child.disabled) ?? [];
      if (!children.length) continue;
      if (children.every(child => next.has(child.id))) next.add(id);
      else if (!original.has(id)) next.delete(id);
    }
    return next;
  }, [all, checkPropagation, mutableDescendants]);

  const rawChecked = checked === undefined ? internalChecked : new Set(checked);
  const normalizedChecked = normalizeChecked(rawChecked);
  const checkState = useCallback((id: string): CheckState => {
    if (normalizedChecked.has(id)) return true;
    if (checkPropagation === 'cascade' && mutableDescendants(id).some(childId => normalizedChecked.has(childId))) return 'mixed';
    return false;
  }, [checkPropagation, mutableDescendants, normalizedChecked]);

  const [activeId, setActiveId] = useState(() => selected && all.has(selected) ? selected : visible[0]?.node.id);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const focusOwned = useRef(false);

  const updateExpanded = (next: Set<string>) => {
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.([...all.keys()].filter(id => next.has(id)));
  };
  const toggleExpanded = (node: TreeTableNode<TData>, next?: boolean) => {
    const id = node.id;
    const updated = new Set(open);
    if (next ?? !updated.has(id)) {
      updated.add(id);
      void loadNode(node);
    } else {
      updated.delete(id);
      requests.current.get(id)?.controller.abort();
      requests.current.delete(id);
      setLoadStates(previous => { const nextStates = new Map(previous); nextStates.delete(id); return nextStates; });
    }
    updateExpanded(updated);
  };
  const choose = (node: TreeTableNode<TData>) => {
    if (node.disabled || selectionMode !== 'single') return;
    if (value === undefined) setInternalValue(node.id);
    onValueChange?.(node.id);
  };
  const emitChecked = (next: Set<string>) => {
    const normalized = normalizeChecked(next);
    if (checked === undefined) setInternalChecked(normalized);
    onCheckedChange?.([...all.keys()].filter(id => normalized.has(id)));
  };
  const toggleChecked = (node: TreeTableNode<TData>) => {
    if (node.disabled || selectionMode !== 'checkbox') return;
    const next = new Set(normalizedChecked);
    const shouldCheck = checkState(node.id) !== true;
    const ids = checkPropagation === 'cascade' ? [node.id, ...mutableDescendants(node.id)] : [node.id];
    for (const id of ids) if (shouldCheck) next.add(id); else next.delete(id);
    if (!shouldCheck && checkPropagation === 'cascade') {
      let parentId = all.get(node.id)?.parentId;
      while (parentId) { next.delete(parentId); parentId = all.get(parentId)?.parentId; }
    }
    emitChecked(next);
  };
  const toggleAll = () => {
    const enabled = [...all.values()].map(entry => entry.node).filter(node => !node.disabled);
    const shouldCheck = !enabled.every(node => normalizedChecked.has(node.id));
    emitChecked(new Set(shouldCheck ? enabled.map(node => node.id) : []));
  };
  const focus = useCallback((id: string | undefined) => {
    if (!id) return;
    setActiveId(id);
    requestAnimationFrame(() => rowRefs.current.get(id)?.focus());
  }, []);

  useLayoutEffect(() => {
    if (activeId && visible.some(item => item.node.id === activeId)) return;
    let candidate = activeId ? all.get(activeId)?.parentId : undefined;
    while (candidate && !visible.some(item => item.node.id === candidate)) candidate = all.get(candidate)?.parentId;
    candidate ??= selected && visible.some(item => item.node.id === selected) ? selected : visible[0]?.node.id;
    setActiveId(candidate);
    if (focusOwned.current) focus(candidate);
  }, [activeId, all, focus, selected, visible]);

  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>, item: FlatNode<TData>) {
    const index = visible.findIndex(entry => entry.node.id === item.node.id);
    const branch = Boolean(item.node.children?.length || item.node.loadable);
    let target: string | undefined;
    if (event.key === 'ArrowDown') target = visible[Math.min(visible.length - 1, index + 1)]?.node.id;
    else if (event.key === 'ArrowUp') target = visible[Math.max(0, index - 1)]?.node.id;
    else if (event.key === 'Home') target = visible[0]?.node.id;
    else if (event.key === 'End') target = visible.at(-1)?.node.id;
    else if (event.key === 'ArrowRight' && branch) {
      if (!open.has(item.node.id)) toggleExpanded(item.node, true);
      else target = item.node.children?.find(child => !child.disabled)?.id ?? item.node.children?.[0]?.id;
    } else if (event.key === 'ArrowLeft') {
      if (branch && open.has(item.node.id)) toggleExpanded(item.node, false); else target = item.parentId;
    } else if (event.key === 'Enter') choose(item.node);
    else if (event.key === ' ' && selectionMode === 'checkbox') toggleChecked(item.node);
    else return;
    event.preventDefault();
    if (target) focus(target);
  }

  const allEnabled = [...all.values()].map(entry => entry.node).filter(node => !node.disabled);
  const allChecked = allEnabled.length > 0 && allEnabled.every(node => normalizedChecked.has(node.id));
  const someChecked = !allChecked && allEnabled.some(node => normalizedChecked.has(node.id));
  const columnCount = visibleColumns.length + Number(selectionMode === 'checkbox');

  return <div data-slot="tree-table" className={cx('min-w-0 overflow-hidden rounded-lg border border-border', className)}>
    {(searchable || columnManager) && <div className="flex min-w-0 items-center gap-[var(--rui-content-gap-sm)] border-b border-border p-[var(--rui-cell-padding-x)]">
      {searchable && <label className="relative min-w-0 flex-1">
        <span className="sr-only">搜索层级数据</span>
        <Search aria-hidden="true" className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={currentQuery} onChange={event => setQuery(event.target.value)} className="h-[var(--rui-control-height-sm)] ps-8 text-sm" placeholder="搜索层级数据…" />
      </label>}
      {columnManager && <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" size="sm"><Columns3 aria-hidden="true" />列</Button>} />
        <PopoverContent align="end" className="w-56">
          <PopoverTitle>显示列</PopoverTitle>
          <div className="grid gap-1">{columns.map((column, index) => {
            const isVisible = currentVisibility[column.id] !== false;
            const label = column.label ?? (typeof column.header === 'string' ? column.header : column.id);
            return <label key={column.id} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/50">
              <Checkbox checked={isVisible} disabled={index === 0 || column.hideable === false || (isVisible && visibleColumns.length === 1)} onCheckedChange={() => setVisibility({ ...currentVisibility, [column.id]: !isVisible })} />
              <span className="min-w-0 truncate">{label}</span>
            </label>;
          })}</div>
          <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => setVisibility({})}>重置列</Button>
        </PopoverContent>
      </Popover>}
    </div>}
    <div className="overflow-auto">
      <table role="treegrid" aria-label={caption} aria-multiselectable={selectionMode === 'checkbox' || undefined} className="w-full min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/40 text-muted-foreground"><tr>
          {selectionMode === 'checkbox' && <th scope="col" className="w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)]"><Checkbox aria-label="选择全部层级行" checked={allChecked} indeterminate={someChecked} disabled={loading || Boolean(error) || !allEnabled.length} onCheckedChange={toggleAll} /></th>}
          {visibleColumns.map(column => <th key={column.id} scope="col" className={cx('whitespace-nowrap px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] font-medium', column.className)}>{column.header}</th>)}
        </tr>{filterable && <tr className="border-t border-border">
          {selectionMode === 'checkbox' && <th aria-hidden="true" />}
          {visibleColumns.map(column => {
            const label = column.label ?? (typeof column.header === 'string' ? column.header : column.id);
            return <th key={column.id} className="px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] font-normal">
              {column.filterable === false ? null : <Input aria-label={'筛选' + label} value={currentFilters[column.id] ?? ''} onChange={event => setFilters({ ...currentFilters, [column.id]: event.target.value })} className="h-[var(--rui-control-height-sm)] min-w-24 text-xs" placeholder="筛选…" />}
            </th>;
          })}
        </tr>}</thead>
        <tbody>{loading ? <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground"><span role="status">{loadingMessage}</span></td></tr>
          : error ? <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-destructive"><div role="alert">{error}</div>{onRetry && <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onRetry}><RotateCcw aria-hidden="true" />重试</Button>}</td></tr>
            : visible.length ? visible.map(item => {
              const { node } = item;
              const branch = Boolean(node.children?.length || node.loadable);
              const isOpen = branch && open.has(node.id);
              const state = checkState(node.id);
              const loadState = loadStates.get(node.id);
              const isSelected = selectionMode === 'single' ? selected === node.id : selectionMode === 'checkbox' ? state === true : false;
              return <tr key={node.id} ref={element => { if (element) rowRefs.current.set(node.id, element); else rowRefs.current.delete(node.id); }} role="row" tabIndex={activeId === node.id ? 0 : -1} aria-level={item.level} aria-posinset={item.posInSet} aria-setsize={item.setSize} aria-expanded={branch ? isOpen : undefined} aria-selected={selectionMode !== 'none' ? isSelected : undefined} aria-disabled={node.disabled || undefined} aria-busy={loadState === 'loading' || undefined} data-row-id={node.id} data-selected={isSelected || undefined}
                className="group border-t border-border outline-none hover:bg-muted/30 focus-visible:ring-inset focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring data-selected:bg-muted/60 aria-disabled:opacity-[var(--rui-opacity-disabled)]"
                onFocus={() => { focusOwned.current = true; setActiveId(node.id); }} onKeyDown={event => handleKeyDown(event, item)} onClick={event => { if (!(event.target as HTMLElement).closest('button,[role=checkbox]')) { focus(node.id); choose(node); } }}>
                {selectionMode === 'checkbox' && <td className="w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]"><Checkbox tabIndex={-1} aria-label={`选择层级行 ${node.id}`} checked={state === true} indeterminate={state === 'mixed'} disabled={node.disabled} onCheckedChange={() => toggleChecked(node)} /></td>}
                {visibleColumns.map((column, columnIndex) => <td key={column.id} className={cx('max-w-sm px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] align-middle', column.className)}>
                  {columnIndex === 0 ? <div className="flex min-w-0 items-center gap-1 whitespace-nowrap" style={item.level > 1 ? { paddingInlineStart: `calc(var(--rui-space-3) * ${item.level - 1})` } : undefined}>
                    {branch ? <Button type="button" variant="ghost" size="icon-xs" tabIndex={-1} className="size-[var(--rui-table-expander-size)]" aria-label={`${isOpen ? '折叠' : '展开'}层级行 ${node.id}`} aria-expanded={isOpen} onClick={() => { toggleExpanded(node); focus(node.id); }}>{loadState === 'loading' ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <ChevronRight aria-hidden="true" className={cx('transition-transform', isOpen && 'rotate-90')} />}</Button> : <span className="size-[var(--rui-table-expander-size)] shrink-0" aria-hidden="true" />}
                    <span className="min-w-0 truncate">{column.cell(node)}</span>
                    {loadState === 'error' && <span className="ms-1 inline-flex items-center gap-1 text-xs text-destructive" role="alert"><span className="max-w-40 truncate">{loadErrors.get(node.id)}</span><Button type="button" variant="ghost" size="xs" tabIndex={-1} onClick={() => void loadNode(node)}><RotateCcw aria-hidden="true" />重试</Button></span>}
                  </div> : column.cell(node)}
                </td>)}
              </tr>;
            }) : <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground">{hasFilters ? '没有匹配的层级数据' : emptyMessage}</td></tr>}</tbody>
      </table>
    </div>
    {(selectionMode === 'checkbox' || pageSize) && !loading && !error && <div className="flex items-center justify-between gap-2 border-t border-border px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] text-xs text-muted-foreground" aria-live="polite">
      <span>{selectionMode === 'checkbox' ? `已选择 ${normalizedChecked.size} / ${allEnabled.length} 行` : `${filteredNodes.length} 个根节点`}</span>
      {pageSize && <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon-xs" aria-label="上一页" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft aria-hidden="true" /></Button>
        <span>第 {safePage + 1} / {pageCount} 页</span>
        <Button type="button" variant="ghost" size="icon-xs" aria-label="下一页" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}><ChevronRight aria-hidden="true" /></Button>
      </div>}
    </div>}
  </div>;
}
