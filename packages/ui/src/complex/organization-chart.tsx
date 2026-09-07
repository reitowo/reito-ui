import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';

export interface OrganizationChartNode<T = unknown> {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  data?: T;
  children?: OrganizationChartNode<T>[];
}

export interface OrganizationChartRenderState {
  depth: number;
  selected: boolean;
  collapsed: boolean;
  disabled: boolean;
}

export interface OrganizationChartProps<T = unknown> {
  nodes: OrganizationChartNode<T>[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedIdChange?: (id: string, node: OrganizationChartNode<T>) => void;
  collapsedIds?: string[];
  defaultCollapsedIds?: string[];
  onCollapsedIdsChange?: (ids: string[], node: OrganizationChartNode<T>) => void;
  renderNode?: (node: OrganizationChartNode<T>, state: OrganizationChartRenderState) => ReactNode;
  label?: string;
  emptyLabel?: string;
  collapsible?: boolean;
  disabled?: boolean;
  className?: string;
}

interface VisibleNode<T> {
  node: OrganizationChartNode<T>;
  depth: number;
  parentId?: string;
}

function flattenVisible<T>(nodes: OrganizationChartNode<T>[], collapsed: Set<string>, collapsible: boolean, depth = 1, parentId?: string, output: VisibleNode<T>[] = []) {
  nodes.forEach(node => {
    output.push({ node, depth, parentId });
    if (node.children?.length && (!collapsible || !collapsed.has(node.id))) flattenVisible(node.children, collapsed, collapsible, depth + 1, node.id, output);
  });
  return output;
}

function collectParentIds<T>(nodes: OrganizationChartNode<T>[], parentId?: string, output = new Map<string, string | undefined>()) {
  for (const node of nodes) {
    output.set(node.id, parentId);
    if (node.children?.length) collectParentIds(node.children, node.id, output);
  }
  return output;
}

function collectBranchIds<T>(nodes: OrganizationChartNode<T>[], output: string[] = []) {
  for (const node of nodes) {
    if (node.children?.length) {
      output.push(node.id);
      collectBranchIds(node.children, output);
    }
  }
  return output;
}

export function OrganizationChart<T>({
  nodes,
  selectedId,
  defaultSelectedId = null,
  onSelectedIdChange,
  collapsedIds,
  defaultCollapsedIds = [],
  onCollapsedIdsChange,
  renderNode,
  label = '组织结构图',
  emptyLabel = '没有可展示的层级关系',
  collapsible = true,
  disabled = false,
  className,
}: OrganizationChartProps<T>) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(defaultSelectedId);
  const [internalCollapsedIds, setInternalCollapsedIds] = useState(defaultCollapsedIds);
  const currentSelectedId = selectedId === undefined ? internalSelectedId : selectedId;
  const currentCollapsedIds = collapsedIds ?? internalCollapsedIds;
  const collapsed = useMemo(() => new Set(currentCollapsedIds), [currentCollapsedIds]);
  const visible = useMemo(() => flattenVisible(nodes, collapsed, collapsible), [collapsed, collapsible, nodes]);
  const parents = useMemo(() => collectParentIds(nodes), [nodes]);
  const branches = useMemo(() => collectBranchIds(nodes), [nodes]);
  const [focusedId, setFocusedId] = useState(() => selectedId ?? defaultSelectedId ?? nodes[0]?.id ?? '');
  const nodeRefs = useRef(new Map<string, HTMLLIElement>());
  const focusOwned = useRef(false);

  useLayoutEffect(() => {
    if (visible.some(entry => entry.node.id === focusedId)) return;
    let candidate = parents.get(focusedId);
    while (candidate && !visible.some(entry => entry.node.id === candidate)) candidate = parents.get(candidate);
    candidate ??= currentSelectedId && visible.some(entry => entry.node.id === currentSelectedId) ? currentSelectedId : visible[0]?.node.id;
    setFocusedId(candidate ?? '');
    if (focusOwned.current && candidate) requestAnimationFrame(() => nodeRefs.current.get(candidate)?.focus());
  }, [currentSelectedId, focusedId, parents, visible]);

  function focusNode(id: string) {
    setFocusedId(id);
    requestAnimationFrame(() => nodeRefs.current.get(id)?.focus());
  }

  function select(node: OrganizationChartNode<T>) {
    if (disabled || node.disabled) return;
    if (selectedId === undefined) setInternalSelectedId(node.id);
    if (node.id !== currentSelectedId) onSelectedIdChange?.(node.id, node);
  }

  function setCollapsed(node: OrganizationChartNode<T>, next: boolean) {
    if (!collapsible || disabled || node.disabled || !node.children?.length) return;
    const ids = next ? [...new Set([...currentCollapsedIds, node.id])] : currentCollapsedIds.filter(id => id !== node.id);
    if (collapsedIds === undefined) setInternalCollapsedIds(ids);
    onCollapsedIdsChange?.(ids, node);
  }

  function onNodeKeyDown(event: KeyboardEvent<HTMLLIElement>, node: OrganizationChartNode<T>) {
    if (event.target !== event.currentTarget) return;
    const index = visible.findIndex(entry => entry.node.id === node.id);
    let target: string | undefined;
    if (event.key === 'ArrowDown') target = visible[Math.min(visible.length - 1, index + 1)]?.node.id;
    else if (event.key === 'ArrowUp') target = visible[Math.max(0, index - 1)]?.node.id;
    else if (event.key === 'Home') target = visible[0]?.node.id;
    else if (event.key === 'End') target = visible.at(-1)?.node.id;
    else if (event.key === 'ArrowRight' && node.children?.length) {
      if (collapsible && collapsed.has(node.id)) setCollapsed(node, false);
      else target = node.children[0]?.id;
    } else if (event.key === 'ArrowLeft') {
      if (node.children?.length && collapsible && !collapsed.has(node.id)) setCollapsed(node, true);
      else target = parents.get(node.id);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select(node);
      return;
    } else return;
    event.preventDefault();
    if (target) focusNode(target);
  }

  function releaseFocus(event: FocusEvent<HTMLElement>) {
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) focusOwned.current = false;
  }

  function renderBranches(branchNodes: OrganizationChartNode<T>[], depth: number): ReactNode {
    return <ul role={depth === 1 ? 'tree' : 'group'} aria-label={depth === 1 ? label : undefined} className={cn('flex w-max min-w-full items-start justify-center', depth > 1 && branchNodes.length > 1 && 'border-t border-border')}>
      {branchNodes.map((node, index) => {
        const hasChildren = Boolean(node.children?.length);
        const isCollapsed = collapsible && collapsed.has(node.id);
        const isSelected = currentSelectedId === node.id;
        const isDisabled = disabled || Boolean(node.disabled);
        return <li
          ref={element => { if (element) nodeRefs.current.set(node.id, element); else nodeRefs.current.delete(node.id); }}
          key={node.id}
          role="treeitem"
          aria-label={[node.label, node.description].filter(Boolean).join(', ')}
          aria-level={depth}
          aria-posinset={index + 1}
          aria-setsize={branchNodes.length}
          aria-selected={isDisabled ? undefined : isSelected}
          aria-expanded={hasChildren ? !isCollapsed : undefined}
          aria-disabled={isDisabled || undefined}
          tabIndex={node.id === focusedId ? 0 : -1}
          onFocus={event => { if (event.target === event.currentTarget) setFocusedId(node.id); }}
          onKeyDown={event => onNodeKeyDown(event, node)}
          className={cn('group/node relative flex flex-col items-center px-[var(--rui-space-2)] pt-[var(--rui-space-3)] outline-none', depth === 1 && 'pt-0', depth > 1 && 'before:absolute before:top-0 before:left-1/2 before:h-[var(--rui-space-3)] before:w-px before:-translate-x-1/2 before:bg-border')}
        >
          <div
            data-slot="organization-chart-node"
            data-selected={isSelected || undefined}
            data-disabled={isDisabled || undefined}
            title={node.description ? `${node.label} · ${node.description}` : node.label}
            onClick={() => { focusNode(node.id); select(node); }}
            className={cn('flex min-h-[var(--rui-row-height)] w-40 flex-col justify-center rounded-md border border-border bg-card px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-left text-sm transition-colors group-focus-visible/node:border-ring group-focus-visible/node:ring-[length:var(--rui-outline-width)] group-focus-visible/node:ring-ring/50', isSelected && 'border-ring bg-accent/40', isDisabled ? 'cursor-not-allowed opacity-[var(--rui-opacity-disabled)]' : 'cursor-pointer hover:bg-muted/60')}
          >{renderNode ? renderNode(node, { depth, selected: isSelected, collapsed: isCollapsed, disabled: isDisabled }) : <><span className="truncate font-medium">{node.label}</span>{node.description && <span className="mt-[var(--rui-space-1)] line-clamp-2 text-xs leading-relaxed text-muted-foreground">{node.description}</span>}</>}</div>
          {hasChildren && collapsible && <Button type="button" variant="ghost" size="icon-xs" aria-label={`${isCollapsed ? '展开' : '折叠'} ${node.label}`} aria-expanded={!isCollapsed} disabled={isDisabled} onClick={event => { event.stopPropagation(); setCollapsed(node, !isCollapsed); focusNode(node.id); }} className="mt-[var(--rui-space-1)] rounded-full">{isCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}</Button>}
          {hasChildren && !isCollapsed && <><span aria-hidden="true" className="h-[var(--rui-space-3)] w-px bg-border" />{renderBranches(node.children!, depth + 1)}</>}
        </li>;
      })}
    </ul>;
  }

  if (!nodes.length) return <section data-slot="organization-chart" role="region" aria-label={label} className={cn('rounded-lg border border-dashed border-border p-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground', className)}>{emptyLabel}</section>;

  return <section data-slot="organization-chart" role="region" aria-label={`${label}视图`} onFocusCapture={() => { focusOwned.current = true; }} onBlur={releaseFocus} className={cn('min-w-0 overflow-x-auto rounded-lg border border-border p-[var(--rui-content-padding)]', className)}>
    {renderBranches(nodes, 1)}
    <span className="sr-only">{branches.length} 个可折叠节点</span>
  </section>;
}
