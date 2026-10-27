import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDuration, useTickingNow } from '../shared.js';

export type QueueJob = {
  id: string;
  name: string;
  kind: 'llm' | 'tool' | 'agent' | 'human';
  status: 'queued' | 'running' | 'done' | 'failed';
  enqueuedAt: number;
  priority?: 'high' | 'normal' | 'low';
  startedAt?: number;
  endedAt?: number;
  worker?: string;
  progress?: number;
  estimate?: number;
  attempt?: number;
  maxAttempts?: number;
  detail?: string;
  icon?: ReactNode;
  error?: string;
};
export type QueueWorker = { id: string; name: string; detail?: string; icon?: ReactNode };
export type AgentQueueProps = {
  jobs: QueueJob[];
  workers: QueueWorker[];
  now?: number;
  rateLimits?: { from: number; until: number; label?: string }[];
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  onConcurrencyChange?: (workers: number) => void;
  minConcurrency?: number;
  maxConcurrency?: number;
  backpressure?: number;
  window?: number;
  totals?: { done?: number; failed?: number };
  openId?: string | null;
  defaultOpenId?: string | null;
  onOpenChange?: (id: string | null, job?: QueueJob) => void;
  onPromote?: (job: QueueJob) => void;
  onCancel?: (job: QueueJob) => void;
  title?: string;
  name?: string;
  className?: string;
};

/** Recreated from public Agent Queue docs. Not Pro source. */
export function AgentQueue({
  jobs,
  workers,
  now,
  rateLimits = [],
  paused,
  onPausedChange,
  onConcurrencyChange,
  minConcurrency = 1,
  maxConcurrency = 8,
  backpressure,
  window: history,
  totals,
  openId,
  defaultOpenId = null,
  onOpenChange,
  onPromote,
  onCancel,
  title = '队列',
  name,
  className,
}: AgentQueueProps) {
  const clock = useTickingNow(true, now);
  const [internalOpen, setInternalOpen] = useState<string | null>(defaultOpenId);
  const [internalPause, setInternalPause] = useState(false);
  const [slots, setSlots] = useState(workers.length);
  const open = openId === undefined ? internalOpen : openId;
  const stop = paused ?? internalPause;
  const limited = rateLimits.find((item) => clock >= item.from && clock < item.until);
  const queued = jobs.filter((job) => job.status === 'queued');
  const running = jobs.filter((job) => job.status === 'running');
  const done = totals?.done ?? jobs.filter((job) => job.status === 'done').length;
  const failed = totals?.failed ?? jobs.filter((job) => job.status === 'failed').length;
  const waitingHigh = backpressure != null && queued.length > backpressure;
  const current = jobs.find((job) => job.id === open);
  const span = history ?? 120 * 1000;
  const depth = useMemo(() => queued.length, [queued.length]);

  function setOpen(id: string | null, job?: QueueJob) {
    if (openId === undefined) setInternalOpen(id);
    onOpenChange?.(id, job);
  }

  function setPause(next: boolean) {
    if (paused === undefined) setInternalPause(next);
    onPausedChange?.(next);
  }

  function setWorkers(next: number) {
    const value = Math.min(maxConcurrency, Math.max(minConcurrency, next));
    setSlots(value);
    onConcurrencyChange?.(value);
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
          {name ? ` · ${name}` : ''}
        </Heading>
        <Inline>
          {limited ? (
            <Badge variant="secondary">
              限流 · {formatDuration(Math.max(0, Math.round((limited.until - clock) / 1000)))}
            </Badge>
          ) : null}
          {onPausedChange || paused !== undefined ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              aria-pressed={stop}
              onClick={() => setPause(!stop)}
            >
              {stop ? '继续' : '暂停'}
            </Button>
          ) : null}
          {onConcurrencyChange ? (
            <Inline>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-label="减少工作者"
                onClick={() => setWorkers(slots - 1)}
              >
                −
              </Button>
              <Text as="span" variant="caption">
                {slots}
              </Text>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-label="增加工作者"
                onClick={() => setWorkers(slots + 1)}
              >
                +
              </Button>
            </Inline>
          ) : null}
        </Inline>
      </Inline>
      <div className="grid gap-2 @md:grid-cols-4">
        <Text variant="caption" className={waitingHigh ? 'text-warning' : undefined}>
          等待 {queued.length}
        </Text>
        <Text variant="caption">
          运行 {running.length}/{workers.length}
        </Text>
        <Text variant="caption">完成 {done}</Text>
        <Text variant="caption">失败 {failed}</Text>
      </div>
      <div className="grid gap-[var(--rui-content-gap)] @md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Stack gap="small">
          <Text variant="interface">等待</Text>
          <ul className="grid gap-1">
            {queued.map((job, index) => (
              <li key={job.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[var(--rui-radius)] border border-border px-2 py-1 text-left"
                  onClick={() => setOpen(open === job.id ? null : job.id, job)}
                >
                  <span>
                    {job.icon} {job.name}
                    {job.priority === 'high' ? ' · 优先' : ''}
                    {job.attempt && job.attempt > 1 ? ` · 重试 ${job.attempt}` : ''}
                  </span>
                  <Text as="span" variant="caption" tone="muted">
                    #{index + 1}
                  </Text>
                </button>
              </li>
            ))}
          </ul>
        </Stack>
        <Stack gap="small">
          <Text variant="interface">工作者 {workers.length}</Text>
          <ul className="grid gap-1">
            {workers.map((worker) => {
              const job = running.find((item) => item.worker === worker.id);
              const width = `${Math.round((job?.progress ?? 0) * 100)}%`;
              return (
                <li key={worker.id} className="grid gap-1 rounded-[var(--rui-radius)] bg-muted p-2">
                  <Inline className="justify-between">
                    <Text as="span" variant="caption">
                      {worker.icon} {worker.name}
                    </Text>
                    <Text as="span" variant="caption" tone="muted">
                      {job?.name ?? '空闲'}
                    </Text>
                  </Inline>
                  {job ? (
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-background"
                      aria-hidden="true"
                    >
                      <div
                        className={cn(
                          'h-full rounded-full',
                          limited || stop ? 'bg-warning' : 'bg-primary',
                        )}
                        style={{ width }}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Stack>
      </div>
      <Text variant="caption" tone="muted">
        队列深度 {depth}，回看 {formatDuration(span / 1000)}
        {limited ? `。${limited.label ?? '限流中'}` : ''}
      </Text>
      {current ? (
        <aside
          role="dialog"
          aria-label={current.name}
          className="rounded-[var(--rui-radius)] border border-border p-2"
        >
          <Stack gap="small">
            <Inline className="justify-between">
              <Text variant="interface">{current.name}</Text>
              <Button type="button" size="xs" variant="ghost" onClick={() => setOpen(null)}>
                关闭
              </Button>
            </Inline>
            {current.detail || current.error ? (
              <Text variant="caption" className={current.error ? 'text-destructive' : undefined}>
                {current.error ?? current.detail}
              </Text>
            ) : null}
            <Inline>
              {onPromote && current.status === 'queued' ? (
                <Button type="button" size="xs" onClick={() => onPromote(current)}>
                  移到最前
                </Button>
              ) : null}
              {onCancel ? (
                <Button type="button" size="xs" variant="outline" onClick={() => onCancel(current)}>
                  取消
                </Button>
              ) : null}
            </Inline>
          </Stack>
        </aside>
      ) : null}
    </section>
  );
}
