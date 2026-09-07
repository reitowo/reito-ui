import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronsLeft, ChevronsRight, MoveLeft, MoveRight } from 'lucide-react';
import { Listbox, type ListboxOption } from '../basic/listbox.js';
import { Button } from '../primitives/button.js';
import { cx } from './shared.js';

export interface TransferItem extends ListboxOption {}
export type TransferDirection = 'to-target' | 'to-source';

export interface TransferProps {
  items: readonly TransferItem[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], detail: { direction: TransferDirection; moved: string[] }) => void;
  sourceLabel?: string;
  targetLabel?: string;
  sourceSelection?: string[];
  defaultSourceSelection?: string[];
  onSourceSelectionChange?: (value: string[]) => void;
  targetSelection?: string[];
  defaultTargetSelection?: string[];
  onTargetSelectionChange?: (value: string[]) => void;
  sourceQuery?: string;
  defaultSourceQuery?: string;
  onSourceQueryChange?: (query: string) => void;
  targetQuery?: string;
  defaultTargetQuery?: string;
  onTargetQueryChange?: (query: string) => void;
  searchable?: boolean;
  bulkActions?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  emptySourceMessage?: ReactNode;
  emptyTargetMessage?: ReactNode;
  className?: string;
}

function uniqueKnown(values: readonly string[], known: Set<string>) {
  return [...new Set(values)].filter(value => known.has(value));
}

function matches(item: TransferItem, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return !needle || [item.label, ...(item.keywords ?? [])].join(' ').toLocaleLowerCase().includes(needle);
}

/** Dual-list transfer with controlled ordered values and current-result bulk actions. */
export function Transfer({
  items,
  value,
  defaultValue = [],
  onValueChange,
  sourceLabel = '可选项',
  targetLabel = '已选项',
  sourceSelection,
  defaultSourceSelection = [],
  onSourceSelectionChange,
  targetSelection,
  defaultTargetSelection = [],
  onTargetSelectionChange,
  sourceQuery,
  defaultSourceQuery = '',
  onSourceQueryChange,
  targetQuery,
  defaultTargetQuery = '',
  onTargetQueryChange,
  searchable = true,
  bulkActions = true,
  disabled = false,
  readOnly = false,
  loading = false,
  emptySourceMessage = '没有可转移的选项',
  emptyTargetMessage = '尚未选择任何选项',
  className,
}: TransferProps) {
  const known = useMemo(() => new Set(items.map(item => item.value)), [items]);
  const [internalValue, setInternalValue] = useState(() => uniqueKnown(defaultValue, known));
  const currentValue = uniqueKnown(value === undefined ? internalValue : value, known);
  const targetSet = useMemo(() => new Set(currentValue), [currentValue]);
  const itemMap = useMemo(() => new Map(items.map(item => [item.value, item])), [items]);
  const sourceItems = items.filter(item => !targetSet.has(item.value));
  const targetItems = currentValue.map(id => itemMap.get(id)).filter((item): item is TransferItem => Boolean(item));

  const [internalSourceSelection, setInternalSourceSelection] = useState(defaultSourceSelection);
  const [internalTargetSelection, setInternalTargetSelection] = useState(defaultTargetSelection);
  const selectedSource = uniqueKnown(sourceSelection ?? internalSourceSelection, new Set(sourceItems.map(item => item.value)));
  const selectedTarget = uniqueKnown(targetSelection ?? internalTargetSelection, new Set(targetItems.map(item => item.value)));
  const [internalSourceQuery, setInternalSourceQuery] = useState(defaultSourceQuery);
  const [internalTargetQuery, setInternalTargetQuery] = useState(defaultTargetQuery);
  const currentSourceQuery = sourceQuery ?? internalSourceQuery;
  const currentTargetQuery = targetQuery ?? internalTargetQuery;
  const visibleSource = sourceItems.filter(item => matches(item, currentSourceQuery) && !item.disabled);
  const visibleTarget = targetItems.filter(item => matches(item, currentTargetQuery) && !item.disabled);
  const locked = disabled || readOnly || loading;

  const setSourceSelection = (next: string[]) => {
    if (sourceSelection === undefined) setInternalSourceSelection(next);
    onSourceSelectionChange?.(next);
  };
  const setTargetSelection = (next: string[]) => {
    if (targetSelection === undefined) setInternalTargetSelection(next);
    onTargetSelectionChange?.(next);
  };
  const setSourceQuery = (next: string) => {
    if (sourceQuery === undefined) setInternalSourceQuery(next);
    onSourceQueryChange?.(next);
  };
  const setTargetQuery = (next: string) => {
    if (targetQuery === undefined) setInternalTargetQuery(next);
    onTargetQueryChange?.(next);
  };
  const emitValue = (next: string[], direction: TransferDirection, moved: string[]) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next, { direction, moved });
  };
  const moveToTarget = (ids: readonly string[]) => {
    if (locked) return;
    const moving = sourceItems.filter(item => ids.includes(item.value) && !item.disabled).map(item => item.value);
    if (!moving.length) return;
    emitValue([...currentValue, ...moving], 'to-target', moving);
    setSourceSelection(selectedSource.filter(id => !moving.includes(id)));
  };
  const moveToSource = (ids: readonly string[]) => {
    if (locked) return;
    const moving = targetItems.filter(item => ids.includes(item.value) && !item.disabled).map(item => item.value);
    if (!moving.length) return;
    emitValue(currentValue.filter(id => !moving.includes(id)), 'to-source', moving);
    setTargetSelection(selectedTarget.filter(id => !moving.includes(id)));
  };
  const handleSideKey = (event: KeyboardEvent<HTMLDivElement>, direction: TransferDirection) => {
    if (!event.altKey || (direction === 'to-target' ? event.key !== 'ArrowRight' : event.key !== 'ArrowLeft')) return;
    event.preventDefault();
    if (direction === 'to-target') moveToTarget(selectedSource);
    else moveToSource(selectedTarget);
  };

  return <div data-slot="transfer" className={cx('grid min-w-0 grid-cols-1 items-center gap-[var(--rui-content-gap-sm)] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]', className)}>
    <div className="min-w-0" onKeyDown={event => handleSideKey(event, 'to-target')}>
      <Listbox label={sourceLabel} options={sourceItems} selectionMode="multiple" value={selectedSource} onValueChange={next => setSourceSelection(Array.isArray(next) ? next : [])} searchable={searchable} query={currentSourceQuery} onQueryChange={setSourceQuery} disabled={disabled || loading} readOnly={readOnly} emptyMessage={emptySourceMessage} loading={loading} listClassName="max-h-64" />
    </div>
    <div className="flex justify-center gap-1 sm:flex-col" aria-label="转移操作">
      {bulkActions && <Button type="button" variant="outline" size="icon-sm" aria-label="全部移到已选项" title="移动当前源搜索结果" disabled={locked || !visibleSource.length} onClick={() => moveToTarget(visibleSource.map(item => item.value))}><ChevronsRight aria-hidden="true" /></Button>}
      <Button type="button" variant="outline" size="icon-sm" aria-label="移到已选项" title="Alt + 右方向键" disabled={locked || !selectedSource.length} onClick={() => moveToTarget(selectedSource)}><MoveRight aria-hidden="true" /></Button>
      <Button type="button" variant="outline" size="icon-sm" aria-label="移回可选项" title="Alt + 左方向键" disabled={locked || !selectedTarget.length} onClick={() => moveToSource(selectedTarget)}><MoveLeft aria-hidden="true" /></Button>
      {bulkActions && <Button type="button" variant="outline" size="icon-sm" aria-label="全部移回可选项" title="移动当前目标搜索结果" disabled={locked || !visibleTarget.length} onClick={() => moveToSource(visibleTarget.map(item => item.value))}><ChevronsLeft aria-hidden="true" /></Button>}
    </div>
    <div className="min-w-0" onKeyDown={event => handleSideKey(event, 'to-source')}>
      <Listbox label={targetLabel} options={targetItems} selectionMode="multiple" value={selectedTarget} onValueChange={next => setTargetSelection(Array.isArray(next) ? next : [])} searchable={searchable} query={currentTargetQuery} onQueryChange={setTargetQuery} disabled={disabled || loading} readOnly={readOnly} emptyMessage={emptyTargetMessage} loading={loading} listClassName="max-h-64" />
    </div>
  </div>;
}
