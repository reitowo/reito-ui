import { useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDuration } from '../shared.js';

export type AgentInboxStatus = 'running' | 'waiting' | 'done' | 'failed';
export type AgentInboxView = 'board' | 'list';
export type AgentTask = {
  id: string;
  title: string;
  description?: string;
  agent: string;
  status: AgentInboxStatus;
  startedAt?: number;
  elapsed?: number;
  tools?: number;
  sources?: number;
  steps?: { label: string; time?: string }[];
};
export type AgentInboxProps = {
  tasks: AgentTask[];
  onApprove?: (task: AgentTask) => void;
  onReject?: (task: AgentTask) => void;
  onRetry?: (task: AgentTask) => void;
  onOpen?: (task: AgentTask) => void;
  title?: string;
  view?: AgentInboxView;
  defaultView?: AgentInboxView;
  onViewChange?: (view: AgentInboxView) => void;
  className?: string;
};

const columns: { id: 'needs' | 'running' | 'done'; label: string; match: AgentInboxStatus[] }[] = [
  { id: 'needs', label: '需要你', match: ['waiting', 'failed'] },
  { id: 'running', label: '进行中', match: ['running'] },
  { id: 'done', label: '已完成', match: ['done'] },
];

function clock(task: AgentTask) {
  if (task.elapsed != null) return formatDuration(Math.round(task.elapsed / 1000));
  if (task.startedAt)
    return formatDuration(Math.max(0, Math.round((Date.now() - task.startedAt) / 1000)));
  return '';
}

/** Recreated from public Agent Inbox docs. */
export function AgentInbox({
  tasks,
  onApprove,
  onReject,
  onRetry,
  onOpen,
  title = '代理收件箱',
  view,
  defaultView = 'board',
  onViewChange,
  className,
}: AgentInboxProps) {
  const [internalView, setInternalView] = useState(defaultView);
  const [openId, setOpenId] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, AgentInboxStatus>>({});
  const layout = view ?? internalView;
  const resolved = useMemo(
    () => tasks.map((task) => ({ ...task, status: local[task.id] ?? task.status })),
    [tasks, local],
  );
  const needs = resolved.filter((task) => task.status === 'waiting').length;
  const running = resolved.filter((task) => task.status === 'running').length;

  function setView(next: AgentInboxView) {
    if (view === undefined) setInternalView(next);
    onViewChange?.(next);
  }

  function update(task: AgentTask, status: AgentInboxStatus) {
    setLocal((current) => ({ ...current, [task.id]: status }));
  }

  function Card({ task }: { task: AgentTask }) {
    const expanded = openId === task.id;
    return (
      <article className="rounded-[var(--rui-radius)] border border-border bg-card">
        <button
          type="button"
          aria-expanded={expanded}
          className="grid w-full gap-1 p-[var(--rui-content-padding)] text-left"
          onClick={() => setOpenId(expanded ? null : task.id)}
        >
          <Inline className="justify-between">
            <Heading size="item">{task.title}</Heading>
            <Badge variant={task.status === 'failed' ? 'destructive' : 'secondary'}>
              {task.status}
            </Badge>
          </Inline>
          {task.description ? (
            <Text variant="caption" tone="muted">
              {task.description}
            </Text>
          ) : null}
          <Text variant="caption" tone="muted">
            {task.agent}
            {clock(task) ? ` · ${clock(task)}` : ''}
          </Text>
        </button>
        {expanded ? (
          <Stack gap="small" className="border-t border-border p-[var(--rui-content-padding)]">
            {task.steps?.map((step) => (
              <Text key={step.label} variant="caption">
                {step.label}
                {step.time ? ` · ${step.time}` : ''}
              </Text>
            ))}
            <Inline>
              {task.status === 'waiting' ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onReject?.(task);
                      if (!onReject) update(task, 'failed');
                    }}
                  >
                    拒绝
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onApprove?.(task);
                      if (!onApprove) update(task, 'running');
                    }}
                  >
                    批准
                  </Button>
                </>
              ) : null}
              {task.status === 'failed' ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onRetry?.(task);
                    if (!onRetry) update(task, 'running');
                  }}
                >
                  重试
                </Button>
              ) : null}
              {task.status === 'running' || task.status === 'done' ? (
                <Button type="button" size="sm" variant="ghost" onClick={() => onOpen?.(task)}>
                  打开
                </Button>
              ) : null}
            </Inline>
          </Stack>
        ) : null}
      </article>
    );
  }

  return (
    <section aria-label={title} className={cn('grid gap-[var(--rui-content-gap)]', className)}>
      <Inline className="justify-between">
        <Heading size="item">代理 / {title}</Heading>
        <div role="radiogroup" aria-label="布局" className="flex gap-1">
          <Button
            type="button"
            size="xs"
            variant={layout === 'board' ? 'secondary' : 'ghost'}
            aria-checked={layout === 'board'}
            role="radio"
            onClick={() => setView('board')}
          >
            看板
          </Button>
          <Button
            type="button"
            size="xs"
            variant={layout === 'list' ? 'secondary' : 'ghost'}
            aria-checked={layout === 'list'}
            role="radio"
            onClick={() => setView('list')}
          >
            列表
          </Button>
        </div>
      </Inline>
      <p className="sr-only" aria-live="polite">
        {needs} 项需要你，{running} 项进行中
      </p>
      <div
        className={cn(
          layout === 'board'
            ? 'grid gap-[var(--rui-content-gap)] md:grid-cols-3'
            : 'grid gap-[var(--rui-content-gap)]',
        )}
      >
        {columns.map((column) => {
          const columnTasks = resolved.filter((task) => column.match.includes(task.status));
          return (
            <section
              key={column.id}
              aria-label={column.label}
              className="grid content-start gap-[var(--rui-content-gap-sm)]"
            >
              <Inline>
                <Text as="span" variant="caption" tone="muted">
                  {column.label}
                </Text>
                <Text as="span" variant="caption" tone="muted">
                  {columnTasks.length}
                </Text>
              </Inline>
              {columnTasks.map((task) => (
                <Card key={task.id} task={task} />
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
