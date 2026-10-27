import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Switch } from '../../primitives/switch.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { formatClock, formatDollars, useTickingNow } from '../shared.js';

export type DelegateMode = 'auto' | 'manual';
export type DelegateAgent = {
  id: string;
  name: string;
  model?: string;
  avatar?: ReactNode;
  current?: number;
  rate?: number;
};
export type DelegateTask = {
  id: string;
  title: string;
  estimate: number;
  tools?: ReactNode[];
  agentId?: string | null;
};
export type DelegateBoardProps = {
  agents: DelegateAgent[];
  tasks: DelegateTask[];
  formatCost?: (amount: number) => string;
  onAssign?: (taskId: string, agentId: string | null) => void;
  mode?: DelegateMode;
  defaultMode?: DelegateMode;
  onModeChange?: (mode: DelegateMode) => void;
  suggestion?: { taskId: string; agentId: string } | null;
  now?: number;
  title?: string;
  className?: string;
};

function busyMinutes(agent: DelegateAgent, tasks: DelegateTask[]) {
  const mine = tasks.filter((task) => task.agentId === agent.id);
  return (
    (agent.current ?? mine[0]?.estimate ?? 0) +
    mine.slice(agent.current ? 0 : 1).reduce((sum, task) => sum + task.estimate, 0)
  );
}

/** Recreated from public Delegate Board docs. Not Pro source. */
export function DelegateBoard({
  agents,
  tasks,
  formatCost = formatDollars,
  onAssign,
  mode,
  defaultMode = 'manual',
  onModeChange,
  suggestion,
  now,
  title = '委派',
  className,
}: DelegateBoardProps) {
  const clock = useTickingNow(true, now);
  const [internal, setInternal] = useState(tasks);
  const [internalMode, setInternalMode] = useState(defaultMode);
  const [held, setHeld] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);
  const items = onAssign ? tasks : internal;
  const routing = mode ?? internalMode;
  const unassigned = items.filter((task) => !task.agentId);

  function assign(taskId: string, agentId: string | null) {
    if (!onAssign) {
      setInternal((current) =>
        current.map((task) => (task.id === taskId ? { ...task, agentId } : task)),
      );
    }
    onAssign?.(taskId, agentId);
    setHeld(null);
  }

  function setRouting(next: DelegateMode) {
    if (mode === undefined) setInternalMode(next);
    onModeChange?.(next);
  }

  useEffect(() => {
    if (routing !== 'auto') return;
    const next = unassigned[0];
    if (!next) return;
    const timer = window.setTimeout(() => {
      const free = [...agents].sort(
        (left, right) => busyMinutes(left, items) - busyMinutes(right, items),
      )[0];
      if (free) assign(next.id, free.id);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [routing, unassigned, agents, items]);

  function onKey(event: KeyboardEvent, task: DelegateTask) {
    if (event.key === 'Enter') {
      if (held === task.id) assign(task.id, agents[highlight]?.id ?? null);
      else {
        setHeld(task.id);
        setHighlight(0);
      }
    }
    if (held === task.id && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      setHighlight((value) =>
        event.key === 'ArrowDown' ? Math.min(agents.length - 1, value + 1) : Math.max(0, value - 1),
      );
    }
    if (/^[1-9]$/.test(event.key)) {
      const agent = agents[Number(event.key) - 1];
      if (agent) assign(task.id, agent.id);
    }
    if (event.key === 'Escape') setHeld(null);
  }

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Inline>
          <Label htmlFor="affect-delegate-auto">自动</Label>
          <Switch
            id="affect-delegate-auto"
            checked={routing === 'auto'}
            onCheckedChange={(checked) => setRouting(checked ? 'auto' : 'manual')}
          />
        </Inline>
      </Inline>
      <div className="grid gap-[var(--rui-content-gap)] @md:grid-cols-[minmax(0,var(--rui-container-3xs))_minmax(0,1fr)]">
        <section aria-label="未分配" className="grid gap-1">
          <Text variant="interface">未分配 {unassigned.length}</Text>
          <ul className="grid gap-1">
            {unassigned.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  draggable
                  aria-pressed={held === task.id}
                  aria-describedby="affect-delegate-hint"
                  className={cn(
                    'w-full rounded-[var(--rui-radius)] border border-border p-2 text-left',
                    held === task.id && 'border-ring',
                    suggestion?.taskId === task.id && 'bg-muted',
                  )}
                  onClick={() => setHeld(held === task.id ? null : task.id)}
                  onKeyDown={(event) => onKey(event, task)}
                  onDragStart={() => setHeld(task.id)}
                >
                  <Text as="span" variant="interface">
                    {task.title}
                  </Text>
                  <Text as="span" variant="caption" tone="muted">
                    {' '}
                    {task.estimate} 分钟
                  </Text>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="代理" className="grid gap-2 @min-[720px]:grid-cols-2">
          {agents.map((agent, index) => {
            const queue = items.filter((task) => task.agentId === agent.id);
            const minutes = busyMinutes(agent, items);
            const until = formatClock(
              Math.round((clock + minutes * 60 * 1000 - Date.now()) / 1000),
            );
            const cost = agent.rate ? agent.rate * minutes : 0;
            const preview = held
              ? minutes + (items.find((task) => task.id === held)?.estimate ?? 0)
              : minutes;
            return (
              <div
                key={agent.id}
                className={cn(
                  'grid gap-1 rounded-[var(--rui-radius)] border border-border p-2',
                  (held && highlight === index) || suggestion?.agentId === agent.id
                    ? 'border-ring'
                    : '',
                )}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => held && assign(held, agent.id)}
              >
                <Inline className="justify-between">
                  <Inline>
                    <span className="text-muted-foreground">{index + 1}</span>
                    {agent.avatar}
                    <Text variant="interface">{agent.name}</Text>
                  </Inline>
                  <Badge variant="secondary">{agent.model ?? '模型'}</Badge>
                </Inline>
                <Text variant="caption" tone="muted">
                  忙到 {until}
                  {held ? ` → ${preview} 分钟` : ''}
                  {cost ? ` · ${formatCost(cost)}` : ''}
                </Text>
                <ul aria-label={agent.name} className="grid gap-1">
                  {queue.slice(0, 3).map((task, taskIndex) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        className="w-full rounded-[var(--rui-radius)] bg-muted px-2 py-1 text-left"
                        onClick={() => assign(task.id, null)}
                        onKeyDown={(event) => onKey(event, task)}
                      >
                        <Text as="span" variant="caption">
                          {taskIndex === 0 ? '进行中 · ' : ''}
                          {task.title}
                        </Text>
                      </button>
                    </li>
                  ))}
                  {queue.length > 3 ? (
                    <li>
                      <Text variant="caption" tone="muted">
                        +{queue.length - 3}
                      </Text>
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </section>
      </div>
      <Text id="affect-delegate-hint" variant="caption" tone="muted" aria-live="polite">
        {held
          ? `已拿起任务，按 1–${agents.length} 交给对应代理，或再按 Enter。`
          : '点任务拿起，再点代理或按数字键分配。'}
      </Text>
    </section>
  );
}
