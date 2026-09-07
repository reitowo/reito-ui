import * as React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../primitives/input-group.js';
import { Label } from '../primitives/label.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { cn } from '../lib/utils.js';
import { AsyncTreeView, type AsyncTreeLoadContext, type AsyncTreeViewNode } from './async-tree-view.js';
import { TreeView, type TreeViewCheckPropagation, type TreeViewNode, type TreeViewSelectionMode } from './tree-view.js';

export interface TreeSelectProps {
  nodes: AsyncTreeViewNode[];
  selectionMode?: TreeViewSelectionMode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string | undefined) => void;
  checked?: string[];
  defaultChecked?: string[];
  onCheckedChange?: (ids: string[]) => void;
  checkPropagation?: TreeViewCheckPropagation;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  loadChildren?: (node: AsyncTreeViewNode, context: AsyncTreeLoadContext) => Promise<AsyncTreeViewNode[]>;
  refreshKey?: string | number;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  clearLabel?: string;
  doneLabel?: string;
  loadingLabel?: string;
  retryLabel?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  name?: string;
  form?: string;
  id?: string;
  className?: string;
}

function visitNodes(nodes: TreeViewNode[], visit: (node: TreeViewNode) => void) {
  for (const node of nodes) {
    visit(node);
    if (node.children) visitNodes(node.children, visit);
  }
}

function nodeMap(nodes: TreeViewNode[]) {
  const map = new Map<string, TreeViewNode>();
  visitNodes(nodes, node => map.set(node.id, node));
  return map;
}

function matchingNodeIds(nodes: TreeViewNode[], query: string) {
  const visible = new Set<string>();
  const addSubtree = (node: TreeViewNode) => {
    visible.add(node.id);
    node.children?.forEach(addSubtree);
  };
  const match = (node: TreeViewNode): boolean => {
    if (`${node.label} ${node.description ?? ''}`.toLocaleLowerCase().includes(query)) {
      addSubtree(node);
      return true;
    }
    const childMatch = node.children?.map(match).some(Boolean) ?? false;
    if (childMatch) visible.add(node.id);
    return childMatch;
  };
  nodes.forEach(match);
  return [...visible];
}

function branchIds(nodes: TreeViewNode[], visible: Set<string>) {
  const branches: string[] = [];
  visitNodes(nodes, node => { if (visible.has(node.id) && node.children) branches.push(node.id); });
  return branches;
}

/** Searchable popover selector that preserves TreeView selection and async loading semantics. */
export function TreeSelect({
  nodes,
  selectionMode = 'single',
  value,
  defaultValue,
  onValueChange,
  checked,
  defaultChecked = [],
  onCheckedChange,
  checkPropagation = 'cascade',
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  loadChildren,
  refreshKey,
  query,
  defaultQuery = '',
  onQueryChange,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  required = false,
  label = '选择节点',
  placeholder = '请选择',
  searchLabel = '搜索节点',
  searchPlaceholder = '搜索名称或说明',
  emptyMessage = '没有匹配节点',
  clearLabel = '清除',
  doneLabel = '完成',
  loadingLabel = '正在加载',
  retryLabel = '重试',
  description,
  error,
  name,
  form,
  id: suppliedId,
  className,
}: TreeSelectProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const [internalQuery, setInternalQuery] = React.useState(defaultQuery);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [resolvedNodes, setResolvedNodes] = React.useState<AsyncTreeViewNode[]>(nodes);
  const selected = value === undefined ? internalValue : value;
  const selectedChecked = checked === undefined ? internalChecked : checked;
  const currentExpanded = expanded === undefined ? internalExpanded : expanded;
  const currentQuery = query === undefined ? internalQuery : query;
  const isOpen = open === undefined ? internalOpen : open;
  const normalizedQuery = currentQuery.trim().toLocaleLowerCase();

  React.useEffect(() => { if (!normalizedQuery) setResolvedNodes(nodes); }, [nodes, normalizedQuery]);
  const index = React.useMemo(() => nodeMap(resolvedNodes), [resolvedNodes]);
  const visibleNodeIds = React.useMemo(() => normalizedQuery ? matchingNodeIds(resolvedNodes, normalizedQuery) : undefined, [normalizedQuery, resolvedNodes]);
  const displayExpanded = React.useMemo(() => visibleNodeIds ? [...new Set([...currentExpanded, ...branchIds(resolvedNodes, new Set(visibleNodeIds))])] : currentExpanded, [currentExpanded, resolvedNodes, visibleNodeIds]);
  const handleResolvedNodesChange = React.useCallback((next: AsyncTreeViewNode[]) => { if (!normalizedQuery) setResolvedNodes(next); }, [normalizedQuery]);
  const chosenNodes = selectionMode === 'checkbox' ? selectedChecked.map(item => index.get(item)).filter((item): item is TreeViewNode => Boolean(item)) : selected ? [index.get(selected)].filter((item): item is TreeViewNode => Boolean(item)) : [];
  const leafChoices = chosenNodes.filter(node => !node.children?.length);
  const triggerText = selectionMode === 'checkbox'
    ? leafChoices.length === 1 ? leafChoices[0].label : leafChoices.length > 1 ? `已选择 ${leafChoices.length} 项` : selectedChecked.length ? `已选择 ${selectedChecked.length} 项` : placeholder
    : chosenNodes[0]?.label ?? placeholder;
  const describedBy = [description ? `${id}-description` : undefined, error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;

  function changeOpen(next: boolean) {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }
  function changeQuery(next: string) {
    if (query === undefined) setInternalQuery(next);
    onQueryChange?.(next);
  }
  function changeExpanded(next: string[]) {
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  }
  function choose(next: string) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
    changeOpen(false);
  }
  function changeChecked(next: string[]) {
    if (checked === undefined) setInternalChecked(next);
    onCheckedChange?.(next);
  }
  function clear() {
    if (selectionMode === 'checkbox') changeChecked([]);
    else {
      if (value === undefined) setInternalValue(undefined);
      onValueChange?.(undefined);
    }
  }

  const treeProps = {
    selectionMode,
    value: selected,
    onValueChange: choose,
    checked: selectedChecked,
    onCheckedChange: changeChecked,
    checkPropagation,
    expanded: displayExpanded,
    onExpandedChange: changeExpanded,
    visibleNodeIds,
    label,
    emptyMessage,
  } as const;

  return <div data-slot="tree-select" data-invalid={error ? true : undefined} className={cn('grid min-w-0 gap-[var(--rui-space-2)]', className)}>
    <Label htmlFor={`${id}-trigger`}>{label}</Label>
    <Popover open={isOpen} onOpenChange={changeOpen}>
      <PopoverTrigger render={<Button id={`${id}-trigger`} type="button" role="combobox" aria-autocomplete="none" variant="outline" disabled={disabled} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className="w-full min-w-0 justify-between font-normal" />}><span className={cn('truncate', chosenNodes.length === 0 && 'text-muted-foreground')}>{triggerText}</span><ChevronDown aria-hidden="true" className="shrink-0" /></PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)]">
        <PopoverTitle className="sr-only">{label}</PopoverTitle>
        <InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput type="search" aria-label={searchLabel} placeholder={searchPlaceholder} value={currentQuery} onChange={event => changeQuery(event.target.value)} /></InputGroup>
        <div className="max-h-64 min-w-0 overflow-auto rounded-lg border border-border">
          {loadChildren
            ? <AsyncTreeView {...treeProps} nodes={nodes} loadChildren={loadChildren} refreshKey={refreshKey} loadingLabel={loadingLabel} retryLabel={retryLabel} onResolvedNodesChange={handleResolvedNodesChange} />
            : <TreeView {...treeProps} nodes={nodes} />}
        </div>
        <div className="flex items-center justify-between gap-[var(--rui-space-2)] border-t border-border pt-[var(--rui-content-gap-sm)]"><Button type="button" variant="ghost" size="sm" disabled={selectionMode === 'checkbox' ? selectedChecked.length === 0 : !selected} onClick={clear}>{clearLabel}</Button>{selectionMode === 'checkbox' && <Button type="button" size="sm" onClick={() => changeOpen(false)}>{doneLabel}</Button>}</div>
      </PopoverContent>
    </Popover>
    {name && (selectionMode === 'checkbox' ? selectedChecked.map(item => <input key={item} type="hidden" name={name} form={form} value={item} disabled={disabled} />) : <input type="hidden" name={name} form={form} value={selected ?? ''} disabled={disabled} />)}
    {description && <p id={`${id}-description`} className="text-sm text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
