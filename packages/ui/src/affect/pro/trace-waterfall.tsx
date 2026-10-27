import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDollars, formatDuration, useTickingNow } from '../shared.js';

export type TraceKind = 'agent' | 'subagent' | 'llm' | 'tool';
export type TraceSpan = {
  id: string;
  name: string;
  kind: TraceKind;
  status: 'running' | 'done' | 'failed';
  start: number;
  end?: number;
  detail?: string;
  icon?: ReactNode;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  cost?: number;
  input?: string;
  output?: string;
  error?: string;
  children?: TraceSpan[];
};
export type TraceWaterfallProps = {
  root: TraceSpan;
  now?: number;
  startedAt?: number;
  collapsed?: string[];
  defaultCollapsed?: string[];
  onCollapsedChange?: (collapsed: string[]) => void;
  openId?: string | null;
  defaultOpenId?: string | null;
  onOpenChange?: (id: string | null, span?: TraceSpan) => void;
  markSlowest?: boolean;
  minRange?: number;
  formatCost?: (amount: number) => string;
  title?: string;
  className?: string;
};

function flatten(span: TraceSpan, depth: number, hidden: Set<string>, list: { span: TraceSpan; depth: number }[]) {
  list.push({ span, depth });
  if (!hidden.has(span.id)) span.children?.forEach((child) => flatten(child, depth + 1, hidden, list));
  return list;
}

function rollup(span: TraceSpan): { cost: number; tokens: number; end: number } {
  const kids = span.children?.map(rollup) ?? [];
  return {
    cost: (span.cost ?? 0) + kids.reduce((sum, item) => sum + item.cost, 0),
    tokens: (span.tokensIn ?? 0) + (span.tokensOut ?? 0) + kids.reduce((sum, item) => sum + item.tokens, 0),
    end: Math.max(span.end ?? span.start, ...kids.map((item) => item.end), span.start),
  };
}

function findSpan(span: TraceSpan, id: string): TraceSpan | undefined {
  if (span.id === id) return span;
  return span.children?.map((child) => findSpan(child, id)).find(Boolean);
}

const kindTone: Record<TraceKind, string> = {
  agent: 'bg-muted-foreground/40',
  subagent: 'bg-muted-foreground/30',
  llm: 'bg-primary/50',
  tool: 'bg-success/50',
};

/** Recreated from public Trace Waterfall docs. Not Pro source. */
export function TraceWaterfall({
  root,
  now,
  startedAt,
  collapsed,
  defaultCollapsed = [],
  onCollapsedChange,
  openId,
  defaultOpenId = null,
  onOpenChange,
  markSlowest = true,
  minRange,
  formatCost = formatDollars,
  title = '轨迹',
  className,
}: TraceWaterfallProps) {
  const [internalFold, setInternalFold] = useState(defaultCollapsed);
  const [internalOpen, setInternalOpen] = useState<string | null>(defaultOpenId);
  const [focus, setFocus] = useState(root.id);
  const folded = collapsed ?? internalFold;
  const open = openId === undefined ? internalOpen : openId;
  const live = root.status === 'running';
  const clock = useTickingNow(live, startedAt != null ? (now ?? Date.now() - startedAt) : now);
  const hidden = new Set(folded);
  const rows = flatten(root, 0, hidden, []);
  const totals = rollup(root);
  const axis = Math.max(minRange ?? 10 * 1000, live ? clock : totals.end);
  const slowest = useMemo(() => {
    let best: TraceSpan | undefined;
    const visit = (span: TraceSpan) => {
      if ((span.kind === 'llm' || span.kind === 'tool') && span.end != null) {
        const duration = span.end - span.start;
        if (!best || duration > (best.end ?? 0) - best.start) best = span;
      }
      span.children?.forEach(visit);
    };
    visit(root);
    return best;
  }, [root]);
  const current = open ? findSpan(root, open) : undefined;

  function setFolded(next: string[]) {
    if (collapsed === undefined) setInternalFold(next);
    onCollapsedChange?.(next);
  }

  function setOpen(id: string | null, span?: TraceSpan) {
    if (openId === undefined) setInternalOpen(id);
    onOpenChange?.(id, span);
  }

  function onRowKey(event: KeyboardEvent<HTMLDivElement>, span: TraceSpan, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocus(rows[Math.min(rows.length - 1, index + 1)]?.span.id ?? span.id);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocus(rows[Math.max(0, index - 1)]?.span.id ?? span.id);
    }
    if (event.key === 'Home') setFocus(rows[0]?.span.id ?? span.id);
    if (event.key === 'End') setFocus(rows[rows.length - 1]?.span.id ?? span.id);
    if (event.key === 'ArrowRight' && span.children?.length) {
      if (folded.includes(span.id)) setFolded(folded.filter((id) => id !== span.id));
      else setFocus(span.children[0]!.id);
    }
    if (event.key === 'ArrowLeft') {
      if (span.children?.length && !folded.includes(span.id)) setFolded([...folded, span.id]);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(open === span.id ? null : span.id, span);
    }
    if (event.key === 'Escape') setOpen(null);
  }

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">
          {title}
          {root.input ? ` · ${root.input}` : ''}
        </Heading>
        <Text variant="caption" tone="muted" aria-live="polite">
          {live ? '实时' : root.status === 'failed' ? '失败' : '完成'} · {formatDuration(axis / 1000)} ·{' '}
          {formatCost(totals.cost)} · {Math.round(totals.tokens / 100) / 10}k tokens
        </Text>
      </Inline>
      <div role="tree" className="grid gap-1">
        {rows.map(({ span, depth }, index) => {
          const end = span.end ?? clock;
          const left = `${(span.start / axis) * 100}%`;
          const width = `${Math.max(2, ((end - span.start) / axis) * 100)}%`;
          const own = rollup(span);
          return (
            <div
              key={span.id}
              role="treeitem"
              tabIndex={focus === span.id ? 0 : -1}
              aria-level={depth + 1}
              aria-expanded={span.children?.length ? !folded.includes(span.id) : undefined}
              aria-label={`${span.name} ${span.kind} ${span.status} ${formatDuration((end - span.start) / 1000)} ${formatCost(own.cost)}`}
              className={cn(
                'grid gap-1 rounded-[var(--rui-radius)] px-1 py-1 focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring @md:grid-cols-[minmax(0,var(--rui-container-xs))_minmax(0,1fr)]',
                focus === span.id && 'bg-muted',
              )}
              onClick={() => {
                setFocus(span.id);
                setOpen(open === span.id ? null : span.id, span);
              }}
              onKeyDown={(event) => onRowKey(event, span, index)}
            >
              <Inline>
                {span.children?.length ? (
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={folded.includes(span.id) ? '展开' : '折叠'}
                    onClick={(event) => {
                      event.stopPropagation();
                      setFolded(
                        folded.includes(span.id)
                          ? folded.filter((id) => id !== span.id)
                          : [...folded, span.id],
                      );
                    }}
                  >
                    <ChevronDown className={cn('size-3', folded.includes(span.id) && '-rotate-90')} />
                  </Button>
                ) : (
                  <span className="size-6" />
                )}
                {span.icon}
                <Text as="span" variant="interface">
                  {span.name}
                </Text>
                {span.detail ? (
                  <Text as="span" variant="caption" tone="muted" className="@min-[360px]:inline hidden">
                    {span.detail}
                  </Text>
                ) : null}
                {markSlowest && slowest?.id === span.id ? <Badge variant="secondary">最慢</Badge> : null}
                <Text as="span" variant="caption" tone="muted">
                  {formatDuration((end - span.start) / 1000)} · {formatCost(own.cost)}
                </Text>
              </Inline>
              <div className="relative h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div
                  className={cn(
                    'absolute top-0 h-full rounded-full',
                    span.status === 'failed' ? 'bg-destructive' : kindTone[span.kind],
                  )}
                  style={{ left, width }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {current ? (
        <aside
          role="dialog"
          aria-label={current.name}
          className="grid gap-2 rounded-[var(--rui-radius)] border border-border bg-muted p-[var(--rui-content-padding)]"
        >
          <Inline className="justify-between">
            <Text variant="interface">{current.name}</Text>
            <Button type="button" size="icon-xs" variant="ghost" aria-label="关闭" onClick={() => setOpen(null)}>
              <X />
            </Button>
          </Inline>
          <Stack gap="small">
            {current.input ? <Text variant="caption">输入：{current.input}</Text> : null}
            {current.output ? <Text variant="caption">输出：{current.output}</Text> : null}
            {current.error ? <Text variant="caption" className="text-destructive">{current.error}</Text> : null}
            <Text variant="caption" tone="muted">
              {(current.tokensIn ?? 0) + (current.tokensOut ?? 0)} tokens
              {current.model ? ` · ${current.model}` : ''}
            </Text>
          </Stack>
        </aside>
      ) : null}
    </section>
  );
}
