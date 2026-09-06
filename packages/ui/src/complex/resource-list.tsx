import { useMemo, useState, type ReactNode } from 'react';
import { File, Search } from 'lucide-react';
import { Badge } from '../primitives/badge.js';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Input } from '../primitives/input.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';
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
  actions?: ResourceAction[];
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
function dateValue(value?: string) { const parsed = value ? Date.parse(value) : NaN; return Number.isFinite(parsed) ? parsed : -Infinity; }

/** A local resource collection. Selection survives search; all row actions are supplied by the host. */
export function ResourceList({
  items, label = '资源', selectionMode = 'single', selectedIds, onSelectionChange,
  query, onQueryChange, sort, onSortChange, actions = [], loading = false, error,
  onRetry, emptyMessage = '没有资源', disabled = false, className,
}: ResourceListProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [internalSort, setInternalSort] = useState<ResourceSort>('name-asc');
  const [internalSelection, setInternalSelection] = useState<string[]>([]);
  const search = query ?? internalQuery;
  const activeSort = sort ?? internalSort;
  const requestedSelection = selectedIds ?? internalSelection;
  const selection = selectionMode === 'none' ? [] : selectionMode === 'single' ? requestedSelection.slice(0, 1) : requestedSelection;
  const locked = disabled || loading;
  const visible = useMemo(() => {
    const result = items.filter(item => `${item.name} ${item.description ?? ''} ${item.kind ?? ''}`.toLowerCase().includes(search.toLowerCase()));
    return result.sort((a, b) => {
      if (activeSort === 'updated-desc') {
        const difference = dateValue(b.updatedAt) - dateValue(a.updatedAt);
        if (!Number.isNaN(difference) && difference !== 0) return difference;
      }
      return activeSort === 'name-desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    });
  }, [items, search, activeSort]);
  const selectable = visible.filter(item => !item.disabled);
  const allSelected = selectable.length > 0 && selectable.every(item => selection.includes(item.id));
  const someSelected = selectable.some(item => selection.includes(item.id));
  const selectedCount = items.filter(item => selection.includes(item.id)).length;

  function changeSelection(ids: string[]) {
    if (selectedIds === undefined) setInternalSelection(ids);
    onSelectionChange?.(ids);
  }

  function toggle(id: string) {
    if (selectionMode === 'single') changeSelection(selection.includes(id) ? [] : [id]);
    else changeSelection(selection.includes(id) ? selection.filter(value => value !== id) : [...selection, id]);
  }

  return <section aria-label={label} aria-busy={loading} className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
      <div className="relative min-w-40 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label={`搜索${label}`} placeholder="搜索名称、类型或说明…" value={search} disabled={locked} className="pl-9" onChange={event => {
          if (query === undefined) setInternalQuery(event.target.value);
          onQueryChange?.(event.target.value);
        }} />
      </div>
      <Select items={sortOptions} value={activeSort} disabled={locked} onValueChange={next => {
        if (next === 'name-asc' || next === 'name-desc' || next === 'updated-desc') {
          if (sort === undefined) setInternalSort(next);
          onSortChange?.(next);
        }
      }}>
        <SelectTrigger size="sm" aria-label="资源排序"><SelectValue /></SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      {selectionMode === 'multiple' && <label className="flex items-center gap-2 text-xs">
        <Checkbox checked={allSelected} indeterminate={!allSelected && someSelected} disabled={locked || !selectable.length} onCheckedChange={checked => {
          const next = new Set(selection);
          for (const item of selectable) { if (checked) next.add(item.id); else next.delete(item.id); }
          changeSelection([...next]);
        }} />选择筛选结果
      </label>}
      <p role="status" className="text-xs text-muted-foreground">显示 {visible.length} / {items.length} 项{selectionMode !== 'none' && ` · 已选择 ${selectedCount} 项`}</p>
      {selectionMode !== 'none' && selectedCount > 0 && <Button variant="ghost" size="sm" disabled={locked} onClick={() => changeSelection([])}>清除选择</Button>}
    </div>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)] text-destructive"><p>{error}</p>{onRetry && <Button variant="outline" size="sm" onClick={onRetry}>重试加载资源</Button>}</div>}
    {loading ? <p className="p-[var(--rui-content-padding)] text-muted-foreground">正在加载资源…</p>
      : visible.length ? <ul aria-label={`${label}列表`} className="divide-y divide-border rounded-lg border border-border">
        {visible.map(item => <li key={item.id} data-selected={selection.includes(item.id) || undefined}
          className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] data-selected:bg-muted/40">
          {selectionMode === 'multiple' && <Checkbox aria-label={`选择 ${item.name}`} checked={selection.includes(item.id)} disabled={locked || item.disabled} onCheckedChange={() => toggle(item.id)} />}
          <span aria-hidden="true" className="shrink-0 text-muted-foreground [&_svg]:size-4">{item.icon ?? <File />}</span>
          <div className="min-w-0 flex-1">
            {selectionMode === 'single' ? <button type="button" aria-label={`选择 ${item.name}`} aria-pressed={selection.includes(item.id)} disabled={locked || item.disabled} onClick={() => toggle(item.id)}
              className="max-w-full rounded text-left font-medium whitespace-normal break-all outline-none hover:underline focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring disabled:cursor-not-allowed">{item.name}</button>
              : <p className="break-all font-medium">{item.name}</p>}
            {item.description && <p className="mt-0.5 break-words text-xs text-muted-foreground">{item.description}</p>}
            {item.disabled && <p className="mt-0.5 text-xs text-muted-foreground">此资源不可操作</p>}
          </div>
          {item.kind && <Badge variant="secondary">{item.kind}</Badge>}
          {actions.length > 0 && <div role="group" aria-label={`${item.name}操作`} className="flex flex-wrap gap-1">
            {actions.map(action => <Button key={action.id} size="sm" variant="ghost" aria-label={`${action.label} ${item.name}`} disabled={locked || item.disabled || action.isDisabled?.(item)} onClick={() => action.onAction(item)}>{action.label}</Button>)}
          </div>}
        </li>)}
      </ul> : <p className="p-[var(--rui-content-padding)] text-muted-foreground">{search ? '没有匹配的资源' : emptyMessage}</p>}
  </section>;
}
