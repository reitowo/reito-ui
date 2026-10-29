import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatClock, formatDollars, formatDuration } from '../shared.js';

export type FanoutStatus = 'queued' | 'running' | 'retrying' | 'done' | 'failed';
export type FanoutTask = {
  id: string;
  label: string;
  status: FanoutStatus;
  worker?: string;
  start?: number;
  end?: number;
  cost?: number;
  attempts?: number;
  result?: string;
  error?: string;
};
export type FanoutGridProps = {
  tasks: FanoutTask[];
  job?: string;
  workers?: number;
  now?: number;
  onRetry?: (ids: string[]) => void;
  onSelect?: (task: FanoutTask | null) => void;
  formatCost?: (amount: number) => string;
  title?: string;
  icon?: ReactNode;
  className?: string;
};

const statusLabel: Record<FanoutStatus, string> = {
  queued: '排队',
  running: '运行',
  retrying: '重试',
  done: '完成',
  failed: '失败',
};

/** Recreated from public Fan-out Grid docs. Not Pro source. */
export function FanoutGrid({
  tasks,
  job,
  workers,
  now,
  onRetry,
  onSelect,
  formatCost = formatDollars,
  title = '分发',
  icon,
  className,
}: FanoutGridProps) {
  const clock = now ?? 0;
  const [cursor, setCursor] = useState(0);
  const [pinned, setPinned] = useState<string | null>(null);
  const [filter, setFilter] = useState<FanoutStatus | 'all'>('all');
  const visible = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
  const current = visible[Math.min(cursor, Math.max(0, visible.length - 1))];
  const open = pinned ? (tasks.find((task) => task.id === pinned) ?? current) : current;
  const failed = tasks.filter((task) => task.status === 'failed');
  const done = tasks.filter((task) => task.status === 'done');
  const running = tasks.filter((task) => task.status === 'running' || task.status === 'retrying');
  const cost = tasks.reduce((sum, task) => sum + (task.cost ?? 0), 0);
  const slots = workers ?? Math.max(1, running.length);
  const finished = done.filter((task) => task.end != null && task.start != null);
  const average =
    finished.length >= 3
      ? finished.reduce((sum, task) => sum + ((task.end ?? 0) - (task.start ?? 0)), 0) /
        finished.length
      : 0;
  const remaining = tasks.filter(
    (task) => task.status === 'queued' || task.status === 'running' || task.status === 'retrying',
  );
  const eta = average ? Math.round((remaining.length * average) / slots) : 0;
  const progress = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  const counts = useMemo(
    () => ({
      all: tasks.length,
      queued: tasks.filter((task) => task.status === 'queued').length,
      running: running.length,
      retrying: tasks.filter((task) => task.status === 'retrying').length,
      done: done.length,
      failed: failed.length,
    }),
    [tasks, running.length, done.length, failed.length],
  );

  function move(event: KeyboardEvent) {
    const cols = Math.max(1, Math.round(Math.sqrt(visible.length)));
    const next = {
      ArrowLeft: cursor - 1,
      ArrowRight: cursor + 1,
      ArrowUp: cursor - cols,
      ArrowDown: cursor + cols,
      Home: 0,
      End: visible.length - 1,
    }[event.key];
    if (next == null) return;
    event.preventDefault();
    setCursor(Math.max(0, Math.min(visible.length - 1, next)));
  }

  function pick(task: FanoutTask | null) {
    setPinned(task && pinned === task.id ? null : (task?.id ?? null));
    onSelect?.(task && pinned === task.id ? null : task);
  }

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Inline>
          {icon}
          <Heading size="item">{title}</Heading>
          {job ? (
            <Text variant="caption" tone="muted">
              {job}
            </Text>
          ) : null}
        </Inline>
        <Inline>
          <Badge variant="secondary">{progress}%</Badge>
          {eta ? (
            <Text variant="caption" tone="muted">
              剩余 {formatDuration(Math.round(eta / 1000))}
            </Text>
          ) : null}
          <Text variant="caption" tone="muted">
            {formatCost(cost)}
          </Text>
          {onRetry && failed.length ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onRetry(failed.map((task) => task.id))}
            >
              重试失败
            </Button>
          ) : null}
        </Inline>
      </Inline>
      <div
        role="grid"
        tabIndex={0}
        aria-label={title}
        aria-describedby="affect-fanout-detail"
        className="grid grid-cols-[repeat(auto-fill,minmax(var(--rui-space-6),1fr))] gap-1 outline-none focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring"
        onKeyDown={(event) => {
          move(event);
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            pick(current);
          }
          if (event.key === 'Escape') pick(null);
        }}
      >
        {visible.map((task, index) => (
          <button
            key={task.id}
            type="button"
            tabIndex={-1}
            aria-label={`${task.label}，${statusLabel[task.status]}`}
            className={cn(
              'aspect-square rounded-[var(--rui-radius-2xs)] border border-border bg-muted',
              task.status === 'running' && 'bg-primary/40',
              task.status === 'retrying' && 'bg-warning/40',
              task.status === 'done' && 'bg-success/50',
              task.status === 'failed' && 'bg-destructive/40',
              current?.id === task.id && 'ring-[length:var(--rui-focus-width)] ring-ring',
            )}
            onClick={() => {
              setCursor(index);
              pick(task);
            }}
          />
        ))}
      </div>
      <Inline>
        {(['all', 'queued', 'running', 'done', 'failed'] as const).map((key) => (
          <Button
            key={key}
            type="button"
            size="xs"
            variant={filter === key ? 'secondary' : 'ghost'}
            aria-pressed={filter === key}
            onClick={() => {
              setFilter(key);
              setCursor(0);
            }}
          >
            {key === 'all' ? '全部' : statusLabel[key]} {counts[key]}
          </Button>
        ))}
      </Inline>
      <Text id="affect-fanout-detail" variant="caption" tone="muted" aria-live="polite">
        {open
          ? `${open.label} · ${statusLabel[open.status]}${open.worker ? ` · ${open.worker}` : ''}${
              open.end != null && open.start != null
                ? ` · ${formatClock(Math.round((open.end - open.start) / 1000))}`
                : ''
            }${open.attempts && open.attempts > 1 ? ` · 第 ${open.attempts} 次` : ''}${
              open.result ? ` · ${open.result}` : ''
            }${open.error ? ` · ${open.error}` : ''}`
          : `${slots} 名工作者 · 时钟 ${formatDuration(Math.round(clock / 1000))}`}
      </Text>
    </section>
  );
}
