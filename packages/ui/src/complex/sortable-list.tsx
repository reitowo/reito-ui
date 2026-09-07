import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, GripVertical } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cx } from './shared.js';

export interface SortableListItem {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export type SortableListMove = 'up' | 'down' | 'top' | 'bottom' | 'drag';

export interface SortableListProps {
  items: readonly SortableListItem[];
  order?: string[];
  defaultOrder?: string[];
  onOrderChange?: (order: string[], detail: { move: SortableListMove; moved: string[] }) => void;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  label?: string;
  description?: ReactNode;
  multiple?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  emptyMessage?: ReactNode;
  className?: string;
}

function normalizeOrder(items: readonly SortableListItem[], order: readonly string[]) {
  const known = new Set(items.map(item => item.id));
  const next = [...new Set(order)].filter(id => known.has(id));
  for (const item of items) if (!next.includes(item.id)) next.push(item.id);
  return next;
}

function moveStep(order: string[], moving: Set<string>, disabled: Set<string>, direction: -1 | 1) {
  const next = [...order];
  const indexes = direction < 0 ? [...next.keys()] : [...next.keys()].reverse();
  for (const index of indexes) {
    const adjacent = index + direction;
    if (adjacent < 0 || adjacent >= next.length || !moving.has(next[index]!) || moving.has(next[adjacent]!) || disabled.has(next[index]!) || disabled.has(next[adjacent]!)) continue;
    [next[index], next[adjacent]] = [next[adjacent]!, next[index]!];
  }
  return next;
}

function moveEdge(order: string[], moving: Set<string>, disabled: Set<string>, edge: 'top' | 'bottom') {
  const result: string[] = [];
  let segment: string[] = [];
  const flush = () => {
    const picked = segment.filter(id => moving.has(id));
    const rest = segment.filter(id => !moving.has(id));
    result.push(...(edge === 'top' ? [...picked, ...rest] : [...rest, ...picked]));
    segment = [];
  };
  for (const id of order) {
    if (disabled.has(id)) { flush(); result.push(id); }
    else segment.push(id);
  }
  flush();
  return result;
}

/** Ordered list with batch controls, keyboard equivalents and disabled barriers. */
export function SortableList({
  items,
  order,
  defaultOrder = items.map(item => item.id),
  onOrderChange,
  selected,
  defaultSelected = [],
  onSelectedChange,
  label = '可排序列表',
  description = '空格选择；Alt+上下移动，Alt+Home/End 置顶或置底。',
  multiple = true,
  draggable = true,
  disabled = false,
  readOnly = false,
  emptyMessage = '没有可排序的项目',
  className,
}: SortableListProps) {
  const itemMap = useMemo(() => new Map(items.map(item => [item.id, item])), [items]);
  const generatedId = useId();
  const descriptionId = 'sortable-list-' + generatedId + '-description';
  const disabledIds = useMemo(() => new Set(items.filter(item => item.disabled).map(item => item.id)), [items]);
  const [internalOrder, setInternalOrder] = useState(() => normalizeOrder(items, defaultOrder));
  const currentOrder = normalizeOrder(items, order ?? internalOrder);
  const orderedItems = currentOrder.map(id => itemMap.get(id)).filter((item): item is SortableListItem => Boolean(item));
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const currentSelected = [...new Set(selected ?? internalSelected)].filter(id => itemMap.has(id) && !disabledIds.has(id));
  const selectedSet = useMemo(() => new Set(currentSelected), [currentSelected]);
  const [activeId, setActiveId] = useState<string | undefined>(() => currentSelected[0] ?? orderedItems.find(item => !item.disabled)?.id);
  const [announcement, setAnnouncement] = useState('');
  const [dragTarget, setDragTarget] = useState<{ id: string; after: boolean }>();
  const draggedId = useRef<string | undefined>(undefined);
  const rows = useRef(new Map<string, HTMLDivElement>());
  const locked = disabled || readOnly;

  const setSelection = (ids: string[]) => {
    const next = multiple ? currentOrder.filter(id => ids.includes(id) && !disabledIds.has(id)) : ids.filter(id => !disabledIds.has(id)).slice(-1);
    if (selected === undefined) setInternalSelected(next);
    onSelectedChange?.(next);
  };
  const emitOrder = (next: string[], move: SortableListMove, moved: string[]) => {
    if (next.every((id, index) => id === currentOrder[index])) return;
    if (order === undefined) setInternalOrder(next);
    onOrderChange?.(next, { move, moved });
    setAnnouncement('已移动 ' + moved.length + ' 项');
  };
  const move = (kind: Exclude<SortableListMove, 'drag'>) => {
    if (locked) return;
    const moving = new Set(currentSelected);
    if (!moving.size) return;
    const next = kind === 'up' ? moveStep(currentOrder, moving, disabledIds, -1)
      : kind === 'down' ? moveStep(currentOrder, moving, disabledIds, 1)
        : moveEdge(currentOrder, moving, disabledIds, kind);
    emitOrder(next, kind, currentSelected);
  };
  const focus = useCallback((id: string | undefined) => {
    if (!id) return;
    setActiveId(id);
    requestAnimationFrame(() => rows.current.get(id)?.focus());
  }, []);
  useLayoutEffect(() => {
    if (activeId && itemMap.has(activeId)) return;
    setActiveId(orderedItems.find(item => !item.disabled)?.id);
  }, [activeId, itemMap, orderedItems]);

  const toggle = (id: string) => {
    if (locked || disabledIds.has(id)) return;
    if (!multiple) setSelection([id]);
    else setSelection(selectedSet.has(id) ? currentSelected.filter(value => value !== id) : [...currentSelected, id]);
  };
  const handleKey = (event: KeyboardEvent<HTMLDivElement>, item: SortableListItem) => {
    const index = currentOrder.indexOf(item.id);
    if (event.altKey && ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!selectedSet.has(item.id)) setSelection([item.id]);
      const moving = selectedSet.has(item.id) ? currentSelected : [item.id];
      const movingSet = new Set(moving);
      const next = event.key === 'ArrowUp' ? moveStep(currentOrder, movingSet, disabledIds, -1)
        : event.key === 'ArrowDown' ? moveStep(currentOrder, movingSet, disabledIds, 1)
          : moveEdge(currentOrder, movingSet, disabledIds, event.key === 'Home' ? 'top' : 'bottom');
      emitOrder(next, event.key === 'ArrowUp' ? 'up' : event.key === 'ArrowDown' ? 'down' : event.key === 'Home' ? 'top' : 'bottom', moving);
      focus(item.id);
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const target = event.key === 'Home' ? orderedItems.find(candidate => !candidate.disabled)
        : event.key === 'End' ? [...orderedItems].reverse().find(candidate => !candidate.disabled)
          : orderedItems[index + (event.key === 'ArrowUp' ? -1 : 1)];
      if (target && !target.disabled) focus(target.id);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); toggle(item.id); }
  };
  const drop = (event: DragEvent<HTMLDivElement>, target: SortableListItem) => {
    event.preventDefault();
    const sourceId = draggedId.current;
    setDragTarget(undefined);
    draggedId.current = undefined;
    if (!sourceId || sourceId === target.id || locked || target.disabled) return;
    const sourceIndex = currentOrder.indexOf(sourceId);
    const targetIndex = currentOrder.indexOf(target.id);
    if (currentOrder.slice(Math.min(sourceIndex, targetIndex), Math.max(sourceIndex, targetIndex) + 1).some(id => disabledIds.has(id))) return;
    const next = currentOrder.filter(id => id !== sourceId);
    let insertion = next.indexOf(target.id) + (dragTarget?.after ? 1 : 0);
    insertion = Math.max(0, insertion);
    next.splice(insertion, 0, sourceId);
    emitOrder(next, 'drag', [sourceId]);
    focus(sourceId);
  };

  return <section data-slot="sortable-list" className={cx('grid min-w-0 gap-[var(--rui-content-gap-sm)]', className)}>
    <header className="flex min-w-0 items-start justify-between gap-2">
      <div className="min-w-0"><h3 className="text-sm font-medium">{label}</h3>{description && <p id={descriptionId} className="text-xs text-muted-foreground">{description}</p>}</div>
      <span className="shrink-0 text-xs text-muted-foreground">已选 {currentSelected.length} 项</span>
    </header>
    <div className="flex flex-wrap gap-1" aria-label="排序操作">
      <Button type="button" variant="outline" size="xs" disabled={locked || !currentSelected.length} onClick={() => move('top')}><ChevronsUp aria-hidden="true" />置顶</Button>
      <Button type="button" variant="outline" size="xs" disabled={locked || !currentSelected.length} onClick={() => move('up')}><ArrowUp aria-hidden="true" />上移</Button>
      <Button type="button" variant="outline" size="xs" disabled={locked || !currentSelected.length} onClick={() => move('down')}><ArrowDown aria-hidden="true" />下移</Button>
      <Button type="button" variant="outline" size="xs" disabled={locked || !currentSelected.length} onClick={() => move('bottom')}><ChevronsDown aria-hidden="true" />置底</Button>
    </div>
    {orderedItems.length ? <div role="listbox" aria-label={label} aria-describedby={description ? descriptionId : undefined} aria-multiselectable={multiple || undefined} aria-disabled={disabled || undefined} aria-readonly={readOnly || undefined} className="min-w-0 overflow-hidden rounded-lg border border-border">
      {orderedItems.map(item => {
        const isSelected = selectedSet.has(item.id);
        const isActive = activeId === item.id;
        return <div key={item.id} ref={element => { if (element) rows.current.set(item.id, element); else rows.current.delete(item.id); }} role="option" tabIndex={isActive ? 0 : -1} aria-selected={isSelected} aria-disabled={item.disabled || undefined} data-item-id={item.id} data-selected={isSelected || undefined} data-drop-before={dragTarget?.id === item.id && !dragTarget.after || undefined} data-drop-after={dragTarget?.id === item.id && dragTarget.after || undefined} draggable={draggable && !locked && !item.disabled}
          className="group flex min-h-[var(--rui-control-height)] min-w-0 items-center gap-2 border-t border-border px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] outline-none first:border-t-0 hover:bg-muted/30 focus-visible:ring-inset focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring data-selected:bg-muted/60 data-[drop-before=true]:border-t-ring data-[drop-after=true]:border-b-ring aria-disabled:opacity-[var(--rui-opacity-disabled)]"
          onFocus={() => setActiveId(item.id)} onClick={() => toggle(item.id)} onKeyDown={event => handleKey(event, item)}
          onDragStart={event => { draggedId.current = item.id; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item.id); }}
          onDragOver={event => { if (locked || item.disabled) return; event.preventDefault(); const rectangle = event.currentTarget.getBoundingClientRect(); setDragTarget({ id: item.id, after: event.clientY > rectangle.top + rectangle.height / 2 }); }}
          onDragEnd={() => { draggedId.current = undefined; setDragTarget(undefined); }} onDrop={event => drop(event, item)}>
          {draggable && <GripVertical aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
          {item.icon && <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">{item.icon}</span>}
          <span className="grid min-w-0 flex-1 gap-0.5"><span className="truncate">{item.label}</span>{item.description && <span className="truncate text-xs text-muted-foreground">{item.description}</span>}</span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{currentOrder.indexOf(item.id) + 1}</span>
        </div>;
      })}
    </div> : <div className="rounded-lg border border-border p-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground" role="status">{emptyMessage}</div>}
    <p className="sr-only" aria-live="polite">{announcement}</p>
  </section>;
}
