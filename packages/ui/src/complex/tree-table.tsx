import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { cx } from './shared.js';

export interface TreeTableNode<TData> {
  id: string;
  data: TData;
  children?: TreeTableNode<TData>[];
  disabled?: boolean;
}

export interface TreeTableColumn<TData> {
  id: string;
  header: ReactNode;
  cell: (node: TreeTableNode<TData>) => ReactNode;
  className?: string;
}

export type TreeTableSelectionMode = 'none' | 'single' | 'checkbox';
export type TreeTableCheckPropagation = 'cascade' | 'independent';

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
  const open = expanded === undefined ? internalExpanded : new Set(expanded);
  const selected = value === undefined ? internalValue : value;

  const all = useMemo(() => {
    const map = new Map<string, { node: TreeTableNode<TData>; parentId?: string }>();
    const visit = (items: TreeTableNode<TData>[], parentId?: string) => items.forEach(node => {
      map.set(node.id, { node, parentId });
      if (node.children) visit(node.children, node.id);
    });
    visit(nodes);
    return map;
  }, [nodes]);

  const visible = useMemo(() => {
    const result: FlatNode<TData>[] = [];
    const visit = (items: TreeTableNode<TData>[], level: number, parentId?: string) => items.forEach((node, index) => {
      result.push({ node, parentId, level, posInSet: index + 1, setSize: items.length });
      if (node.children && open.has(node.id)) visit(node.children, level + 1, node.id);
    });
    visit(nodes, 1);
    return result;
  }, [nodes, open]);

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
  const toggleExpanded = (id: string, next?: boolean) => {
    const updated = new Set(open);
    if (next ?? !updated.has(id)) updated.add(id); else updated.delete(id);
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
    const branch = Boolean(item.node.children);
    let target: string | undefined;
    if (event.key === 'ArrowDown') target = visible[Math.min(visible.length - 1, index + 1)]?.node.id;
    else if (event.key === 'ArrowUp') target = visible[Math.max(0, index - 1)]?.node.id;
    else if (event.key === 'Home') target = visible[0]?.node.id;
    else if (event.key === 'End') target = visible.at(-1)?.node.id;
    else if (event.key === 'ArrowRight' && branch) {
      if (!open.has(item.node.id)) toggleExpanded(item.node.id, true);
      else target = item.node.children?.find(child => !child.disabled)?.id ?? item.node.children?.[0]?.id;
    } else if (event.key === 'ArrowLeft') {
      if (branch && open.has(item.node.id)) toggleExpanded(item.node.id, false); else target = item.parentId;
    } else if (event.key === 'Enter') choose(item.node);
    else if (event.key === ' ' && selectionMode === 'checkbox') toggleChecked(item.node);
    else return;
    event.preventDefault();
    if (target) focus(target);
  }

  const allEnabled = [...all.values()].map(entry => entry.node).filter(node => !node.disabled);
  const allChecked = allEnabled.length > 0 && allEnabled.every(node => normalizedChecked.has(node.id));
  const someChecked = !allChecked && allEnabled.some(node => normalizedChecked.has(node.id));
  const columnCount = columns.length + Number(selectionMode === 'checkbox');

  return <div data-slot="tree-table" className={cx('min-w-0 overflow-hidden rounded-lg border border-border', className)}>
    <div className="overflow-auto">
      <table role="treegrid" aria-label={caption} aria-multiselectable={selectionMode === 'checkbox' || undefined} className="w-full min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/40 text-muted-foreground"><tr>
          {selectionMode === 'checkbox' && <th scope="col" className="w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)]"><Checkbox aria-label="选择全部层级行" checked={allChecked} indeterminate={someChecked} disabled={loading || Boolean(error) || !allEnabled.length} onCheckedChange={toggleAll} /></th>}
          {columns.map(column => <th key={column.id} scope="col" className={cx('whitespace-nowrap px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] font-medium', column.className)}>{column.header}</th>)}
        </tr></thead>
        <tbody>{loading ? <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground"><span role="status">{loadingMessage}</span></td></tr>
          : error ? <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-destructive"><div role="alert">{error}</div>{onRetry && <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onRetry}><RotateCcw aria-hidden="true" />重试</Button>}</td></tr>
            : visible.length ? visible.map(item => {
              const { node } = item;
              const branch = Boolean(node.children);
              const isOpen = branch && open.has(node.id);
              const state = checkState(node.id);
              const isSelected = selectionMode === 'single' ? selected === node.id : selectionMode === 'checkbox' ? state === true : false;
              return <tr key={node.id} ref={element => { if (element) rowRefs.current.set(node.id, element); else rowRefs.current.delete(node.id); }} role="row" tabIndex={activeId === node.id ? 0 : -1} aria-level={item.level} aria-posinset={item.posInSet} aria-setsize={item.setSize} aria-expanded={branch ? isOpen : undefined} aria-selected={selectionMode !== 'none' ? isSelected : undefined} aria-disabled={node.disabled || undefined} data-row-id={node.id} data-selected={isSelected || undefined}
                className="group border-t border-border outline-none hover:bg-muted/30 focus-visible:ring-inset focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring data-selected:bg-muted/60 aria-disabled:opacity-[var(--rui-opacity-disabled)]"
                onFocus={() => { focusOwned.current = true; setActiveId(node.id); }} onKeyDown={event => handleKeyDown(event, item)} onClick={event => { if (!(event.target as HTMLElement).closest('button,[role=checkbox]')) { focus(node.id); choose(node); } }}>
                {selectionMode === 'checkbox' && <td className="w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]"><Checkbox tabIndex={-1} aria-label={`选择层级行 ${node.id}`} checked={state === true} indeterminate={state === 'mixed'} disabled={node.disabled} onCheckedChange={() => toggleChecked(node)} /></td>}
                {columns.map((column, columnIndex) => <td key={column.id} className={cx('max-w-sm px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] align-middle', column.className)}>
                  {columnIndex === 0 ? <div className="flex min-w-0 items-center gap-1 whitespace-nowrap" style={item.level > 1 ? { paddingInlineStart: `calc(var(--rui-space-3) * ${item.level - 1})` } : undefined}>
                    {branch ? <Button type="button" variant="ghost" size="icon-xs" tabIndex={-1} className="size-[var(--rui-table-expander-size)]" aria-label={`${isOpen ? '折叠' : '展开'}层级行 ${node.id}`} aria-expanded={isOpen} onClick={() => { toggleExpanded(node.id); focus(node.id); }}><ChevronRight aria-hidden="true" className={cx('transition-transform', isOpen && 'rotate-90')} /></Button> : <span className="size-[var(--rui-table-expander-size)] shrink-0" aria-hidden="true" />}
                    <span className="min-w-0 truncate">{column.cell(node)}</span>
                  </div> : column.cell(node)}
                </td>)}
              </tr>;
            }) : <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground">{emptyMessage}</td></tr>}</tbody>
      </table>
    </div>
    {selectionMode === 'checkbox' && !loading && !error && <div className="border-t border-border px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] text-xs text-muted-foreground" aria-live="polite">已选择 {normalizedChecked.size} / {allEnabled.length} 行</div>}
  </div>;
}
