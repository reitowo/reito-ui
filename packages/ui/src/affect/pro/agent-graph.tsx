import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDollars, initials, useTickingNow } from '../shared.js';

export type GraphKind = 'agent' | 'tool' | 'user';
export type GraphStatus = 'idle' | 'working' | 'waiting' | 'error' | 'done';
export type GraphNode = {
  id: string;
  name: string;
  kind: GraphKind;
  short?: string;
  icon?: ReactNode;
  detail?: string;
  status?: GraphStatus;
  doing?: string;
  cost?: number;
  lead?: boolean;
};
export type GraphCall = {
  id: string;
  from: string;
  to: string;
  at: number;
  status?: 'pending' | 'ok' | 'error';
  label?: string;
  ms?: number;
};
export type AgentGraphProps = {
  nodes: GraphNode[];
  calls?: GraphCall[];
  edges?: [string, string][];
  now?: number;
  heatWindow?: number;
  onSelect?: (node: GraphNode | null) => void;
  formatCost?: (amount: number) => string;
  title?: string;
  className?: string;
};

const statusLabel: Record<GraphStatus, string> = {
  idle: '空闲',
  working: '工作中',
  waiting: '需要你',
  error: '失败',
  done: '完成',
};

/** Recreated from public Agent Graph docs. Not Pro source. */
export function AgentGraph({
  nodes,
  calls = [],
  edges = [],
  now,
  heatWindow,
  onSelect,
  formatCost = formatDollars,
  title = '代理图',
  className,
}: AgentGraphProps) {
  const windowMs = heatWindow ?? 20 * 1000;
  const clock = useTickingNow(true, now);
  const [openId, setOpenId] = useState<string | null>(null);
  const lead = nodes.find((node) => node.lead) ?? nodes.find((node) => node.kind === 'agent');
  const agents = nodes.filter((node) => node.kind === 'agent' && node.id !== lead?.id);
  const outer = nodes.filter((node) =>
    node.kind !== 'agent' || node.id === lead?.id ? node.kind !== 'agent' : false,
  );
  const links = useMemo(() => {
    const set = new Map<string, { from: string; to: string; heat: number }>();
    for (const [from, to] of edges) set.set(`${from}:${to}`, { from, to, heat: 0 });
    for (const call of calls) {
      const key = `${call.from}:${call.to}`;
      const current = set.get(key) ?? { from: call.from, to: call.to, heat: 0 };
      if (clock - call.at <= windowMs) current.heat += 1;
      set.set(key, current);
    }
    return [...set.values()];
  }, [calls, edges, clock, windowMs]);
  const perMinute = calls.filter((call) => clock - call.at <= 60 * 1000).length;
  const cost = nodes.reduce((sum, node) => sum + (node.cost ?? 0), 0);
  const waiting = nodes.filter((node) => node.status === 'waiting');
  const failed = nodes.filter((node) => node.status === 'error');
  const open = nodes.find((node) => node.id === openId);

  function select(node: GraphNode | null) {
    setOpenId(node?.id ?? null);
    onSelect?.(node);
  }

  function nodeButton(node: GraphNode) {
    const recent = calls.filter(
      (call) => (call.from === node.id || call.to === node.id) && clock - call.at <= 60 * 1000,
    ).length;
    return (
      <button
        key={node.id}
        type="button"
        aria-expanded={openId === node.id}
        aria-label={`${node.name}，${node.kind}，${node.status ? statusLabel[node.status] : '空闲'}。${node.doing ?? ''} 近一分钟 ${recent} 次调用`}
        className={cn(
          'grid min-w-[var(--rui-space-16)] place-items-center gap-1 rounded-[var(--rui-radius)] border border-border bg-card p-2 text-center',
          node.status === 'waiting' && 'border-warning',
          node.status === 'error' && 'border-destructive',
          node.status === 'working' && 'border-primary',
        )}
        onClick={() => select(openId === node.id ? null : node)}
      >
        <span className="grid size-8 place-items-center rounded-full bg-muted text-[length:var(--rui-font-caption)]">
          {node.icon ?? initials(node.name)}
        </span>
        <Text as="span" variant="caption">
          {node.short ?? node.name}
        </Text>
        {node.status && node.status !== 'idle' ? (
          <Badge variant={node.status === 'error' ? 'destructive' : 'secondary'}>
            {statusLabel[node.status]}
          </Badge>
        ) : null}
      </button>
    );
  }

  return (
    <section
      className={cn(
        'grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Text variant="caption" tone="muted" aria-live="polite">
          {nodes.filter((node) => node.kind === 'agent').length} 个代理 ·{' '}
          {nodes.filter((node) => node.kind === 'tool').length} 个工具 · {perMinute} 次/分 ·{' '}
          {formatCost(cost)}
        </Text>
      </Inline>
      <Inline>
        {waiting.map((node) => (
          <Badge key={node.id} variant="secondary">
            需要你 · {node.name}
          </Badge>
        ))}
        {failed.map((node) => (
          <Badge key={node.id} variant="destructive">
            失败 · {node.name}
          </Badge>
        ))}
      </Inline>
      <div className="grid justify-items-center gap-[var(--rui-content-gap)]">
        {lead ? nodeButton(lead) : null}
        <div className="flex flex-wrap justify-center gap-2">{agents.map(nodeButton)}</div>
        <div className="flex flex-wrap justify-center gap-2">{outer.map(nodeButton)}</div>
      </div>
      <ul className="sr-only">
        {nodes.map((node) => (
          <li key={node.id}>
            {node.name}（{node.kind}
            {node.status ? `，${statusLabel[node.status]}` : ''}）：
            {node.doing ?? node.detail ?? ''} 成本 {formatCost(node.cost ?? 0)}。
          </li>
        ))}
      </ul>
      <Text variant="caption" tone="muted">
        {links.length} 条连接
        {links[0] ? ` · 最近 ${links[0].from} → ${links[0].to}` : ''}
      </Text>
      {open ? (
        <aside
          role="dialog"
          aria-label={open.name}
          className="rounded-[var(--rui-radius)] bg-muted p-2"
        >
          <Stack gap="small">
            <Inline className="justify-between">
              <Text variant="interface">{open.name}</Text>
              <Button type="button" size="xs" variant="ghost" onClick={() => select(null)}>
                关闭
              </Button>
            </Inline>
            <Text variant="caption" tone="muted">
              {open.detail}
              {open.doing ? ` · ${open.doing}` : ''}
            </Text>
          </Stack>
        </aside>
      ) : null}
    </section>
  );
}
