import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDuration, initials, useTickingNow } from '../shared.js';

export type LaneAgent = { id: string; name: string; model?: string; avatar?: ReactNode };
export type LaneTask = {
  id: string;
  agentId: string;
  title: string;
  status: 'done' | 'running' | 'waiting' | 'failed';
  start: number;
  end?: number;
  handoffTo?: string;
  ask?: string;
  summary?: string;
  tools?: ReactNode[];
};
export type AgentLanesProps = {
  agents: LaneAgent[];
  tasks: LaneTask[];
  span?: number;
  now?: number;
  onApprove?: (task: LaneTask) => void;
  onReject?: (task: LaneTask) => void;
  onOpen?: (task: LaneTask) => void;
  title?: string;
  className?: string;
};

const statusLabel = { done: '完成', running: '进行中', waiting: '需要你', failed: '失败' };

/** Recreated from public Agent Lanes docs. Not Pro source. */
export function AgentLanes({
  agents,
  tasks,
  span,
  now,
  onApprove,
  onReject,
  onOpen,
  title = '代理',
  className,
}: AgentLanesProps) {
  const windowMs = span ?? 30 * 60 * 1000;
  const [local, setLocal] = useState<Record<string, LaneTask['status']>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const live = tasks.some((task) => (local[task.id] ?? task.status) === 'running');
  const clock = useTickingNow(live, now);
  const resolved = useMemo(
    () => tasks.map((task) => ({ ...task, status: local[task.id] ?? task.status })),
    [tasks, local],
  );
  const windowEnd = clock;
  const windowStart = windowEnd - windowMs;
  const needs = resolved.filter((task) => task.status === 'waiting').length;
  const running = new Set(
    resolved.filter((task) => task.status === 'running').map((task) => task.agentId),
  ).size;

  function decide(task: LaneTask, status: 'done' | 'failed') {
    if (status === 'done') onApprove?.(task);
    else onReject?.(task);
    if (!onApprove && !onReject) setLocal((current) => ({ ...current, [task.id]: status }));
    setOpenId(null);
  }

  return (
    <section
      className={cn(
        'grid max-w-3xl gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Text variant="caption" tone="muted" aria-live="polite">
          {running} 运行中 · {needs} 需要你 · 最近 {formatDuration(Math.round(windowMs / 1000))}
        </Text>
      </Inline>
      <div className="grid gap-[var(--rui-content-gap-sm)]">
        {agents.map((agent) => {
          const items = resolved.filter((task) => task.agentId === agent.id);
          const waiting = items.some((task) => task.status === 'waiting');
          const idle = !items.some(
            (task) => task.status === 'running' || task.status === 'waiting',
          );
          return (
            <div key={agent.id} className="@container grid gap-1">
              <Inline>
                <span className="grid size-6 place-items-center rounded-full bg-muted text-[length:var(--rui-font-caption)]">
                  {agent.avatar ?? initials(agent.name)}
                </span>
                <Text as="span" variant="interface" className="@sm:inline hidden">
                  {agent.name}
                </Text>
                <Text as="span" variant="caption" tone="muted">
                  {agent.model}
                </Text>
                <Badge variant={waiting ? 'destructive' : 'secondary'}>
                  {waiting ? '需要你' : idle ? '空闲' : '忙碌'}
                </Badge>
              </Inline>
              <ol
                aria-label={agent.name}
                className="relative min-h-[var(--rui-control-height)] overflow-hidden rounded-[var(--rui-radius)] bg-muted"
              >
                {items.map((task) => {
                  const start = Math.max(task.start, windowStart);
                  const end = task.end ?? windowEnd;
                  const left = `${Math.max(0, ((start - windowStart) / windowMs) * 100)}%`;
                  const width = `${Math.max(4, ((end - start) / windowMs) * 100)}%`;
                  return (
                    <li key={task.id} className="contents">
                      <button
                        type="button"
                        style={{ left, width }}
                        className={cn(
                          'absolute top-1 bottom-1 overflow-hidden rounded-[var(--rui-radius-control)] border border-border px-1 text-left',
                          task.status === 'waiting' && 'bg-warning/20',
                          task.status === 'failed' && 'bg-destructive/15',
                          task.status === 'running' && 'bg-primary/15',
                          task.status === 'done' && 'bg-card',
                        )}
                        aria-expanded={openId === task.id}
                        aria-label={`${agent.name} ${task.title} ${statusLabel[task.status]}`}
                        onClick={() => setOpenId(openId === task.id ? null : task.id)}
                      >
                        <span className="block truncate text-[length:var(--rui-font-caption)]">
                          {task.tools}
                          {task.title}
                        </span>
                      </button>
                      {openId === task.id ? (
                        <div
                          role={task.status === 'waiting' ? 'dialog' : 'tooltip'}
                          className="relative mt-[calc(var(--rui-control-height)+var(--rui-content-gap-sm))] rounded-[var(--rui-radius)] border border-border bg-card p-2"
                        >
                          <Stack gap="small">
                            <Text variant="interface">{task.title}</Text>
                            {task.ask || task.summary ? (
                              <Text variant="caption" tone="muted">
                                {task.ask ?? task.summary}
                              </Text>
                            ) : null}
                            {task.status === 'waiting' ? (
                              <Inline>
                                <Button
                                  type="button"
                                  size="xs"
                                  onClick={() => decide(task, 'done')}
                                >
                                  批准
                                </Button>
                                <Button
                                  type="button"
                                  size="xs"
                                  variant="outline"
                                  onClick={() => decide(task, 'failed')}
                                >
                                  拒绝
                                </Button>
                              </Inline>
                            ) : onOpen ? (
                              <Button
                                type="button"
                                size="xs"
                                variant="ghost"
                                onClick={() => onOpen(task)}
                              >
                                打开
                              </Button>
                            ) : null}
                          </Stack>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
