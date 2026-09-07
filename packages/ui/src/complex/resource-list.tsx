import { useMemo, useRef, useState, type ReactNode } from 'react';
import { File, Search } from 'lucide-react';
import { Badge } from '../primitives/badge.js';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Input } from '../primitives/input.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';
import { VirtualList, type VirtualListRange } from './virtual-list.js';
import { cx } from './shared.js';

export interface ResourceItem {
  id: string;
  name: string;
  description?: string;
  kind?: string;
  /** An ISO date string used for chronological sorting. Invalid/missing dates sort last. */
  updatedAt?: string;
  disabled?: boolean;
  icon?: ReactNode;
}
export interface ResourceAction { id: string; label: string; onAction: (item: ResourceItem) => void; isDisabled?: (item: ResourceItem) => boolean; }
export type ResourceSort = 'name-asc' | 'name-desc' | 'updated-desc';
export interface ResourceListProps {
  items: ResourceItem[];
  label?: string;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  sort?: ResourceSort;
  onSortChange?: (sort: ResourceSort) => void;
  /** Local mode filters and sorts items. Remote mode preserves the host-provided window order. */
  dataMode?: 'local' | 'remote';
  /** Total matches for the current remote query. Defaults to the loaded item count. */
  totalCount?: number;
  /** Render the loaded result window through VirtualList. */
  virtualized?: boolean;
  overscan?: number;
  viewportClassName?: string;
  onVisibleRangeChange?: (range: VirtualListRange) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMoreError?: string;
  loadMoreMode?: 'manual' | 'automatic';
  loadMoreThreshold?: number;
  onLoadMore?: () => void;
  actions?: ResourceAction[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  disabled?: boolean;
  /** Hide the search, sort and selection summary when a parent collection surface supplies them. */
  showControls?: boolean;
  className?: string;
}

const sortOptions = [
  { value: 'name-asc', label: '名称 A → Z' },
  { value: 'name-desc', label: '名称 Z → A' },
  { value: 'updated-desc', label: '最近更新' },
];
function dateValue(value?: string) { const parsed = value ? Date.parse(value) : NaN; return Number.isFinite(parsed) ? parsed : -Infinity; }

export function projectResourceItems(items: ResourceItem[], query: string, sort: ResourceSort) {
  const result = items.filter(item => `${item.name} ${item.description ?? ''} ${item.kind ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  return result.sort((a, b) => {
    if (sort === 'updated-desc') {
      const difference = dateValue(b.updatedAt) - dateValue(a.updatedAt);
      if (!Number.isNaN(difference) && difference !== 0) return difference;
    }
    return sort === 'name-desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
  });
}

interface ResourceRowProps {
  item: ResourceItem;
  selectionMode: NonNullable<ResourceListProps['selectionMode']>;
  selected: boolean;
  locked: boolean;
  actions: ResourceAction[];
  onToggle: () => void;
}

function ResourceRow({ item, selectionMode, selected, locked, actions, onToggle }: ResourceRowProps) {
  return <>
    {selectionMode === 'multiple' && <Checkbox aria-label={`选择 ${item.name}`} checked={selected} disabled={locked || item.disabled} onCheckedChange={onToggle} />}
    <span aria-hidden="true" className="shrink-0 text-muted-foreground [&_svg]:size-4">{item.icon ?? <File />}</span>
    <div className="min-w-0 flex-1">
      {selectionMode === 'single' ? <button type="button" aria-label={`选择 ${item.name}`} aria-pressed={selected} disabled={locked || item.disabled} onClick={onToggle}
        className="max-w-full rounded text-left font-medium whitespace-normal break-all outline-none hover:underline focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring disabled:cursor-not-allowed">{item.name}</button>
        : <p className="break-all font-medium">{item.name}</p>}
      {item.description && <p className="mt-0.5 break-words text-xs text-muted-foreground">{item.description}</p>}
      {item.disabled && <p className="mt-0.5 text-xs text-muted-foreground">此资源不可操作</p>}
    </div>
    {item.kind && <Badge variant="secondary">{item.kind}</Badge>}
    {actions.length > 0 && <div role="group" aria-label={`${item.name}操作`} className="flex flex-wrap gap-1">
      {actions.map(action => <Button key={action.id} size="sm" variant="ghost" aria-label={`${action.label} ${item.name}`} disabled={locked || item.disabled || action.isDisabled?.(item)} onClick={() => action.onAction(item)}>{action.label}</Button>)}
    </div>}
  </>;
}

/** A local or incrementally loaded resource collection. Stable IDs preserve selection across query and virtual windows. */
export function ResourceList({
  items, label = '资源', selectionMode = 'single', selectedIds, onSelectionChange,
  query, onQueryChange, sort, onSortChange, dataMode = 'local', totalCount,
  virtualized = false, overscan = 4, viewportClassName, onVisibleRangeChange,
  hasMore = false, loadingMore = false, loadMoreError, loadMoreMode = 'manual', loadMoreThreshold = 3, onLoadMore,
  actions = [], loading = false, error, onRetry, emptyMessage = '没有资源', disabled = false, showControls = true, className,
}: ResourceListProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [internalSort, setInternalSort] = useState<ResourceSort>('name-asc');
  const [internalSelection, setInternalSelection] = useState<string[]>([]);
  const autoLoadKey = useRef('');
  const search = query ?? internalQuery;
  const activeSort = sort ?? internalSort;
  const requestedSelection = selectedIds ?? internalSelection;
  const selection = selectionMode === 'none' ? [] : selectionMode === 'single' ? requestedSelection.slice(0, 1) : requestedSelection;
  const locked = disabled || loading;
  const visible = useMemo(() => {
    if (dataMode === 'remote') return items;
    return projectResourceItems(items, search, activeSort);
  }, [activeSort, dataMode, items, search]);
  const selectable = visible.filter(item => !item.disabled);
  const allSelected = selectable.length > 0 && selectable.every(item => selection.includes(item.id));
  const someSelected = selectable.some(item => selection.includes(item.id));
  const selectedCount = selection.length;
  const normalizedTotal = Math.max(visible.length, Math.floor(Number.isFinite(totalCount) ? Number(totalCount) : items.length));
  const loadKey = `${search}\u0000${activeSort}\u0000${visible.length}`;

  function changeSelection(ids: string[]) {
    if (selectedIds === undefined) setInternalSelection(ids);
    onSelectionChange?.(ids);
  }

  function toggle(id: string) {
    if (selectionMode === 'single') changeSelection(selection.includes(id) ? [] : [id]);
    else changeSelection(selection.includes(id) ? selection.filter(value => value !== id) : [...selection, id]);
  }

  function requestMore() {
    if (!hasMore || loadingMore || disabled || !onLoadMore) return;
    onLoadMore();
  }

  function handleRangeChange(range: VirtualListRange) {
    onVisibleRangeChange?.(range);
    const threshold = Math.max(0, Math.floor(Number.isFinite(loadMoreThreshold) ? loadMoreThreshold : 0));
    if (loadMoreMode === 'automatic' && range.endIndex >= visible.length - 1 - threshold && autoLoadKey.current !== loadKey) {
      autoLoadKey.current = loadKey;
      requestMore();
    }
  }

  const row = (item: ResourceItem) => <ResourceRow item={item} selectionMode={selectionMode} selected={selection.includes(item.id)} locked={locked} actions={actions} onToggle={() => toggle(item.id)} />;

  return <section aria-label={label} aria-busy={loading || loadingMore} data-slot="resource-list" className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    {showControls && <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
      <div className="relative min-w-40 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label={`搜索${label}`} placeholder="搜索名称、类型或说明…" value={search} disabled={locked} className="pl-9" onChange={event => {
          autoLoadKey.current = '';
          if (query === undefined) setInternalQuery(event.target.value);
          onQueryChange?.(event.target.value);
        }} />
      </div>
      <Select items={sortOptions} value={activeSort} disabled={locked} onValueChange={next => {
        if (next === 'name-asc' || next === 'name-desc' || next === 'updated-desc') {
          autoLoadKey.current = '';
          if (sort === undefined) setInternalSort(next);
          onSortChange?.(next);
        }
      }}>
        <SelectTrigger size="sm" aria-label="资源排序"><SelectValue /></SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>}
    {showControls && <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      {selectionMode === 'multiple' && <div className="flex items-center gap-2 text-xs">
        <Checkbox aria-label={`选择${dataMode === 'remote' ? '已加载结果' : '筛选结果'}`} checked={allSelected} indeterminate={!allSelected && someSelected} disabled={locked || !selectable.length} onCheckedChange={() => {
          const shouldSelect = !allSelected;
          const next = new Set(selection);
          for (const item of selectable) { if (shouldSelect) next.add(item.id); else next.delete(item.id); }
          changeSelection([...next]);
        }} /><span>选择{dataMode === 'remote' ? '已加载结果' : '筛选结果'}</span>
      </div>}
      <p role="status" className="text-xs text-muted-foreground">{dataMode === 'remote' ? `已加载 ${visible.length} / ${normalizedTotal} 项` : `显示 ${visible.length} / ${items.length} 项`}{selectionMode !== 'none' && ` · 已选择 ${selectedCount} 项`}</p>
      {selectionMode !== 'none' && selectedCount > 0 && <Button variant="ghost" size="sm" disabled={locked} onClick={() => changeSelection([])}>清除选择</Button>}
    </div>}
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)] text-destructive"><p>{error}</p>{onRetry && <Button variant="outline" size="sm" onClick={onRetry}>重试加载资源</Button>}</div>}
    {loading ? <p className="p-[var(--rui-content-padding)] text-muted-foreground">正在加载资源…</p>
      : !visible.length ? <p className="p-[var(--rui-content-padding)] text-muted-foreground">{search ? '没有匹配的资源' : emptyMessage}</p>
        : virtualized ? <VirtualList count={visible.length} getItem={index => visible[index]} getItemKey={index => visible[index]?.id ?? index}
          renderItem={item => <div data-resource-id={item.id} data-selected={selection.includes(item.id) || undefined} className="flex w-full min-w-0 self-stretch items-center gap-[var(--rui-content-gap-sm)] data-selected:bg-muted/40">{row(item)}</div>}
          label={`${label}列表`} overscan={overscan} dynamic viewportClassName={viewportClassName} onRangeChange={handleRangeChange} />
          : <ul aria-label={`${label}列表`} className="divide-y divide-border rounded-lg border border-border">
            {visible.map(item => <li key={item.id} data-resource-id={item.id} data-selected={selection.includes(item.id) || undefined}
              className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] data-selected:bg-muted/40">{row(item)}</li>)}
          </ul>}
    {!error && visible.length > 0 && (hasMore || loadingMore || loadMoreError) && <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)] border-t border-border pt-[var(--rui-content-gap-sm)]">
      <p role={loadMoreError ? 'alert' : 'status'} className={loadMoreError ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
        {loadMoreError ?? (loadingMore ? '正在加载更多资源…' : hasMore ? `还有 ${Math.max(0, normalizedTotal - visible.length)} 项可加载` : '已加载全部资源')}
      </p>
      {loadMoreMode === 'manual' && (hasMore || loadMoreError) && <Button variant="outline" size="sm" disabled={disabled || loadingMore || !onLoadMore} onClick={requestMore}>{loadMoreError ? '重试加载更多' : '加载更多'}</Button>}
    </div>}
  </section>;
}
