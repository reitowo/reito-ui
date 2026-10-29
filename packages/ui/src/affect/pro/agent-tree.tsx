import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, ChevronDown, Clock } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDollars, formatDuration, initials, useTickingNow } from '../shared.js';

export type TreeAgentStatus = 'queued' | 'running' | 'waiting' | 'done' | 'failed' | 'stopped';
export type TreeAgent = {
  id: string;
  name: string;
  task: string;
  model?: string;
  avatar?: ReactNode;
  tools?: ReactNode[];
  status: TreeAgentStatus;
  ask?: string;
  error?: string;
  cost?: number;
  started?: number;
  ended?: number;
  children?: TreeAgent[];
};
export type AgentTreeProps = {
  root: TreeAgent;
  collapsed?: string[];
  defaultCollapsed?: string[];
  onCollapsedChange?: (collapsed: string[]) => void;
  onResolve?: (agent: TreeAgent, action: 'approve' | 'reject' | 'retry' | 'dismiss') => void;
  onSelect?: (agent: TreeAgent) => void;
  now?: number;
  formatCost?: (amount: number) => string;
  title?: string;
  className?: string;
};

const statusLabel: Record<TreeAgentStatus, string> = {
  queued: '排队',
  running: '运行中',
  waiting: '需要你',
  done: '完成',
  failed: '失败',
  stopped: '已停止',
};

function walk(agent: TreeAgent, visit: (item: TreeAgent) => void) {
  visit(agent);
  agent.children?.forEach((child) => walk(child, visit));
}

function branchCost(agent: TreeAgent): number {
  return (
    (agent.cost ?? 0) + (agent.children?.reduce((sum, child) => sum + branchCost(child), 0) ?? 0)
  );
}

/** Recreated from public Agent Tree docs. Not Pro source. */
export function AgentTree({
  root,
  collapsed,
  defaultCollapsed = [],
  onCollapsedChange,
  onResolve,
  onSelect,
  now,
  formatCost = formatDollars,
  title = '代理',
  className,
}: AgentTreeProps) {
  const [internal, setInternal] = useState(defaultCollapsed);
  const [openAsk, setOpenAsk] = useState<string | null>(null);
  const folded = collapsed ?? internal;
  const running =
    root.status === 'running' || Boolean(root.children?.some((item) => item.status === 'running'));
  const clock = useTickingNow(running, now);
  const totals = useMemo(() => {
    let agents = 0;
    let live = 0;
    let needs = 0;
    let failed = 0;
    walk(root, (item) => {
      agents += 1;
      if (item.status === 'running') live += 1;
      if (item.status === 'waiting') needs += 1;
      if (item.status === 'failed') failed += 1;
    });
    return { agents, live, needs, failed, cost: branchCost(root) };
  }, [root]);

  function setFolded(next: string[]) {
    if (collapsed === undefined) setInternal(next);
    onCollapsedChange?.(next);
  }

  function renderAgent(agent: TreeAgent, depth: number) {
    const children = agent.children ?? [];
    const hidden = folded.includes(agent.id);
    const muted = agent.status === 'queued' || agent.status === 'stopped';
    const elapsed =
      agent.started != null
        ? formatDuration(Math.max(0, Math.round(((agent.ended ?? clock) - agent.started) / 1000)))
        : '';
    return (
      <li key={agent.id} role="treeitem" aria-expanded={children.length ? !hidden : undefined}>
        <div
          className={cn(
            'grid gap-1 rounded-[var(--rui-radius)] border border-border bg-card p-2',
            muted && 'opacity-70',
            depth > 0 && 'ml-[var(--rui-content-padding)]',
          )}
        >
          <Inline className="justify-between">
            <Inline>
              <span className="grid size-6 place-items-center rounded-full bg-muted text-[length:var(--rui-font-caption)]">
                {agent.avatar ?? initials(agent.name)}
              </span>
              {onSelect ? (
                <button type="button" className="text-left" onClick={() => onSelect(agent)}>
                  <Text as="span" variant="interface">
                    {agent.name}
                  </Text>
                </button>
              ) : (
                <Text as="span" variant="interface">
                  {agent.name}
                </Text>
              )}
              {agent.model ? (
                <Text as="span" variant="caption" tone="muted">
                  {agent.model}
                </Text>
              ) : null}
            </Inline>
            <Inline>
              <Badge variant={agent.status === 'failed' ? 'destructive' : 'secondary'}>
                {agent.status === 'waiting' ? <Clock className="size-3" /> : null}
                {agent.status === 'failed' ? <AlertTriangle className="size-3" /> : null}
                {agent.status === 'done' ? <Check className="size-3" /> : null}
                {statusLabel[agent.status]}
              </Badge>
              <Text as="span" variant="caption" tone="muted">
                {formatCost(branchCost(agent))}
                {elapsed ? ` · ${elapsed}` : ''}
              </Text>
            </Inline>
          </Inline>
          <Text variant="caption">{agent.task}</Text>
          {agent.tools?.length ? <Inline>{agent.tools}</Inline> : null}
          {agent.status === 'waiting' || agent.status === 'failed' ? (
            <div>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-expanded={openAsk === agent.id}
                onClick={() => setOpenAsk(openAsk === agent.id ? null : agent.id)}
              >
                {agent.status === 'waiting' ? (agent.ask ?? '需要决定') : (agent.error ?? '失败')}
              </Button>
              {openAsk === agent.id ? (
                <Inline>
                  {agent.status === 'waiting' ? (
                    <>
                      <Button type="button" size="xs" onClick={() => onResolve?.(agent, 'approve')}>
                        批准
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => onResolve?.(agent, 'reject')}
                      >
                        拒绝
                      </Button>
                    </>
                  ) : (
                    <Button type="button" size="xs" onClick={() => onResolve?.(agent, 'retry')}>
                      重试
                    </Button>
                  )}
                  <Button type="button" size="xs" variant="ghost" onClick={() => setOpenAsk(null)}>
                    关闭
                  </Button>
                </Inline>
              ) : null}
            </div>
          ) : null}
          {children.length ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              aria-label={`${hidden ? '显示' : '折叠'} ${agent.name} 的 ${children.length} 个子代理`}
              onClick={() =>
                setFolded(hidden ? folded.filter((id) => id !== agent.id) : [...folded, agent.id])
              }
            >
              <ChevronDown className={cn('size-3', hidden && '-rotate-90')} />
              {children.length} 个子代理
            </Button>
          ) : null}
        </div>
        {children.length && !hidden ? (
          <ul
            role="group"
            className="mt-[var(--rui-content-gap-sm)] grid gap-[var(--rui-content-gap-sm)]"
          >
            {children.map((child) => renderAgent(child, depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <section
      className={cn(
        'grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-muted p-[var(--rui-content-gap-sm)]',
        className,
      )}
    >
      <Inline className="justify-between px-1">
        <Heading size="item">{title}</Heading>
        <Text variant="caption" tone="muted" aria-live="polite">
          {totals.agents} 个代理 · {totals.live} 运行 · {totals.needs} 需要你 · {totals.failed} 失败
          · {formatCost(totals.cost)}
        </Text>
      </Inline>
      <ul role="tree" className="grid gap-[var(--rui-content-gap-sm)]">
        {renderAgent(root, 0)}
      </ul>
    </section>
  );
}
