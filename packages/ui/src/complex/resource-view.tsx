import { useMemo, useState, type ReactNode } from 'react';
import { File, Grid2X2, List } from 'lucide-react';
import { Badge } from '../primitives/badge.js';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Input } from '../primitives/input.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';
import { ResourceList, projectResourceItems, type ResourceAction, type ResourceItem, type ResourceSort } from './resource-list.js';
import { cx } from './shared.js';

export type ResourceLayout = 'list' | 'grid';

export interface ResourceViewProps {
  items: ResourceItem[];
  label?: string;
  dataMode?: 'local' | 'remote';
  totalCount?: number;
  layout?: ResourceLayout;
  defaultLayout?: ResourceLayout;
  onLayoutChange?: (layout: ResourceLayout) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  sort?: ResourceSort;
  onSortChange?: (sort: ResourceSort) => void;
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actions?: ResourceAction[];
  renderGridItem?: (item: ResourceItem) => ReactNode;
  virtualizedList?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

const sortOptions = [
  { value: 'name-asc', label: '名称 A → Z' },
  { value: 'name-desc', label: '名称 Z → A' },
  { value: 'updated-desc', label: '最近更新' },
];

/** One controlled collection state projected into list or grid layouts. */
export function ResourceView({
  items, label = '资源', dataMode = 'local', totalCount,
  layout, defaultLayout = 'list', onLayoutChange, query, onQueryChange, sort, onSortChange,
  page, defaultPage = 0, pageSize = 12, onPageChange,
  selectionMode = 'single', selectedIds, onSelectionChange, actions = [], renderGridItem,
  virtualizedList = false, loading = false, error, onRetry, emptyMessage = '没有资源', disabled = false, className,
}: ResourceViewProps) {
  const [internalLayout, setInternalLayout] = useState<ResourceLayout>(defaultLayout);
  const [internalQuery, setInternalQuery] = useState('');
  const [internalSort, setInternalSort] = useState<ResourceSort>('name-asc');
  const [internalPage, setInternalPage] = useState(Math.max(0, Math.floor(defaultPage)));
  const [internalSelection, setInternalSelection] = useState<string[]>([]);
  const activeLayout = layout ?? internalLayout;
  const activeQuery = query ?? internalQuery;
  const activeSort = sort ?? internalSort;
  const requestedSelection = selectedIds ?? internalSelection;
  const selection = selectionMode === 'none' ? [] : selectionMode === 'single' ? requestedSelection.slice(0, 1) : requestedSelection;
  const size = Math.max(1, Math.floor(Number.isFinite(pageSize) ? pageSize : 12));
  const projected = useMemo(() => dataMode === 'local' ? projectResourceItems(items, activeQuery, activeSort) : items, [activeQuery, activeSort, dataMode, items]);
  const normalizedTotal = dataMode === 'local' ? projected.length : Math.max(items.length, Math.floor(Number.isFinite(totalCount) ? Number(totalCount) : items.length));
  const pageCount = Math.max(1, Math.ceil(normalizedTotal / size));
  const requestedPage = page ?? internalPage;
  const activePage = Math.min(pageCount - 1, Math.max(0, Math.floor(Number.isFinite(requestedPage) ? requestedPage : 0)));
  const pageItems = dataMode === 'local' ? projected.slice(activePage * size, activePage * size + size) : items;
  const selectable = pageItems.filter(item => !item.disabled);
  const allSelected = selectable.length > 0 && selectable.every(item => selection.includes(item.id));
  const someSelected = selectable.some(item => selection.includes(item.id));
  const locked = disabled || loading;

  function changeLayout(next: ResourceLayout) { if (layout === undefined) setInternalLayout(next); onLayoutChange?.(next); }
  function changePage(next: number) { const normalized = Math.min(pageCount - 1, Math.max(0, next)); if (page === undefined) setInternalPage(normalized); onPageChange?.(normalized); }
  function resetPage() { if (page === undefined) setInternalPage(0); onPageChange?.(0); }
  function changeSelection(ids: string[]) { if (selectedIds === undefined) setInternalSelection(ids); onSelectionChange?.(ids); }
  function toggle(id: string) {
    if (selectionMode === 'single') changeSelection(selection.includes(id) ? [] : [id]);
    else changeSelection(selection.includes(id) ? selection.filter(value => value !== id) : [...selection, id]);
  }

  return <section aria-label={label} aria-busy={loading} data-slot="resource-view" className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
      <Input aria-label={`搜索${label}`} placeholder="搜索名称、类型或说明…" value={activeQuery} disabled={locked} className="min-w-40 flex-1" onChange={event => {
        if (query === undefined) setInternalQuery(event.target.value);
        onQueryChange?.(event.target.value);
        resetPage();
      }} />
      <Select items={sortOptions} value={activeSort} disabled={locked} onValueChange={next => {
        if (next !== 'name-asc' && next !== 'name-desc' && next !== 'updated-desc') return;
        if (sort === undefined) setInternalSort(next);
        onSortChange?.(next);
        resetPage();
      }}>
        <SelectTrigger size="sm" aria-label="资源排序"><SelectValue /></SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
      <div role="group" aria-label="资源布局" className="flex items-center rounded-md border border-border p-0.5">
        <Button size="icon-xs" variant={activeLayout === 'list' ? 'secondary' : 'ghost'} aria-label="列表视图" aria-pressed={activeLayout === 'list'} disabled={locked} onClick={() => changeLayout('list')}><List aria-hidden="true" /></Button>
        <Button size="icon-xs" variant={activeLayout === 'grid' ? 'secondary' : 'ghost'} aria-label="网格视图" aria-pressed={activeLayout === 'grid'} disabled={locked} onClick={() => changeLayout('grid')}><Grid2X2 aria-hidden="true" /></Button>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      {selectionMode === 'multiple' && <div className="flex items-center gap-2 text-xs"><Checkbox aria-label="选择当前页" checked={allSelected} indeterminate={!allSelected && someSelected} disabled={locked || !selectable.length} onCheckedChange={() => {
        const next = new Set(selection); const shouldSelect = !allSelected;
        for (const item of selectable) { if (shouldSelect) next.add(item.id); else next.delete(item.id); }
        changeSelection([...next]);
      }} /><span>选择当前页</span></div>}
      <p role="status" className="text-xs text-muted-foreground">{normalizedTotal} 项 · 第 {normalizedTotal ? activePage + 1 : 0} / {normalizedTotal ? pageCount : 0} 页{selectionMode !== 'none' && ` · 已选择 ${selection.length} 项`}</p>
      {selectionMode !== 'none' && selection.length > 0 && <Button size="sm" variant="ghost" disabled={locked} onClick={() => changeSelection([])}>清除选择</Button>}
    </div>
    {error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)] text-destructive"><p>{error}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>重试加载资源</Button>}</div>
      : loading ? <p className="p-[var(--rui-content-padding)] text-muted-foreground">正在加载资源…</p>
        : activeLayout === 'list' ? <ResourceList items={pageItems} dataMode="remote" label={label} selectionMode={selectionMode} selectedIds={selection} onSelectionChange={changeSelection}
          actions={actions} disabled={disabled} showControls={false} virtualized={virtualizedList} viewportClassName="h-64" emptyMessage={activeQuery ? '没有匹配的资源' : emptyMessage} />
          : pageItems.length ? <ul aria-label={`${label}网格`} className="grid grid-cols-1 gap-[var(--rui-content-gap-sm)] sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map(item => <li key={item.id} data-resource-id={item.id} data-selected={selection.includes(item.id) || undefined}
              className="flex min-w-0 flex-col gap-[var(--rui-content-gap-sm)] rounded-lg border border-border p-[var(--rui-content-padding)] data-selected:bg-muted/40">
              <div className="flex min-w-0 items-start gap-[var(--rui-content-gap-sm)]">
                {selectionMode === 'multiple' && <Checkbox aria-label={`选择 ${item.name}`} checked={selection.includes(item.id)} disabled={locked || item.disabled} onCheckedChange={() => toggle(item.id)} />}
                <span aria-hidden="true" className="shrink-0 text-muted-foreground [&_svg]:size-4">{item.icon ?? <File />}</span>
                <div className="min-w-0 flex-1">{selectionMode === 'single' ? <button type="button" aria-label={`选择 ${item.name}`} aria-pressed={selection.includes(item.id)} disabled={locked || item.disabled} onClick={() => toggle(item.id)} className="max-w-full rounded text-left font-medium break-all outline-none hover:underline focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring disabled:cursor-not-allowed">{item.name}</button> : <p className="font-medium break-all">{item.name}</p>}{item.kind && <Badge variant="secondary" className="mt-1">{item.kind}</Badge>}</div>
              </div>
              {renderGridItem ? renderGridItem(item) : item.description && <p className="min-h-0 flex-1 break-words text-xs text-muted-foreground">{item.description}</p>}
              {item.disabled && <p className="text-xs text-muted-foreground">此资源不可操作</p>}
              {actions.length > 0 && <div role="group" aria-label={`${item.name}操作`} className="flex flex-wrap justify-end gap-1">{actions.map(action => <Button key={action.id} size="sm" variant="ghost" aria-label={`${action.label} ${item.name}`} disabled={locked || item.disabled || action.isDisabled?.(item)} onClick={() => action.onAction(item)}>{action.label}</Button>)}</div>}
            </li>)}
          </ul> : <p className="p-[var(--rui-content-padding)] text-muted-foreground">{activeQuery ? '没有匹配的资源' : emptyMessage}</p>}
    <nav aria-label="资源分页" className="flex items-center justify-center gap-[var(--rui-content-gap-sm)]">
      <Button size="sm" variant="outline" disabled={locked || activePage === 0 || normalizedTotal === 0} onClick={() => changePage(activePage - 1)}>上一页</Button>
      <span className="text-xs text-muted-foreground">{normalizedTotal ? activePage + 1 : 0} / {normalizedTotal ? pageCount : 0}</span>
      <Button size="sm" variant="outline" disabled={locked || activePage >= pageCount - 1 || normalizedTotal === 0} onClick={() => changePage(activePage + 1)}>下一页</Button>
    </nav>
  </section>;
}
