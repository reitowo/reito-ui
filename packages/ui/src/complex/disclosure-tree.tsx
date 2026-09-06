import { useState } from 'react';
import { ChevronRight, File, Folder } from 'lucide-react';
import { cx } from './shared.js';

export interface DisclosureNode { id: string; label: string; description?: string; disabled?: boolean; children?: DisclosureNode[]; }
export interface DisclosureTreeProps {
  nodes: DisclosureNode[];
  value?: string;
  onValueChange?: (id: string) => void;
  defaultExpanded?: string[];
  label?: string;
  emptyMessage?: string;
  className?: string;
}

/** Native disclosure list: Tab traverses rows; Enter/Space toggles summaries. This is not an ARIA tree widget. */
export function DisclosureTree({ nodes, value, onValueChange, defaultExpanded = [], label = '文件目录', emptyMessage = '目录为空', className }: DisclosureTreeProps) {
  const [internalValue, setInternalValue] = useState<string>();
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));
  const selected = value ?? internalValue;
  const rowClass = 'flex min-h-[var(--rui-control-height-xs)] min-w-0 w-full items-center gap-1 rounded-sm px-1 text-left text-sm leading-5 outline-none hover:bg-muted focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring';
  function select(id: string) { if (value === undefined) setInternalValue(id); onValueChange?.(id); }
  function labelContent(node: DisclosureNode) {
    return <span className="flex min-w-0 flex-1 items-center gap-2"><span className="min-w-0 truncate">{node.label}</span>{node.description && <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground">{node.description}</span>}</span>;
  }
  function renderNodes(items: DisclosureNode[]) {
    return <ul className="min-w-0">{items.map(node => <li key={node.id} className="min-w-0">
      {node.children ? <details className="min-w-0" open={expanded.has(node.id)} onToggle={event => {
        const open = event.currentTarget.open;
        setExpanded(previous => { if (previous.has(node.id) === open) return previous; const next = new Set(previous); if (open) next.add(node.id); else next.delete(node.id); return next; });
      }}>
        <summary title={[node.label, node.description].filter(Boolean).join('\n')} className={cx(rowClass, 'cursor-pointer list-none [&::-webkit-details-marker]:hidden')}><ChevronRight className={cx('size-3 shrink-0 text-muted-foreground', expanded.has(node.id) && 'rotate-90')} aria-hidden="true" /><Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{labelContent(node)}</summary>
        <div className="ml-3 min-w-0 border-l border-border pl-1">{node.children.length ? renderNodes(node.children) : <p className="px-1 py-1 text-xs text-muted-foreground">{emptyMessage}</p>}</div>
      </details> : <button type="button" title={[node.label, node.description].filter(Boolean).join('\n')} disabled={node.disabled} aria-pressed={selected === node.id} onClick={() => select(node.id)} className={cx(rowClass, 'disabled:pointer-events-none disabled:opacity-50', selected === node.id && 'bg-muted font-medium')}>
        <span className="size-3 shrink-0" aria-hidden="true" /><File className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{labelContent(node)}
      </button>}
    </li>)}</ul>;
  }
  return <nav aria-label={label} data-slot="disclosure-tree" className={cx('min-w-0 p-1 font-sans text-foreground', className)}>{nodes.length ? renderNodes(nodes) : <p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">{emptyMessage}</p>}</nav>;
}
