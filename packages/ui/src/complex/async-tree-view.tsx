import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Spinner } from '../primitives/spinner.js';
import { TreeView, type TreeViewNode, type TreeViewProps } from './tree-view.js';

export interface AsyncTreeViewNode extends TreeViewNode {
  loadable?: boolean;
  children?: AsyncTreeViewNode[];
}
export interface AsyncTreeLoadContext { signal: AbortSignal }
export interface AsyncTreeViewProps extends Omit<TreeViewProps, 'nodes' | 'expanded' | 'defaultExpanded' | 'onExpandedChange' | 'renderTrailing'> {
  nodes: AsyncTreeViewNode[];
  loadChildren: (node: AsyncTreeViewNode, context: AsyncTreeLoadContext) => Promise<AsyncTreeViewNode[]>;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  refreshKey?: string | number;
  loadingLabel?: string;
  retryLabel?: string;
  loadErrorLabel?: (node: AsyncTreeViewNode, error: unknown) => string;
  onResolvedNodesChange?: (nodes: AsyncTreeViewNode[]) => void;
}

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';
interface LoadEntry { status: LoadStatus; children?: AsyncTreeViewNode[]; error?: unknown }

/** TreeView adapter for cancellable node loading, retry, refresh and stale-response isolation. */
export function AsyncTreeView({ nodes, loadChildren, expanded, defaultExpanded = [], onExpandedChange, refreshKey,
  loadingLabel = '正在加载', retryLabel = '重试', loadErrorLabel = (_node, error) => error instanceof Error ? error.message : '加载失败',
  onResolvedNodesChange, emptyMessage = '没有子节点', ...treeProps }: AsyncTreeViewProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [loads, setLoads] = useState(() => new Map<string, LoadEntry>());
  const loadsRef = useRef(loads); loadsRef.current = loads;
  const jobs = useRef(new Map<string, { abort: AbortController }>());
  const currentExpanded = expanded ?? internalExpanded;
  const mergedNodes = useMemo(() => {
    const merge = (items: AsyncTreeViewNode[]): AsyncTreeViewNode[] => items.map(node => {
      const loaded = loads.get(node.id)?.children;
      const children = loaded ?? node.children;
      return { ...node, children: node.loadable || children !== undefined ? merge(children ?? []) : undefined };
    });
    return merge(nodes);
  }, [loads, nodes]);
  useEffect(() => onResolvedNodesChange?.(mergedNodes), [mergedNodes, onResolvedNodesChange]);
  const nodeIndex = useMemo(() => {
    const map = new Map<string, AsyncTreeViewNode>();
    const visit = (items: AsyncTreeViewNode[]) => items.forEach(node => { map.set(node.id, node); if (node.children) visit(node.children); });
    visit(mergedNodes); return map;
  }, [mergedNodes]);
  const startLoad = useCallback((id: string, force = false) => {
    const node = nodeIndex.get(id); if (!node?.loadable) return;
    const previous = loadsRef.current.get(id);
    if (!force && (previous?.status === 'loaded' || previous?.status === 'loading' || previous?.status === 'error')) return;
    jobs.current.get(id)?.abort.abort();
    const job = { abort: new AbortController() }; jobs.current.set(id, job);
    setLoads(current => { const next = new Map(current); next.set(id, { ...current.get(id), status: 'loading', error: undefined }); return next; });
    void Promise.resolve().then(() => loadChildren(node, { signal: job.abort.signal })).then(children => {
      if (jobs.current.get(id) !== job || job.abort.signal.aborted) return;
      jobs.current.delete(id);
      setLoads(current => { const next = new Map(current); next.set(id, { status: 'loaded', children }); return next; });
    }).catch(error => {
      if (jobs.current.get(id) !== job || job.abort.signal.aborted) return;
      jobs.current.delete(id);
      setLoads(current => { const next = new Map(current); next.set(id, { ...current.get(id), status: 'error', error }); return next; });
    });
  }, [loadChildren, nodeIndex]);
  useEffect(() => {
    for (const id of currentExpanded) startLoad(id);
  }, [currentExpanded, startLoad]);
  useEffect(() => {
    const expandedSet = new Set(currentExpanded);
    for (const [id, job] of jobs.current) if (!expandedSet.has(id)) {
      job.abort.abort(); jobs.current.delete(id);
      setLoads(current => { const updated = new Map(current); const entry = updated.get(id); if (entry?.status === 'loading') updated.set(id, entry.children ? { status: 'loaded', children: entry.children } : { status: 'idle' }); return updated; });
    }
  }, [currentExpanded]);
  const previousRefresh = useRef(refreshKey);
  useEffect(() => {
    if (Object.is(previousRefresh.current, refreshKey)) return;
    previousRefresh.current = refreshKey;
    for (const id of currentExpanded) startLoad(id, true);
  }, [currentExpanded, refreshKey, startLoad]);
  useEffect(() => () => { for (const job of jobs.current.values()) job.abort.abort(); jobs.current.clear(); }, []);
  const changeExpanded = (next: string[]) => {
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };
  const displayNodes = useMemo(() => {
    const map = (items: AsyncTreeViewNode[]): TreeViewNode[] => items.map(node => {
      const entry = loads.get(node.id);
      return { ...node, busy: entry?.status === 'loading', emptyMessage: entry?.status === 'loading' || entry?.status === 'error' ? null : emptyMessage, children: node.children ? map(node.children) : node.children };
    });
    return map(mergedNodes);
  }, [emptyMessage, loads, mergedNodes]);
  return <TreeView {...treeProps} nodes={displayNodes} expanded={currentExpanded} onExpandedChange={changeExpanded} emptyMessage={emptyMessage}
    renderTrailing={node => {
      const asyncNode = nodeIndex.get(node.id); const entry = loads.get(node.id);
      if (!asyncNode?.loadable || !entry || entry.status === 'idle' || entry.status === 'loaded') return null;
      if (entry.status === 'loading') return <span data-load-state="loading" role="status" className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Spinner className="size-3" aria-hidden="true" />{loadingLabel}</span>;
      return <span data-load-state="error" className="ml-auto inline-flex min-w-0 shrink-0 items-center gap-1 text-xs text-destructive" role="alert"><AlertCircle className="size-3 shrink-0" aria-hidden="true" /><span className="max-w-40 truncate">{loadErrorLabel(asyncNode, entry.error)}</span><Button variant="ghost" size="xs" onClick={event => { event.stopPropagation(); startLoad(node.id, true); }} onKeyDown={event => event.stopPropagation()}>{retryLabel}</Button></span>;
    }} />;
}
