import { useCallback, useLayoutEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { Check, ChevronRight, File, Folder, Minus } from 'lucide-react';
import { cx } from './shared.js';

export interface TreeViewNode { id: string; label: string; description?: string; disabled?: boolean; busy?: boolean; emptyMessage?: string | null; children?: TreeViewNode[] }
export type TreeViewSelectionMode = 'single' | 'checkbox';
export type TreeViewCheckPropagation = 'cascade' | 'independent';
export type TreeViewDropPosition = 'before' | 'inside' | 'after';
export interface TreeViewItemInteraction {
  draggable?: boolean;
  dropPosition?: TreeViewDropPosition;
  onDragStart?: (event: DragEvent<HTMLLIElement>) => void;
  onDragOver?: (event: DragEvent<HTMLLIElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLLIElement>) => void;
  onDrop?: (event: DragEvent<HTMLLIElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLLIElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLLIElement>) => void;
}
export interface TreeViewProps {
  nodes: TreeViewNode[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectionMode?: TreeViewSelectionMode;
  checked?: string[];
  defaultChecked?: string[];
  onCheckedChange?: (ids: string[]) => void;
  checkPropagation?: TreeViewCheckPropagation;
  rangeSelection?: boolean;
  bulkSelection?: boolean;
  renderTrailing?: (node: TreeViewNode) => ReactNode;
  getItemInteraction?: (node: TreeViewNode) => TreeViewItemInteraction | undefined;
  label?: string;
  emptyMessage?: string;
  className?: string;
}

interface FlatNode { node: TreeViewNode; parentId?: string; level: number; posInSet: number; setSize: number }
type CheckState = boolean | 'mixed';

/** ARIA tree with single selection or tri-state checkbox selection and a roving keyboard focus. */
export function TreeView({ nodes, value, defaultValue, onValueChange, expanded, defaultExpanded = [], onExpandedChange,
  selectionMode = 'single', checked, defaultChecked = [], onCheckedChange, checkPropagation = 'cascade', rangeSelection = true,
  bulkSelection = true, renderTrailing, getItemInteraction, label = '树形导航', emptyMessage = '没有节点', className }: TreeViewProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpanded));
  const [internalChecked, setInternalChecked] = useState(() => new Set(defaultChecked));
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
  const mutableDescendants = useCallback((id: string) => {
    const result: string[] = [];
    const visit = (node: TreeViewNode) => node.children?.forEach(child => {
      if (child.disabled) return;
      result.push(child.id); visit(child);
    });
    const entry = all.get(id); if (entry) visit(entry.node); return result;
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
      if (children.every(child => next.has(child.id))) next.add(id); else if (!original.has(id)) next.delete(id);
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
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const focusOwned = useRef(false);
  const checkAnchor = useRef<string | undefined>(undefined);
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
  const emitChecked = (source: Set<string>) => {
    const next = normalizeChecked(source);
    if (checked === undefined) setInternalChecked(next);
    onCheckedChange?.([...all.keys()].filter(id => next.has(id)));
  };
  const applyCheck = (source: Set<string>, node: TreeViewNode, next: boolean) => {
    const ids = checkPropagation === 'cascade' ? [node.id, ...mutableDescendants(node.id)] : [node.id];
    for (const id of ids) if (next) source.add(id); else source.delete(id);
    if (!next && checkPropagation === 'cascade') {
      let parentId = all.get(node.id)?.parentId;
      while (parentId) { source.delete(parentId); parentId = all.get(parentId)?.parentId; }
    }
  };
  const toggleCheck = (node: TreeViewNode, withRange = false) => {
    if (node.disabled) return;
    const next = new Set(normalizedChecked); const shouldCheck = checkState(node.id) !== true;
    const anchorIndex = checkAnchor.current ? visible.findIndex(item => item.node.id === checkAnchor.current) : -1;
    const currentIndex = visible.findIndex(item => item.node.id === node.id);
    const targets = withRange && rangeSelection && anchorIndex >= 0
      ? visible.slice(Math.min(anchorIndex, currentIndex), Math.max(anchorIndex, currentIndex) + 1).map(item => item.node).filter(item => !item.disabled)
      : [node];
    for (const target of targets) applyCheck(next, target, shouldCheck);
    checkAnchor.current = node.id; emitChecked(next);
  };
  const toggleAll = () => {
    const enabled = [...all.values()].map(entry => entry.node).filter(node => !node.disabled);
    const shouldCheck = !enabled.every(node => normalizedChecked.has(node.id));
    const next = new Set(normalizedChecked); for (const node of enabled) if (shouldCheck) next.add(node.id); else next.delete(node.id);
    emitChecked(next);
  };
  const focus = useCallback((id: string | undefined) => {
    if (!id) return; setActiveId(id); requestAnimationFrame(() => itemRefs.current.get(id)?.focus());
  }, []);
  useLayoutEffect(() => {
    if (activeId && visible.some(item => item.node.id === activeId)) {
      if (focusOwned.current && itemRefs.current.get(activeId) !== document.activeElement) requestAnimationFrame(() => itemRefs.current.get(activeId)?.focus());
      return;
    }
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
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && selectionMode === 'checkbox' && bulkSelection) toggleAll();
    else if (event.key === 'Enter' || event.key === ' ') selectionMode === 'checkbox' ? toggleCheck(item.node, event.shiftKey) : choose(item.node);
    else return;
    event.preventDefault(); if (target) focus(target);
  };
  const activate = (event: MouseEvent, node: TreeViewNode) => {
    if (event.detail > 1) return;
    focus(node.id); selectionMode === 'checkbox' ? toggleCheck(node, event.shiftKey) : choose(node);
  };
  const render = (items: TreeViewNode[], level: number, parentId?: string) => <>{items.map((node, index) => {
    const branch = Boolean(node.children); const isOpen = branch && open.has(node.id); const state = checkState(node.id);
    const item = { node, parentId, level, posInSet: index + 1, setSize: items.length };
    const interaction = getItemInteraction?.(node);
    return <li key={node.id} ref={element => { if (element) itemRefs.current.set(node.id, element); else itemRefs.current.delete(node.id); }}
      role="treeitem" aria-level={level} aria-posinset={index + 1} aria-setsize={items.length} aria-expanded={branch ? isOpen : undefined}
      aria-selected={selectionMode === 'single' && !node.disabled ? selected === node.id : undefined}
      aria-checked={selectionMode === 'checkbox' && !node.disabled ? state : undefined} aria-disabled={node.disabled || undefined} aria-busy={node.busy || undefined} tabIndex={activeId === node.id ? 0 : -1}
      className="group/treeitem min-w-0 outline-none" draggable={interaction?.draggable} onDragStart={interaction?.onDragStart} onDragOver={interaction?.onDragOver}
      onDragLeave={interaction?.onDragLeave} onDrop={interaction?.onDrop} onDragEnd={interaction?.onDragEnd}
      onFocus={event => { if (event.target !== event.currentTarget) return; focusOwned.current = true; setActiveId(node.id); }} onKeyDown={event => { interaction?.onKeyDown?.(event); if (!event.defaultPrevented) keyDown(event, item); }}>
      <div data-slot="tree-item-row" data-selected={selectionMode === 'single' && selected === node.id || undefined}
        data-checked={selectionMode === 'checkbox' ? state : undefined} data-disabled={node.disabled || undefined} data-drop-position={interaction?.dropPosition}
        title={[node.label, node.description].filter(Boolean).join('\n')}
        className={cx('flex min-h-[var(--rui-control-height-xs)] min-w-0 items-center gap-1 rounded-sm border-y border-transparent px-1 text-sm leading-5 hover:bg-muted group-focus/treeitem:ring-[length:var(--rui-outline-width)] group-focus/treeitem:ring-ring data-[selected=true]:bg-muted data-[selected=true]:font-medium data-[checked=true]:bg-muted data-[disabled=true]:opacity-[var(--rui-opacity-disabled)] data-[drop-position=before]:border-t-primary data-[drop-position=inside]:bg-muted data-[drop-position=inside]:ring-[length:var(--rui-outline-width)] data-[drop-position=inside]:ring-ring data-[drop-position=after]:border-b-primary')}
        onClick={event => activate(event, node)} onDoubleClick={() => { if (branch && !node.disabled) toggle(node.id); }}>
        {branch ? <ChevronRight className={cx('size-3 shrink-0 text-muted-foreground', isOpen && 'rotate-90')} aria-hidden="true" /> : <span className="size-3 shrink-0" aria-hidden="true" />}
        {selectionMode === 'checkbox' && <span aria-hidden="true" data-state={state}
          className="flex size-4 shrink-0 items-center justify-center rounded-[var(--rui-radius-xs)] border border-input text-primary-foreground data-[state=true]:border-primary data-[state=true]:bg-primary data-[state=mixed]:border-primary data-[state=mixed]:bg-primary">
          {state === true ? <Check className="size-3" /> : state === 'mixed' ? <Minus className="size-3" /> : null}
        </span>}
        {branch ? <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : <File className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <span className="min-w-0 truncate">{node.label}</span>{node.description && <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground">{node.description}</span>}
        {renderTrailing?.(node)}
      </div>
      {branch && isOpen && (node.children?.length ? <ul role="group" className="ml-3 min-w-0 border-l border-border pl-1">{render(node.children, level + 1, node.id)}</ul>
        : node.emptyMessage !== null && <ul role="group" className="ml-3 min-w-0 border-l border-border pl-1"><li role="none" className="px-1 py-1 text-xs text-muted-foreground">{node.emptyMessage ?? emptyMessage}</li></ul>)}
    </li>;
  })}</>;
  return nodes.length ? <ul role="tree" aria-label={label} aria-multiselectable={selectionMode === 'checkbox' ? true : false} data-slot="tree-view"
    className={cx('min-w-0 p-1 font-sans text-foreground', className)}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) focusOwned.current = false; }}>
    {render(nodes, 1)}
  </ul> : <div data-slot="tree-view" className={cx('p-[var(--rui-content-padding)] text-sm text-muted-foreground', className)}><span role="status">{emptyMessage}</span></div>;
}
