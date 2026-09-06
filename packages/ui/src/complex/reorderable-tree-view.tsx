import { useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { TreeView, type TreeViewDropPosition, type TreeViewNode, type TreeViewProps } from './tree-view.js';

export interface TreeMoveIntent {
  sourceTreeId: string;
  sourceId: string;
  targetTreeId: string;
  targetId: string;
  position: TreeViewDropPosition;
}
export interface ReorderableTreeViewProps extends Omit<TreeViewProps, 'nodes' | 'expanded' | 'defaultExpanded' | 'onExpandedChange' | 'getItemInteraction'> {
  nodes: TreeViewNode[];
  treeId: string;
  scope?: string;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  onMove: (intent: TreeMoveIntent) => void;
  canDrop?: (intent: TreeMoveIntent) => boolean;
  moveAnnouncement?: (intent: TreeMoveIntent) => string;
}

interface DragPayload { treeId: string; nodeId: string; scope: string }
const transferType = 'application/x-reito-tree-node';
let activeDrag: DragPayload | undefined;

function containsId(nodes: TreeViewNode[], id: string): boolean {
  return nodes.some(node => node.id === id || Boolean(node.children && containsId(node.children, id)));
}
function findNode(nodes: TreeViewNode[], id: string): TreeViewNode | undefined {
  for (const node of nodes) { if (node.id === id) return node; const nested = node.children && findNode(node.children, id); if (nested) return nested; }
}
function removeNode(nodes: TreeViewNode[], id: string): { nodes: TreeViewNode[]; node?: TreeViewNode } {
  let removed: TreeViewNode | undefined;
  const next = nodes.flatMap(node => {
    if (node.id === id) { removed = node; return []; }
    if (!node.children) return [node];
    const childResult = removeNode(node.children, id); if (childResult.node) removed = childResult.node;
    return [{ ...node, children: childResult.nodes }];
  });
  return { nodes: next, node: removed };
}
function insertNode(nodes: TreeViewNode[], node: TreeViewNode, targetId: string, position: TreeViewDropPosition): TreeViewNode[] | undefined {
  if (position === 'inside') return nodes.map(target => target.id === targetId ? { ...target, children: [...(target.children ?? []), node] }
    : target.children ? { ...target, children: insertNode(target.children, node, targetId, position) ?? target.children } : target);
  const directIndex = nodes.findIndex(target => target.id === targetId);
  if (directIndex >= 0) { const next = [...nodes]; next.splice(directIndex + (position === 'after' ? 1 : 0), 0, node); return next; }
  for (let index = 0; index < nodes.length; index += 1) if (nodes[index].children && containsId(nodes[index].children!, targetId)) {
    const children = insertNode(nodes[index].children!, node, targetId, position); if (!children) return;
    const next = [...nodes]; next[index] = { ...nodes[index], children }; return next;
  }
}

/** Applies a validated move within one tree and returns null for cycles or missing nodes. */
export function moveTreeNode(nodes: TreeViewNode[], intent: TreeMoveIntent): TreeViewNode[] | null {
  if (intent.sourceTreeId !== intent.targetTreeId || intent.sourceId === intent.targetId) return null;
  const source = findNode(nodes, intent.sourceId); if (!source || !findNode(nodes, intent.targetId) || containsId(source.children ?? [], intent.targetId)) return null;
  const removed = removeNode(nodes, intent.sourceId); if (!removed.node) return null;
  return insertNode(removed.nodes, removed.node, intent.targetId, intent.position) ?? null;
}

/** Moves a node between trees and rejects target ID collisions. */
export function transferTreeNode(source: TreeViewNode[], target: TreeViewNode[], intent: TreeMoveIntent): { source: TreeViewNode[]; target: TreeViewNode[] } | null {
  if (intent.sourceTreeId === intent.targetTreeId) return null;
  const removed = removeNode(source, intent.sourceId); if (!removed.node || !findNode(target, intent.targetId)) return null;
  const ids: string[] = []; const collect = (items: TreeViewNode[]) => items.forEach(node => { ids.push(node.id); if (node.children) collect(node.children); }); collect([removed.node]);
  if (ids.some(id => containsId(target, id))) return null;
  const inserted = insertNode(target, removed.node, intent.targetId, intent.position); return inserted ? { source: removed.nodes, target: inserted } : null;
}

/** Controlled tree reorder surface with pointer drag/drop and Alt+Arrow keyboard equivalents. */
export function ReorderableTreeView({ nodes, treeId, scope = 'default', expanded, defaultExpanded = [], onExpandedChange, onMove, canDrop,
  moveAnnouncement = intent => `已移动 ${intent.sourceId} 到 ${intent.targetId} ${intent.position}`, ...treeProps }: ReorderableTreeViewProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [drop, setDrop] = useState<{ targetId: string; position: TreeViewDropPosition }>();
  const [announcement, setAnnouncement] = useState('');
  const currentExpanded = expanded ?? internalExpanded;
  const nodeIndex = useMemo(() => { const map = new Map<string, TreeViewNode>(); const visit = (items: TreeViewNode[]) => items.forEach(node => { map.set(node.id, node); if (node.children) visit(node.children); }); visit(nodes); return map; }, [nodes]);
  const parentIndex = useMemo(() => { const map = new Map<string, { parentId?: string; siblings: TreeViewNode[]; index: number }>(); const visit = (items: TreeViewNode[], parentId?: string) => items.forEach((node, index) => { map.set(node.id, { parentId, siblings: items, index }); if (node.children) visit(node.children, node.id); }); visit(nodes); return map; }, [nodes]);
  const latestPayload = useRef<DragPayload | undefined>(undefined);
  const changeExpanded = (next: string[]) => { if (expanded === undefined) setInternalExpanded(next); onExpandedChange?.(next); };
  const valid = (intent: TreeMoveIntent) => {
    const target = nodeIndex.get(intent.targetId); if (!target || target.disabled || intent.sourceId === intent.targetId) return false;
    if (intent.sourceTreeId === treeId) { const source = nodeIndex.get(intent.sourceId); if (!source || containsId(source.children ?? [], intent.targetId)) return false; }
    return canDrop?.(intent) ?? true;
  };
  const commit = (intent: TreeMoveIntent) => {
    if (!valid(intent)) { setAnnouncement('无法移动到此位置'); return; }
    if (intent.position === 'inside' && !currentExpanded.includes(intent.targetId)) changeExpanded([...currentExpanded, intent.targetId]);
    onMove(intent); setAnnouncement(moveAnnouncement(intent)); setDrop(undefined);
  };
  const keyboardMove = (event: KeyboardEvent<HTMLLIElement>, node: TreeViewNode) => {
    if (!event.altKey || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const location = parentIndex.get(node.id); if (!location) return;
    let targetId: string | undefined; let position: TreeViewDropPosition = 'before';
    if (event.key === 'ArrowUp') { targetId = location.siblings[location.index - 1]?.id; position = 'before'; }
    else if (event.key === 'ArrowDown') { targetId = location.siblings[location.index + 1]?.id; position = 'after'; }
    else if (event.key === 'ArrowRight') { targetId = location.siblings[location.index - 1]?.id; position = 'inside'; }
    else if (location.parentId) { targetId = location.parentId; position = 'after'; }
    event.preventDefault(); event.stopPropagation();
    if (!targetId) { setAnnouncement('当前方向没有可用位置'); return; }
    commit({ sourceTreeId: treeId, sourceId: node.id, targetTreeId: treeId, targetId, position });
  };
  const payloadFrom = (event: DragEvent<HTMLLIElement>) => {
    try { return JSON.parse(event.dataTransfer.getData(transferType)) as DragPayload; } catch { return latestPayload.current ?? activeDrag; }
  };
  return <><TreeView {...treeProps} nodes={nodes} expanded={currentExpanded} onExpandedChange={changeExpanded} getItemInteraction={node => ({
    draggable: !node.disabled,
    dropPosition: drop?.targetId === node.id ? drop.position : undefined,
    onKeyDown: event => keyboardMove(event, node),
    onDragStart: event => { event.stopPropagation(); const payload = { treeId, nodeId: node.id, scope }; latestPayload.current = payload; activeDrag = payload; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData(transferType, JSON.stringify(payload)); },
    onDragOver: event => { event.stopPropagation(); const payload = payloadFrom(event); if (!payload || payload.scope !== scope) return; const row = event.currentTarget.firstElementChild?.getBoundingClientRect(); if (!row) return; const ratio = (event.clientY - row.top) / row.height; const position: TreeViewDropPosition = ratio < 0.28 ? 'before' : ratio > 0.72 ? 'after' : 'inside'; const intent = { sourceTreeId: payload.treeId, sourceId: payload.nodeId, targetTreeId: treeId, targetId: node.id, position }; if (!valid(intent)) return; event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDrop({ targetId: node.id, position }); },
    onDragLeave: event => { event.stopPropagation(); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDrop(undefined); },
    onDrop: event => { event.preventDefault(); event.stopPropagation(); const payload = payloadFrom(event); if (payload && payload.scope === scope && drop?.targetId === node.id) commit({ sourceTreeId: payload.treeId, sourceId: payload.nodeId, targetTreeId: treeId, targetId: node.id, position: drop.position }); },
    onDragEnd: event => { event.stopPropagation(); activeDrag = undefined; latestPayload.current = undefined; setDrop(undefined); },
  })} /><span role="status" aria-live="polite" className="sr-only">{announcement}</span></>;
}
