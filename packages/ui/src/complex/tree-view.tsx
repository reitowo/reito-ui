import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronRight, File, Folder } from 'lucide-react';
import { cx } from './shared.js';

export interface TreeViewNode { id: string; label: string; description?: string; disabled?: boolean; children?: TreeViewNode[] }
export interface TreeViewProps {
  nodes: TreeViewNode[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  label?: string;
  emptyMessage?: string;
  className?: string;
}

interface FlatNode { node: TreeViewNode; parentId?: string; level: number; posInSet: number; setSize: number }

/** ARIA tree with controlled selection/expansion and the standard single-select keyboard model. */
export function TreeView({ nodes, value, defaultValue, onValueChange, expanded, defaultExpanded = [], onExpandedChange,
  label = '树形导航', emptyMessage = '没有节点', className }: TreeViewProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpanded));
  const selected = value ?? internalValue;
  const open = expanded === undefined ? internalExpanded : new Set(expanded);
  const all = useMemo(() => {
    const map = new Map<string, { node: TreeViewNode; parentId?: string }>();
    const visit = (items: TreeViewNode[], parentId?: string) => items.forEach(node => { map.set(node.id, { node, parentId }); if (node.children) visit(node.children, node.id); });
    visit(nodes); return map;
  }, [nodes]);
  const visible = useMemo(() => {
    const result: FlatNode[] = [];
    const visit = (items: TreeViewNode[], level: number, parentId?: string) => items.forEach((node, index) => {
      result.push({ node, parentId, level, posInSet: index + 1, setSize: items.length });
      if (node.children && open.has(node.id)) visit(node.children, level + 1, node.id);
    });
    visit(nodes, 1); return result;
  }, [nodes, open]);
  const [activeId, setActiveId] = useState(() => selected && all.has(selected) ? selected : visible[0]?.node.id);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const focusOwned = useRef(false);
  const setOpen = (next: Set<string>) => {
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.([...next]);
  };
  const toggle = (id: string, next?: boolean) => {
    const updated = new Set(open); const shouldOpen = next ?? !updated.has(id);
    if (shouldOpen) updated.add(id); else updated.delete(id); setOpen(updated);
  };
  const choose = (node: TreeViewNode) => {
    if (node.disabled) return;
    if (value === undefined) setInternalValue(node.id);
    onValueChange?.(node.id);
  };
  const focus = useCallback((id: string | undefined) => {
    if (!id) return; setActiveId(id); requestAnimationFrame(() => itemRefs.current.get(id)?.focus());
  }, []);
  useLayoutEffect(() => {
    if (activeId && visible.some(item => item.node.id === activeId)) return;
    let candidate = activeId ? all.get(activeId)?.parentId : undefined;
    while (candidate && !visible.some(item => item.node.id === candidate)) candidate = all.get(candidate)?.parentId;
    candidate ??= selected && visible.some(item => item.node.id === selected) ? selected : visible[0]?.node.id;
    setActiveId(candidate);
    if (focusOwned.current && candidate) requestAnimationFrame(() => itemRefs.current.get(candidate)?.focus());
  }, [activeId, all, selected, visible]);
  const keyDown = (event: KeyboardEvent<HTMLLIElement>, item: FlatNode) => {
    event.stopPropagation();
    const index = visible.findIndex(entry => entry.node.id === item.node.id);
    const branch = Boolean(item.node.children);
    let target: string | undefined;
    if (event.key === 'ArrowDown') target = visible[Math.min(visible.length - 1, index + 1)]?.node.id;
    else if (event.key === 'ArrowUp') target = visible[Math.max(0, index - 1)]?.node.id;
    else if (event.key === 'Home') target = visible[0]?.node.id;
    else if (event.key === 'End') target = visible.at(-1)?.node.id;
    else if (event.key === 'ArrowRight' && branch) {
      if (!open.has(item.node.id)) toggle(item.node.id, true); else target = item.node.children?.[0]?.id;
    } else if (event.key === 'ArrowLeft') {
      if (branch && open.has(item.node.id)) toggle(item.node.id, false); else target = item.parentId;
    } else if (event.key === 'Enter' || event.key === ' ') choose(item.node);
    else return;
    event.preventDefault(); if (target) focus(target);
  };
  const render = (items: TreeViewNode[], level: number, parentId?: string) => <>{items.map((node, index) => {
    const branch = Boolean(node.children); const isOpen = branch && open.has(node.id);
    const item = { node, parentId, level, posInSet: index + 1, setSize: items.length };
    return <li key={node.id} ref={element => { if (element) itemRefs.current.set(node.id, element); else itemRefs.current.delete(node.id); }}
      role="treeitem" aria-level={level} aria-posinset={index + 1} aria-setsize={items.length} aria-expanded={branch ? isOpen : undefined}
      aria-selected={node.disabled ? undefined : selected === node.id} aria-disabled={node.disabled || undefined} tabIndex={activeId === node.id ? 0 : -1}
      className="min-w-0 outline-none" onFocus={event => { if (event.target !== event.currentTarget) return; focusOwned.current = true; setActiveId(node.id); }} onKeyDown={event => keyDown(event, item)}>
      <div data-slot="tree-item-row" data-selected={selected === node.id || undefined} data-disabled={node.disabled || undefined}
        title={[node.label, node.description].filter(Boolean).join('\n')}
        className={cx('flex min-h-[var(--rui-control-height-xs)] min-w-0 items-center gap-1 rounded-sm px-1 text-sm leading-5 hover:bg-muted focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring data-[selected=true]:bg-muted data-[selected=true]:font-medium data-[disabled=true]:opacity-[var(--rui-opacity-disabled)]')}
        onClick={() => { focus(node.id); choose(node); }} onDoubleClick={() => { if (branch && !node.disabled) toggle(node.id); }}>
        {branch ? <ChevronRight className={cx('size-3 shrink-0 text-muted-foreground', isOpen && 'rotate-90')} aria-hidden="true" /> : <span className="size-3 shrink-0" aria-hidden="true" />}
        {branch ? <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : <File className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <span className="min-w-0 truncate">{node.label}</span>{node.description && <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground">{node.description}</span>}
      </div>
      {branch && isOpen && <ul role="group" className="ml-3 min-w-0 border-l border-border pl-1">{node.children?.length ? render(node.children, level + 1, node.id) : <li role="none" className="px-1 py-1 text-xs text-muted-foreground">{emptyMessage}</li>}</ul>}
    </li>;
  })}</>;
  return nodes.length ? <ul role="tree" aria-label={label} aria-multiselectable="false" data-slot="tree-view"
    className={cx('min-w-0 p-1 font-sans text-foreground', className)}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) focusOwned.current = false; }}>
    {render(nodes, 1)}
  </ul> : <div data-slot="tree-view" className={cx('p-[var(--rui-content-padding)] text-sm text-muted-foreground', className)}><span role="status">{emptyMessage}</span></div>;
}
